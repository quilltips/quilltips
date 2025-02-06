
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from './config';
import { handlePlatformSetupError, handleInvalidAccountError, handleGenericError } from './error-handlers';
import { createStripeConnectAccount, handleExistingAccount } from './stripe-account';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting create-connect-account function');
    
    // Get the authenticated user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe configuration error');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get existing account info
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, stripe_setup_complete')
      .eq('id', user.id)
      .single();

    console.log('Profile data:', profile);
    let accountId = profile?.stripe_account_id;

    try {
      if (accountId) {
        const result = await handleExistingAccount(stripe, accountId, req.headers.get('origin') || '');
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        const result = await createStripeConnectAccount(
          stripe,
          user.id,
          user.email || '',
          supabaseClient,
          req.headers.get('origin') || ''
        );
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      
      if (stripeError.message?.includes('review the responsibilities')) {
        return handlePlatformSetupError(stripeError);
      }
      
      if (stripeError.code === 'account_invalid') {
        return handleInvalidAccountError(supabaseClient, user.id);
      }

      throw stripeError;
    }
  } catch (error: any) {
    return handleGenericError(error);
  }
});

