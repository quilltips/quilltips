
// supabase/functions/platform-webhook/index.ts
export const config = {
  path: "/platform-webhook",
  auth: false
};
console.log("🔄 Platform-level Stripe webhook handler deployed");
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || '',
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  console.log(`📬 Platform webhook: ${req.method} ${req.url}`);
  
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = Deno.env.get("STRIPE_PLATFORM_WEBHOOK_SECRET");
  
  if (!sig || !secret) {
    console.error("❌ Missing signature or secret");
    return new Response("Missing signature or secret", {
      status: 400,
      headers: corsHeaders
    });
  }
  
  let event;
  try {
    event = await parseStripeEvent(body, sig, secret);
    console.log("✅ Platform Stripe event:", event.type);
  } catch (err) {
    console.error("❌ Platform signature verification failed:", err.message);
    return new Response("Invalid signature", {
      status: 400,
      headers: corsHeaders
    });
  }
  
  try {
    switch(event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("📊 Processing platform-level completed checkout session:", session.id);
        
        if (session.metadata?.type === "tip") {
          console.log("💰 Processing platform-level tip payment");
          
          // Get reader email from the session
          const readerEmail = session.customer_email;
          console.log("📧 Reader email from platform session:", readerEmail);
          
          // Update the tip record with completed status
          const { data, error } = await supabase.from("tips")
            .update({
              status: "complete", // This will trigger the database email notification
              reader_email: readerEmail || null
            })
            .eq("stripe_session_id", session.id)
            .select();
          
          if (error) {
            console.error("❌ Error updating tip record:", error);
            throw error;
          }
          
          console.log("✅ Platform tip record updated successfully:", data);
        }
        
        if (session.metadata?.type === "qr_code_purchase") {
          console.log("🔍 Processing platform-level QR code purchase");
          const { data: qrCode, error } = await supabase.from("qr_codes")
            .update({
              qr_code_status: "active",
              is_paid: true // This will trigger the database email notification
            })
            .eq("id", session.metadata.qrCodeId)
            .select("author_id, book_title");
            
          if (error) {
            console.error("❌ Error updating QR code record:", error);
            throw error;
          }
          
          console.log("✅ Platform QR code updated to active status");
        }
        break;
      }
      
      default:
        console.log(`⚠️ Unhandled platform event: ${event.type}`);
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
    console.error("❌ Platform webhook handler error:", err.message);
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
  }, false, ["sign"]);
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sigBuffer)).map((b)=>b.toString(16).padStart(2, "0")).join("");
}

function secureCompare(a, b) {
  return a.length === b.length && crypto.timingSafeEqual ? crypto.timingSafeEqual(new TextEncoder().encode(a), new TextEncoder().encode(b)) : a === b;
}
