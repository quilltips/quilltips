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
    const { amount, authorId, message, bookTitle, qrCodeId } = await req.json();
    
    if (!authorId) {
      throw new Error('Author ID is required');
    }

    // Get the author's Stripe account ID
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: author, error: authorError } = await supabaseClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', authorId)
      .single();

    if (authorError || !author?.stripe_account_id) {
      throw new Error('Author not found or not set up for payments');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Check if the connected account has the required capabilities
    const account = await stripe.accounts.retrieve(author.stripe_account_id);
    
    if (!account.capabilities?.transfers && !account.capabilities?.legacy_payments) {
      return new Response(
        JSON.stringify({ 
          error: 'Account setup incomplete',
          details: 'The author needs to complete their account setup to receive payments.',
          code: 'ACCOUNT_SETUP_INCOMPLETE'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Creating payment session for author:', authorId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Tip for ${bookTitle || 'Author'}`,
              description: message || 'Support the author',
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/author/${authorId}?success=true`,
      cancel_url: `${req.headers.get('origin')}/author/${authorId}?canceled=true`,
      payment_intent_data: {
        transfer_data: {
          destination: author.stripe_account_id,
        },
      },
      metadata: {
        authorId,
        message: message || '',
        bookTitle: bookTitle || '',
        qrCodeId: qrCodeId || '',
      },
    });

    console.log('Payment session created:', session.id);
    
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
      JSON.stringify({ 
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});