
// supabase/functions/stripe-webhook/index.ts

//@ts-nocheck
// ✅ Tell Supabase to allow unauthenticated access
export const config = {
  path: "/stripe-webhook",
  auth: false,
};

console.log("🔄 Updated Stripe webhook handler deployed")

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for OPTIONS requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`💡 Received ${req.method} request to ${req.url}`);
  
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      console.error("❌ No Stripe signature found in request headers");
      return new Response("No Stripe signature", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const body = await req.text();
    console.log(`📝 Request body length: ${body.length} characters`);
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("❌ No webhook secret found in environment variables");
      return new Response("Webhook secret not configured", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(`Invalid signature: ${err.message}`, { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log("✅ Stripe event received:", event.type, event.id);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          console.log("Checkout session completed:", session.id);
          console.log("Session metadata:", session.metadata);
          
          // Handle tip completion
          if (session.metadata?.type === "tip") {
            console.log("Processing completed tip:", session.metadata);
            
            const { error } = await supabase
              .from("tips")
              .update({ status: "complete" })
              .eq("stripe_session_id", session.id);
              
            if (error) {
              console.error("Error updating tip status:", error);
              throw error;
            } else {
              console.log("Successfully updated tip status to complete");
            }
          }

          // Handle QR code purchase completion
          if (session.metadata?.type === "qr_code_purchase") {
            console.log("Processing completed QR code purchase:", session.metadata);
            
            const { error } = await supabase
              .from("qr_codes")
              .update({ 
                qr_code_status: "active",
                is_paid: true 
              })
              .eq("id", session.metadata.qrCodeId);
              
            if (error) {
              console.error("Error updating QR code status:", error);
              throw error;
            } else {
              console.log("Successfully updated QR code status to active");
            }
          }
          break;
        }

        case "account.updated": {
          const account = event.data.object;
          console.log("Stripe Connect account updated:", account.id);
          
          // Detailed logging to debug the issue
          console.log("Account details:", {
            id: account.id,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            charges_enabled: account.charges_enabled,
            metadata: account.metadata
          });
          
          // First try to find by metadata
          if (account.metadata?.supabaseUserId) {
            console.log("Found supabaseUserId in metadata:", account.metadata.supabaseUserId);
            
            const { data, error } = await supabase
              .from("profiles")
              .update({ 
                stripe_account_id: account.id,
                stripe_setup_complete: account.payouts_enabled && account.details_submitted 
              })
              .eq("id", account.metadata.supabaseUserId)
              .select();
              
            if (error) {
              console.error("Error updating profile with metadata ID:", error);
              throw error;
            } else {
              console.log("Successfully updated profile with metadata ID:", data);
            }
          } else {
            // As a fallback, find the user by Connect account ID
            console.log("No metadata, searching by account ID");
            
            const { data: profiles, error: findError } = await supabase
              .from("profiles")
              .select("id")
              .eq("stripe_account_id", account.id);
              
            if (findError) {
              console.error("Error finding profile by account ID:", findError);
              throw findError;
            } else if (profiles && profiles.length > 0) {
              console.log("Found profiles with account ID:", profiles.length);
              
              const { data, error: updateError } = await supabase
                .from("profiles")
                .update({ 
                  stripe_setup_complete: account.payouts_enabled && account.details_submitted 
                })
                .eq("stripe_account_id", account.id)
                .select();
                
              if (updateError) {
                console.error("Error updating profile by account ID:", updateError);
                throw updateError;
              } else {
                console.log("Successfully updated profile by account ID:", data);
              }
            } else {
              console.warn("⚠️ No profiles found with account ID:", account.id);
            }
          }
          break;
        }

        default:
          console.log(`⚠️ Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ status: "success" }), { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      });
    } catch (err) {
      console.error("❌ Error handling webhook event:", err.message);
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      });
    }
  } catch (err) {
    console.error("❌ Unexpected error in webhook handler:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
