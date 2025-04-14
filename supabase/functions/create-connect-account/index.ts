import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from './config.ts';
import { handleGenericError, handlePlatformSetupError, handleInvalidAccountError } from './error-handlers.ts';

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

    // Create an admin client for database operations that need elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    console.log('Attempting to get user from token');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id, 'with email:', user.email);

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

    // Get existing account info - use maybeSingle() instead of single()
    console.log('Fetching profile data for user:', user.id);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, stripe_setup_complete, name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch profile');
    }

    // Check if profile exists - it should based on our auth triggers, but handle the case if it doesn't
    if (!profile) {
      console.log('Profile not found, creating a basic profile');
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'author'
        });

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        throw new Error('Failed to create profile');
      }
    }

    console.log('Profile data:', profile || 'Will use new profile');
    
    try {
      let accountId = profile?.stripe_account_id;
      let accountUrl;
      let accountExists = false;

      if (accountId) {
        console.log('Existing Stripe account found:', accountId);
        try {
          // Check if the account exists and get its status
          const account = await stripe.accounts.retrieve(accountId);
          accountExists = true;
          
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
              refresh_url: `${req.headers.get('origin')}/author/dashboard?refresh=true`,
              return_url: `${req.headers.get('origin')}/author/dashboard?setup=complete`,
              type: 'account_onboarding',
            });
            accountUrl = accountLink.url;
          }
        } catch (error) {
          console.error('Error with existing account, will create new one:', error);
          // Reset the account ID as it's invalid and we'll create a new one
          accountExists = false;
        }
      }

      if (!accountExists) {
        console.log('Creating new Stripe Connect account with prefilled information');
        
        // Create a new Connect account with enhanced prefilled data
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email, // Use the authenticated user's email from auth
          business_type: 'individual',
          capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true },
          },
          business_profile: {
            mcc: '5942', // Books, periodicals, and newspapers
            url: 'https://quilltips.co',
            product_description: 'Author receiving tips',
          },
          metadata: {
            supabaseUserId: user.id,
          },
        });

        accountId = account.id;
        console.log('New account created:', accountId);

        // Update profile with the new account ID - using supabaseAdmin with service role key
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            stripe_account_id: account.id,
            stripe_setup_complete: false
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile with Stripe account ID:', updateError);
          // Even if update fails, continue to create the onboarding link
          // We'll attempt to repair this in a future session
        } else {
          console.log('Profile updated with new Stripe account ID:', account.id);
        }

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${req.headers.get('origin')}/author/dashboard?refresh=true`,
          return_url: `${req.headers.get('origin')}/author/dashboard?setup=complete`,
          type: 'account_onboarding',
        });
        accountUrl = accountLink.url;
      }

      // Double-check that the account ID is properly saved to the profile
      // This is a safety check to avoid duplicate accounts
      if (accountId) {
        const { data: checkProfile } = await supabaseAdmin
          .from('profiles')
          .select('stripe_account_id')
          .eq('id', user.id)
          .maybeSingle();
        
        // If the account ID isn't saved properly, try updating again
        if (!checkProfile?.stripe_account_id) {
          console.log('Stripe account ID not properly saved, trying update again');
          await supabaseAdmin
            .from('profiles')
            .update({ stripe_account_id: accountId })
            .eq('id', user.id);
        }
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
