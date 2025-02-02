import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, authorId, message, name, bookTitle, qrCodeId } = await req.json();

    // Create Supabase client
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

    if (profileError || !authorProfile?.stripe_account_id) {
      throw new Error('Author has not connected their Stripe account');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Calculate application fee (10%)
    const applicationFeeAmount = Math.round(amount * 100 * 0.1); // 10% of the amount in cents

    // Create PaymentIntent with Connect
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: authorProfile.stripe_account_id,
      },
      metadata: {
        authorId,
        bookTitle,
        qrCodeId,
        message,
        tipper_name: name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create tip record in database
    const { error: tipError } = await supabaseAdmin
      .from('tips')
      .insert({
        author_id: authorId,
        amount: amount,
        message: message || null,
        book_title: bookTitle || null,
        qr_code_id: qrCodeId || null,
      });

    if (tipError) {
      console.error('Error creating tip record:', tipError);
      throw new Error('Failed to record tip');
    }

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: error.message.includes('not connected') ? 'ACCOUNT_SETUP_INCOMPLETE' : 'PAYMENT_ERROR'
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});