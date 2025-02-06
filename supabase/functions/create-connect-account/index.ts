
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
        console.log('Checking existing Stripe account:', accountId);
        const account = await stripe.accounts.retrieve(accountId);
        
        // If account exists but setup is not complete, generate a new account link
        if (!account.details_submitted || !account.payouts_enabled) {
          console.log('Account exists but setup incomplete');
          try {
            const accountLink = await stripe.accountLinks.create({
              account: accountId,
              refresh_url: `${req.headers.get('origin')}/author/settings?refresh=true`,
              return_url: `${req.headers.get('origin')}/author/settings?setup=complete`,
              type: 'account_onboarding',
            });

            return new Response(
              JSON.stringify({ url: accountLink.url, status: 'incomplete_setup' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (linkError) {
            console.error('Error creating account link:', linkError);
            throw linkError;
          }
        }
        
        console.log('Account status:', {
          details_submitted: account.details_submitted,
          payouts_enabled: account.payouts_enabled,
          requirements: account.requirements
        });
        
      } else {
        // Create a new Connect account
        console.log('Creating new Stripe Connect account');
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          metadata: {
            supabaseUserId: user.id,
          },
        });
        accountId = account.id;

        // Update profile with new account ID
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ 
            stripe_account_id: accountId,
            stripe_setup_complete: false
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }

        // Create initial account link for setup
        const accountLink = await stripe.accountLinks.create({
          account: accountId,
          refresh_url: `${req.headers.get('origin')}/author/settings?refresh=true`,
          return_url: `${req.headers.get('origin')}/author/settings?setup=complete`,
          type: 'account_onboarding',
        });

        return new Response(
          JSON.stringify({ 
            url: accountLink.url,
            status: 'new_account',
            accountId: accountId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate account link for existing account updates
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.get('origin')}/author/settings?refresh=true`,
        return_url: `${req.headers.get('origin')}/author/settings?setup=complete`,
        type: 'account_onboarding',
      });

      return new Response(
        JSON.stringify({ 
          url: accountLink.url,
          status: 'update_existing',
          accountId: accountId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      
      // Handle platform setup requirements
      if (stripeError.message?.includes('review the responsibilities')) {
        return new Response(
          JSON.stringify({
            error: 'platform_setup_required',
            message: 'The platform needs to complete Stripe Connect setup. Please contact support.',
            details: stripeError.message
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
      
      // Handle invalid/revoked accounts
      if (stripeError.code === 'account_invalid') {
        console.log('Invalid account, will create new one on next attempt');
        await supabaseClient
          .from('profiles')
          .update({ 
            stripe_account_id: null,
            stripe_setup_complete: false
          })
          .eq('id', user.id);
          
        return new Response(
          JSON.stringify({
            error: 'account_invalid',
            message: 'Your previous account setup was incomplete. Please try connecting again.',
            shouldRetry: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      throw stripeError;
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
