
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@13.6.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Initialize Supabase client for user verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get the authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Stripe secret key not found');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration error' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Parse request body
    const { qrCodeId, bookTitle } = await req.json();
    if (!qrCodeId) {
      return new Response(
        JSON.stringify({ error: 'Missing QR code ID' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Creating checkout session for QR code ${qrCodeId}, book: ${bookTitle || 'Unknown'}, user: ${user.id}`);

    // Get the product ID from environment variable or use a default
    const QR_CODE_PRODUCT_ID = Deno.env.get('QR_CODE_PRODUCT_ID');
    
    // Determine if we're using a product ID or need to create price data
    const lineItems = QR_CODE_PRODUCT_ID 
      ? [{ price: QR_CODE_PRODUCT_ID, quantity: 1 }]
      : [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QR Code for "${bookTitle || 'Book'}"`,
              description: 'One-time purchase for QR code generation',
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        }];

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/qr-summary?qr_code=${qrCodeId}`,
      cancel_url: `${req.headers.get('origin')}/author/qr-codes/${qrCodeId}?checkout=canceled`,
      metadata: {
        qrCodeId,
        authorId: user.id,
        type: 'qr_code_purchase'
      },
      customer_email: user.email,
    });

    // Update QR code with Stripe session ID
    const { error: updateError } = await supabaseClient
      .from('qr_codes')
      .update({ stripe_session_id: session.id })
      .eq('id', qrCodeId)
      .eq('author_id', user.id);

    if (updateError) {
      console.error('Error updating QR code:', updateError);
      // We'll continue with the checkout even if the DB update fails
      // The webhook will handle the final status update
    }

    // Check which Stripe environment we're using
    const stripeMode = stripeKey.startsWith('sk_test') ? 'TEST MODE' : 'LIVE MODE';
    console.log(`Stripe is running in ${stripeMode}`);
    console.log(`Checkout session created: ${session.id}, redirecting to ${session.url}`);

    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
