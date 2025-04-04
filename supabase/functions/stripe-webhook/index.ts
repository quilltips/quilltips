
// supabase/functions/stripe-webhook/index.ts
//@ts-nocheck
export const config = {
  path: "/stripe-webhook",
  auth: false
};
console.log("🔄 Stripe webhook handler deployed");
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  console.log(`📬 ${req.method} ${req.url}`);
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !secret) {
    return new Response("Missing signature or secret", {
      status: 400,
      headers: corsHeaders
    });
  }
  let event;
  try {
    event = await parseStripeEvent(body, sig, secret);
    console.log("✅ Stripe event:", event.type);
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return new Response("Invalid signature", {
      status: 400,
      headers: corsHeaders
    });
  }
  try {
    switch(event.type){
      case "checkout.session.completed":
        {
          const session = event.data.object;
          console.log("📊 Processing completed checkout session:", session.id);
          
          if (session.metadata?.type === "tip") {
            console.log("💰 Processing tip payment");
            
            // Get reader email from the session
            const readerEmail = session.customer_email;
            console.log("📧 Reader email from session:", readerEmail);
            
            // Update the tip record with completed status and ensure reader email is saved
            const { data, error } = await supabase.from("tips")
              .update({
                status: "complete",
                reader_email: readerEmail || null
              })
              .eq("stripe_session_id", session.id)
              .select();
            
            if (error) {
              console.error("❌ Error updating tip record:", error);
              throw error;
            }
            
            console.log("✅ Tip record updated successfully:", data);
          }
          
          if (session.metadata?.type === "qr_code_purchase") {
            const { error } = await supabase.from("qr_codes").update({
              qr_code_status: "active",
              is_paid: true
            }).eq("id", session.metadata.qrCodeId);
            if (error) throw error;
          }
          break;
        }
      case "account.updated":
        {
          const account = event.data.object;
          if (account.metadata?.supabaseUserId) {
            const { error } = await supabase.from("profiles").update({
              stripe_account_id: account.id,
              stripe_setup_complete: account.payouts_enabled && account.details_submitted
            }).eq("id", account.metadata.supabaseUserId);
            if (error) throw error;
          } else {
            const { data: profiles, error: findError } = await supabase.from("profiles").select("id").eq("stripe_account_id", account.id);
            if (findError) throw findError;
            if (profiles?.length) {
              const { error: updateError } = await supabase.from("profiles").update({
                stripe_setup_complete: account.payouts_enabled && account.details_submitted
              }).eq("stripe_account_id", account.id);
              if (updateError) throw updateError;
            }
          }
          break;
        }
      default:
        console.log(`⚠️ Unhandled event: ${event.type}`);
    }
    return new Response(JSON.stringify({
      status: "success"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (err) {
    console.error("❌ Webhook handler error:", err.message);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
async function parseStripeEvent(payload, sig, secret) {
  const header = parseSigHeader(sig);
  const expectedSig = await computeSignature(payload, secret, header.timestamp);
  if (!secureCompare(expectedSig, header.signature)) {
    throw new Error("Signature mismatch");
  }
  return JSON.parse(payload);
}
function parseSigHeader(sig) {
  const [t, v1] = [
    sig.match(/t=([^,]*)/)?.[1],
    sig.match(/v1=([^,]*)/)?.[1]
  ];
  if (!t || !v1) throw new Error("Malformed signature header");
  return {
    timestamp: t,
    signature: v1
  };
}
async function computeSignature(payload, secret, timestamp) {
  const data = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {
    name: "HMAC",
    hash: "SHA-256"
  }, false, [
    "sign"
  ]);
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sigBuffer)).map((b)=>b.toString(16).padStart(2, "0")).join("");
}
function secureCompare(a, b) {
  return a.length === b.length && crypto.timingSafeEqual ? crypto.timingSafeEqual(new TextEncoder().encode(a), new TextEncoder().encode(b)) : a === b;
}
