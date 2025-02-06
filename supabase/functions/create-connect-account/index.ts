
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    try {
      if (accountId) {
        // Try to retrieve the existing account
        try {
          console.log('Retrieving existing Stripe account:', accountId);
          const existingAccount = await stripe.accounts.retrieve(accountId);
          console.log('Existing account status:', existingAccount.details_submitted, existingAccount.payouts_enabled);
        } catch (accountError: any) {
          // If account doesn't exist or access was revoked, create a new one
          if (accountError.code === 'account_invalid') {
            console.log('Invalid account, creating new one');
            accountId = null;
          } else {
            throw accountError;
          }
        }
      }

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
        console.log('Created new Stripe account:', accountId);

        // Update the profile with new account ID
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ stripe_account_id: accountId })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
      }

      // Create an account link for onboarding
      console.log('Creating account link for:', accountId);
      const origin = req.headers.get('origin') || '';
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/author/settings?refresh=true`,
        return_url: `${origin}/author/dashboard`,
        type: 'account_onboarding',
      });

      // Get the latest account status
      const account = await stripe.accounts.retrieve(accountId);
      console.log('Current account status:', account.details_submitted, account.payouts_enabled);

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
    } catch (stripeError: any) {
      console.error('Stripe operation error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: stripeError.message,
          code: stripeError.code,
          details: stripeError.stack,
          type: 'stripe_error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
  } catch (error: any) {
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
