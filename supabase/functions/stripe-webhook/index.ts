// supabase/functions/stripe-webhook/index.ts

// @ts-nocheck
// @allowUnauthenticated

// ✅ Tell Supabase to allow unauthenticated access
export const config = {
  auth: false,
};

console.log("🧪 latest version deployed")

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
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
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === "tip") {
          await supabase
            .from("tips")
            .update({ status: "complete" })
            .eq("id", session.metadata.tip_id);
        }

        if (session.metadata?.type === "qr_code_purchase") {
          await supabase
            .from("qr_codes")
            .update({ stripe_payment_complete: true })
            .eq("id", session.metadata.qr_code_id);
        }

        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const payoutsEnabled = account.payouts_enabled;
        const detailsSubmitted = account.details_submitted;

        if (payoutsEnabled && detailsSubmitted) {
          await supabase
            .from("profiles")
            .update({ stripe_setup_complete: true })
            .eq("stripe_account_id", account.id);
        }

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("❌ Error handling webhook event:", err);
    return new Response("Webhook error", { status: 500 });
  }
});
