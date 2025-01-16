import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    console.log('Creating Stripe Connect account...')
    
    // First check if platform profile is complete
    try {
      // Create a new Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      })

      console.log('Stripe account created:', account.id)

      // Create an account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.get('origin')}/author/bank-account?refresh=true`,
        return_url: `${req.headers.get('origin')}/author/dashboard?setup=complete`,
        type: 'account_onboarding',
        collect: 'currently_due',
      })

      console.log('Account link created successfully:', accountLink.url)

      return new Response(
        JSON.stringify({ 
          accountId: account.id,
          url: accountLink.url 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError)
      
      // Check if it's a platform profile error
      if (stripeError.message?.includes('platform-profile')) {
        return new Response(
          JSON.stringify({ 
            error: 'Platform profile setup required',
            details: 'Please complete your Stripe Connect platform profile setup at https://dashboard.stripe.com/settings/connect/platform-profile'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
      
      throw stripeError
    }
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})