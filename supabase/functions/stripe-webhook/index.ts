
// supabase/functions/stripe-webhook/index.ts

//@ts-nocheck
@allowUnauthenticated

// ✅ Tell Supabase to allow unauthenticated access
export const config = {
  auth: false,
};

console.log("🔄 Updated Stripe webhook handler deployed")

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log("✅ Stripe event received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout session completed:", session.id);
        
        // Handle tip completion
        if (session.metadata?.type === "tip") {
          console.log("Processing completed tip:", session.metadata);
          
          await supabase
            .from("tips")
            .update({ status: "complete" })
            .eq("stripe_session_id", session.id);
            
          // Update QR code stats trigger will handle the rest
        }

        // Handle QR code purchase completion
        if (session.metadata?.type === "qr_code_purchase") {
          console.log("Processing completed QR code purchase:", session.metadata);
          
          await supabase
            .from("qr_codes")
            .update({ 
              qr_code_status: "active",
              is_paid: true 
            })
            .eq("id", session.metadata.qrCodeId);
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
        
        // Find the user with this Connect account using metadata
        if (account.metadata?.supabaseUserId) {
          console.log("Found supabaseUserId in metadata:", account.metadata.supabaseUserId);
          
          const { data, error } = await supabase
            .from("profiles")
            .update({ 
              stripe_account_id: account.id,
              stripe_setup_complete: account.payouts_enabled && account.details_submitted 
            })
            .eq("id", account.metadata.supabaseUserId);
            
          if (error) {
            console.error("Error updating profile with metadata ID:", error);
          } else {
            console.log("Successfully updated profile with metadata ID");
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
          } else if (profiles && profiles.length > 0) {
            console.log("Found profiles with account ID:", profiles.length);
            
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ 
                stripe_setup_complete: account.payouts_enabled && account.details_submitted 
              })
              .eq("stripe_account_id", account.id);
              
            if (updateError) {
              console.error("Error updating profile by account ID:", updateError);
            } else {
              console.log("Successfully updated profile by account ID");
            }
          } else {
            console.error("No profiles found with account ID:", account.id);
          }
        }

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (err) {
    console.error("❌ Error handling webhook event:", err);
    return new Response("Webhook error", { status: 500 });
  }
});
