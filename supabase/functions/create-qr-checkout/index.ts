
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
    
    console.log('Creating QR code checkout for:', { qrCodeId, bookTitle });
    
    if (!qrCodeId) {
      throw new Error('QR code ID is required');
    }
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Get session and user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Verify QR code belongs to this user and is not already paid
    const { data: qrCode, error: qrCodeError } = await supabaseAdmin
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .eq('author_id', user.id)
      .single();
    
    if (qrCodeError || !qrCode) {
      console.error('Error fetching QR code:', qrCodeError);
      throw new Error('QR code not found or not owned by this user');
    }
    
    if (qrCode.qr_code_status === 'active') {
      throw new Error('This QR code has already been purchased');
    }
    
    // Create a Stripe Checkout Session
    console.log('Creating Stripe checkout session');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `QR Code for "${bookTitle || 'Your Book'}"`,
              description: 'Personalized QR code for your book',
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/qr-summary?qr_code=${qrCodeId}&success=true`,
      cancel_url: `${req.headers.get('origin')}/qr-design?qr_code=${qrCodeId}&canceled=true`,
      metadata: {
        type: 'qr_code_purchase',
        qr_code_id: qrCodeId,
        user_id: user.id,
        book_title: bookTitle,
      },
    });
    
    // Update QR code with session ID
    const { error: updateError } = await supabaseAdmin
      .from('qr_codes')
      .update({ stripe_session_id: session.id })
      .eq('id', qrCodeId);
    
    if (updateError) {
      console.error('Error updating QR code:', updateError);
      // Continue with checkout even if this fails
    }
    
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error: any) {
    console.error('Error in create-qr-checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
