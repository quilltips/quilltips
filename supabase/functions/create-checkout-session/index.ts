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
    const { qrCodeId, bookTitle } = await req.json();
    
    if (!qrCodeId) {
      throw new Error('QR code ID is required');
    }

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

    console.log('Creating payment session for user:', user.id);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QR Code for "${bookTitle}"`,
              description: 'One-time purchase for QR code generation',
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Explicitly set to one-time payment
      success_url: `${req.headers.get('origin')}/author/dashboard?success=true&qr_code=${qrCodeId}`,
      cancel_url: `${req.headers.get('origin')}/author/dashboard?canceled=true`,
      metadata: {
        qrCodeId,
        authorId: user.id,
      },
      customer_email: user.email, // Pre-fill customer email
    });

    // Update QR code with Stripe session ID
    const { error: updateError } = await supabaseClient
      .from('qr_codes')
      .update({ stripe_session_id: session.id })
      .eq('id', qrCodeId)
      .eq('author_id', user.id);

    if (updateError) {
      console.error('Error updating QR code:', updateError);
      throw updateError;
    }

    console.log('Payment session created:', session.id);
    console.log('Checkout URL:', session.url);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});