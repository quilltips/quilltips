
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
          const { data: tipData, error: tipError } = await supabase.from("tips")
            .update({
              status: "complete", // This will trigger the database email notification
              reader_email: readerEmail || null
            })
            .eq("stripe_session_id", session.id)
            .select();
          
          if (tipError) {
            console.error("❌ Error updating tip record:", tipError);
            throw tipError;
          }
          
          console.log("✅ Platform tip record updated successfully:", tipData);
          
          // Directly call the email notification function instead of relying on database trigger
          if (tipData && tipData.length > 0) {
            const tip = tipData[0];
            try {
              await sendEmailNotification('tip_received', tip.author_id, {
                amount: tip.amount,
                bookTitle: tip.book_title || 'your book',
                message: tip.message
              });
              console.log("📧 Email notification sent successfully");
            } catch (emailError) {
              console.error("❌ Failed to send email notification:", emailError);
              // Continue processing - don't fail the webhook just because email failed
            }
          }
        }
        
        if (session.metadata?.type === "qr_code_purchase") {
          console.log("🔍 Processing platform-level QR code purchase");
          const { data: qrCode, error: qrError } = await supabase.from("qr_codes")
            .update({
              qr_code_status: "active",
              is_paid: true
            })
            .eq("id", session.metadata.qrCodeId)
            .select("author_id, book_title");
            
          if (qrError) {
            console.error("❌ Error updating QR code record:", qrError);
            throw qrError;
          }
          
          console.log("✅ Platform QR code updated to active status");
          
          // Directly call the email notification function
          if (qrCode && qrCode.length > 0) {
            try {
              await sendEmailNotification('qr_code_purchased', qrCode[0].author_id, {
                bookTitle: qrCode[0].book_title
              });
              console.log("📧 QR code purchase email notification sent successfully");
            } catch (emailError) {
              console.error("❌ Failed to send QR code purchase email notification:", emailError);
              // Continue processing - don't fail the webhook just because email failed
            }
          }
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

// Helper function to directly call the send-email-notification edge function
async function sendEmailNotification(type, userId, data = {}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || '';
  
  console.log(`📧 Sending ${type} notification for user ${userId}`);
  
  const response = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`
    },
    body: JSON.stringify({
      type,
      userId,
      data
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email notification: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

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
