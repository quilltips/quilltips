
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from './config.ts';

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
    
    console.log('Attempting to get user from token');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      throw new Error('Stripe configuration error');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get existing account info
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id, stripe_setup_complete')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch profile');
    }

    console.log('Profile data:', profile);
    
    try {
      let accountId = profile?.stripe_account_id;
      let accountUrl;

      if (accountId) {
        console.log('Existing Stripe account found:', accountId);
        try {
          // Check if the account exists and get its status
          const account = await stripe.accounts.retrieve(accountId);
          console.log('Account details:', {
            details_submitted: account.details_submitted,
            payouts_enabled: account.payouts_enabled,
            capabilities: account.capabilities
          });
          
          // Update metadata if it doesn't exist
          if (!account.metadata?.supabaseUserId) {
            console.log('Adding supabaseUserId to metadata');
            await stripe.accounts.update(accountId, {
              metadata: { supabaseUserId: user.id }
            });
          }
          
          // Create dashboard link for a fully set up account
          if (account.details_submitted && account.payouts_enabled) {
            console.log('Account is fully setup, creating dashboard link');
            const dashboardLink = await stripe.accounts.createLoginLink(accountId);
            accountUrl = dashboardLink.url;
          } else {
            console.log('Account exists but setup incomplete, creating onboarding link');
            // Create account link for completing setup
            const accountLink = await stripe.accountLinks.create({
              account: accountId,
              refresh_url: `${req.headers.get('origin')}/author/settings?refresh=true`,
              return_url: `${req.headers.get('origin')}/author/settings?setup=complete`,
              type: 'account_onboarding',
            });
            accountUrl = accountLink.url;
          }
        } catch (error) {
          console.error('Error with existing account, will create new one:', error);
          
          // Reset the account ID if it's invalid
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ 
              stripe_account_id: null,
              stripe_setup_complete: false
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error resetting account ID:', updateError);
          }
          
          // Force new account creation
          accountId = null;
        }
      }

      if (!accountId) {
        console.log('Creating new Stripe Connect account');
        // Create a new Connect account with metadata
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          metadata: {
            supabaseUserId: user.id,
          },
        });

        accountId = account.id;
        console.log('New account created:', accountId);

        // Update profile with the new account ID
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ 
            stripe_account_id: account.id,
            stripe_setup_complete: false
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${req.headers.get('origin')}/author/settings?refresh=true`,
          return_url: `${req.headers.get('origin')}/author/settings?setup=complete`,
          type: 'account_onboarding',
        });
        accountUrl = accountLink.url;
      }

      return new Response(
        JSON.stringify({
          url: accountUrl,
          accountId: accountId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      
      return new Response(
        JSON.stringify({
          error: stripeError.message,
          type: 'stripe_error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
  } catch (error: any) {
    console.error('Error in create-connect-account:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.type || 'unknown_error',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
