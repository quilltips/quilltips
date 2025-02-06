
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      console.error('Stripe secret key not found');
      throw new Error('Stripe configuration error');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Check if user already has a Stripe account
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    console.log('Profile data:', profile);
    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      // Create a new Connect account
      console.log('Creating new Stripe Connect account for user:', user.id);
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: {
          supabaseUserId: user.id,
        },
      });
      accountId = account.id;
      console.log('Created Stripe account:', accountId);

      // Save the account ID to the user's profile
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }
    }

    // Check account status
    const account = await stripe.accounts.retrieve(accountId);
    console.log('Account status:', account.details_submitted, account.payouts_enabled);

    // Create an account link for onboarding
    console.log('Creating account link for:', accountId);
    const origin = req.headers.get('origin') || '';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/author/settings?refresh=true`,
      return_url: `${origin}/author/dashboard`,
      type: 'account_onboarding',
    });

    console.log('Account link created:', accountLink.url);
    
    return new Response(
      JSON.stringify({ 
        url: accountLink.url,
        accountId: accountId,
        status: {
          detailsSubmitted: account.details_submitted,
          payoutsEnabled: account.payouts_enabled,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-connect-account:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
