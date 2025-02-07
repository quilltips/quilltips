
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.18.0?dts";

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
    const { amount, authorId, message, name, bookTitle, qrCodeId } = await req.json();

    console.log('Creating checkout session with params:', { amount, authorId, message, name, bookTitle, qrCodeId });

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get author's Stripe account ID
    const { data: authorProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', authorId)
      .single();

    if (profileError) {
      console.error('Error fetching author profile:', profileError);
      throw new Error('Failed to fetch author profile');
    }

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

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Calculate application fee (10%)
    const applicationFeeAmount = Math.round(amount * 100 * 0.1); // 10% of the amount in cents

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
          message,
          bookTitle,
          qrCodeId,
        },
      },
      success_url: `${req.headers.get('origin')}/author/${authorId}?success=true`,
      cancel_url: `${req.headers.get('origin')}/author/${authorId}?canceled=true`,
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
        status: 'pending'
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
        status: 200,
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
        status: 400,
      }
    );
  }
});
