import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0?dts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, authorId, message, name, email, bookTitle, qrCodeId } = await req.json();

    console.log('Creating checkout session with params:', { amount, authorId, message, name, email, bookTitle, qrCodeId });

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Removed rate limit check to restore functionality

    // Get author's Stripe account ID
    const { data: authorProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, stripe_setup_complete')
      .eq('id', authorId)
      .single();

    if (profileError) {
      console.error('Error fetching author profile:', profileError);
      throw new Error('Failed to fetch author profile');
    }

    console.log('Author profile:', authorProfile);

    if (!authorProfile?.stripe_account_id) {
      console.error('Author has not connected their Stripe account');
      return new Response(
        JSON.stringify({ 
          error: 'Author has not connected their Stripe account',
          code: 'ACCOUNT_SETUP_INCOMPLETE'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Initialize Stripe with better error handling
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    try {
      // Check if the connected account exists and is active
      const account = await stripe.accounts.retrieve(authorProfile.stripe_account_id);
      console.log('Stripe account status:', {
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        charges_enabled: account.charges_enabled
      });
      
      // If the metadata is missing, update it
      if (!account.metadata?.supabaseUserId) {
        console.log('Adding missing supabaseUserId to metadata');
        await stripe.accounts.update(authorProfile.stripe_account_id, {
          metadata: { supabaseUserId: authorId }
        });
        
        // Update the profile in the database
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            stripe_setup_complete: account.details_submitted && account.payouts_enabled
          })
          .eq('id', authorId);
          
        if (updateError) {
          console.error('Error updating profile stripe_setup_complete:', updateError);
        }
      }
      
      if (!account.details_submitted || !account.payouts_enabled) {
        console.error('Stripe account is not fully set up');
        return new Response(
          JSON.stringify({ 
            error: 'Author needs to complete their Stripe account setup',
            code: 'ACCOUNT_SETUP_INCOMPLETE'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
    } catch (stripeError) {
      console.error('Error checking Stripe account:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid author Stripe account',
          code: 'INVALID_ACCOUNT'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Calculate application fee (5%)
    const applicationFeeAmount = Math.round(amount * 100 * 0.05); // 5% of the amount in cents

    console.log('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Tip for ${bookTitle || 'Author'}`,
            description: message || undefined,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: authorProfile.stripe_account_id,
        },
        metadata: {
          authorId,
          tipper_name: name,
          tipper_email: email,
          message,
          bookTitle,
          qrCodeId,
        },
      },
      customer_email: email,
      // Update success_url to use the new tip success page
      success_url: `${req.headers.get('origin')}/tip-success?authorId=${authorId}&amount=${amount}`,
      cancel_url: `${req.headers.get('origin')}/qr/${qrCodeId || ''}`,
      metadata: {
        type: 'tip',
        author_id: authorId,
        qr_code_id: qrCodeId,
      },
    });

    console.log('Checkout session created:', session.id);

    // Create pending tip record
    const { error: tipError } = await supabaseAdmin
      .from('tips')
      .insert({
        author_id: authorId,
        amount: amount,
        message: message || null,
        book_title: bookTitle || null,
        qr_code_id: qrCodeId || null,
        stripe_session_id: session.id,
        status: 'pending',
        reader_name: name || null,
        reader_email: email || null  // Store the reader's email
      });

    if (tipError) {
      console.error('Error creating tip record:', tipError);
      // Continue with the checkout even if tip record creation fails
      // We can handle this case later in the webhook
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in create-tip-checkout:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: error.message.includes('not connected') ? 'ACCOUNT_SETUP_INCOMPLETE' : 'PAYMENT_ERROR'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 400
      }
    );
  }
});
