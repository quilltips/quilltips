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
    // Get the authenticated user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get user profile to check if they already have a Stripe account
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    let accountId = profile?.stripe_account_id;

    try {
      // Create a new Connect account if one doesn't exist
      if (!accountId) {
        console.log('Creating new Stripe Connect account for user:', user.id);
        const account = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          metadata: {
            supabaseUserId: user.id,
          },
        });
        accountId = account.id;

        // Update the user's profile with their Stripe account ID
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ stripe_account_id: accountId })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
      }

      // Create an account session for embedded onboarding
      console.log('Creating account session for:', accountId);
      const accountSession = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.get('origin')}/author/bank-account?refresh=true`,
        return_url: `${req.headers.get('origin')}/author/dashboard`,
        type: 'account_onboarding',
        collect: 'eventually_due',
      });

      console.log('Account session created');
      
      return new Response(
        JSON.stringify({ 
          clientSecret: accountSession.client_secret,
          publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
          accountId: accountId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      throw stripeError;
    }
  } catch (error) {
    console.error('Error in create-connect-account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});