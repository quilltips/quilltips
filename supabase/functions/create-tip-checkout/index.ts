
//@ts-nocheck
import Stripe from "https://esm.sh/stripe@12.9.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const config = {
  path: "/create-tip-checkout"
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || '');
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ''
    );

    // Parse the request body
    const { 
      amount, 
      authorId, 
      message, 
      name, 
      email, 
      bookTitle, 
      qrCodeId,
      isPrivate = false
    } = await req.json();

    if (!amount || !authorId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get author's Stripe account to ensure they have set up properly
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_setup_complete, name, email')
      .eq('id', authorId)
      .single();

    if (profileError || !profile?.stripe_account_id || !profile?.stripe_setup_complete) {
      return new Response(
        JSON.stringify({ 
          error: 'Author has not completed their payment setup', 
          code: 'ACCOUNT_SETUP_INCOMPLETE' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Convert amount to cents
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: bookTitle 
                ? `Tip for "${bookTitle}"`
                : `Tip for ${profile.name || 'Author'}`,
              description: 'Support this author with a tip'
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: profile.stripe_account_id,
        },
        application_fee_amount: Math.round(amountInCents * 0.05), // 5% fee
      },
      customer_email: email,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/tip-success`,
      cancel_url: `${req.headers.get('origin')}/qr/${qrCodeId || ''}`,
      metadata: {
        authorId: authorId,
        tipAmount: amount,
        bookTitle: bookTitle || '',
        qrCodeId: qrCodeId || '',
        readerName: name || '',
        type: 'tip',
      },
    });

    // Create a record in the tips table
    const { error: tipError } = await supabase
      .from('tips')
      .insert({
        amount,
        author_id: authorId,
        qr_code_id: qrCodeId,
        message,
        reader_name: name,
        reader_email: email,
        stripe_session_id: session.id,
        book_title: bookTitle,
        is_private: isPrivate
      });

    if (tipError) {
      console.error('Error creating tip record:', tipError);
      // Continue with checkout even if tip record creation fails
      // The webhook will handle updating the tip record later
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

export default handler;
