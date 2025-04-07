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
            
            // Send email notification to author about the tip
            if (data && data.length > 0) {
              const tipData = data[0];
              
              try {
                // Send email notification to the author about the tip
                await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    type: 'tip_received',
                    userId: tipData.author_id,
                    data: {
                      amount: tipData.amount,
                      bookTitle: tipData.book_title,
                      message: tipData.message
                    }
                  })
                });
                console.log("✅ Tip notification email sent to author");
              } catch (emailError) {
                // Don't block the process if email sending fails
                console.error("❌ Error sending tip notification email:", emailError);
              }
            }
          }
          
          if (session.metadata?.type === "qr_code_purchase") {
            const { data: qrCode, error } = await supabase.from("qr_codes")
              .update({
                qr_code_status: "active",
                is_paid: true
              })
              .eq("id", session.metadata.qrCodeId)
              .select("author_id, book_title");
              
            if (error) throw error;
            
            if (qrCode && qrCode.length > 0) {
              try {
                // Send email notification about QR code purchase
                await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    type: 'qr_code_purchased',
                    userId: qrCode[0].author_id,
                    data: {
                      bookTitle: qrCode[0].book_title
                    }
                  })
                });
                console.log("✅ QR code purchase notification email sent to author");
              } catch (emailError) {
                console.error("❌ Error sending QR code purchase email:", emailError);
              }
            }
          }
          break;
        }
      case "account.updated":
        {
          const account = event.data.object;
          if (account.metadata?.supabaseUserId) {
            const { error, data: profile } = await supabase.from("profiles").update({
              stripe_account_id: account.id,
              stripe_setup_complete: account.payouts_enabled && account.details_submitted
            }).eq("id", account.metadata.supabaseUserId).select();
            
            if (error) throw error;
            
            // Send notification about Stripe setup status
            try {
              const setupComplete = account.payouts_enabled && account.details_submitted;
              await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: setupComplete ? 'stripe_setup_complete' : 'stripe_setup_incomplete',
                  userId: account.metadata.supabaseUserId
                })
              });
              console.log(`✅ Stripe setup ${setupComplete ? 'complete' : 'incomplete'} notification sent`);
            } catch (emailError) {
              console.error("❌ Error sending Stripe setup notification:", emailError);
            }
          } else {
            const { data: profiles, error: findError } = await supabase.from("profiles").select("id").eq("stripe_account_id", account.id);
            if (findError) throw findError;
            if (profiles?.length) {
              const { error: updateError } = await supabase.from("profiles").update({
                stripe_setup_complete: account.payouts_enabled && account.details_submitted
              }).eq("stripe_account_id", account.id);
              if (updateError) throw updateError;
              
              // Send notification about Stripe setup status
              try {
                const setupComplete = account.payouts_enabled && account.details_submitted;
                await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    type: setupComplete ? 'stripe_setup_complete' : 'stripe_setup_incomplete',
                    userId: profiles[0].id
                  })
                });
                console.log(`✅ Stripe setup ${setupComplete ? 'complete' : 'incomplete'} notification sent`);
              } catch (emailError) {
                console.error("❌ Error sending Stripe setup notification:", emailError);
              }
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
