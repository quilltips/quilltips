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

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || '',
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ''
);

// Initialize Stripe at the top level with proper error handling
let stripe: Stripe | null = null;
try {
  const Stripe = (await import('https://esm.sh/stripe@14.21.0')).default;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });
  } else {
    console.error('❌ Missing STRIPE_SECRET_KEY');
  }
} catch (err) {
  console.error("❌ Error initializing Stripe:", err);
}

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
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    switch(event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("📊 Processing platform-level completed checkout session:", session.id);
        
        // Handle different payment types
        if (session.metadata?.type === "tip") {
          console.log("💰 Processing tip payment");
          
          // Update tip status
          const { data: tipData, error: tipError } = await supabase
            .from("tips")
            .update({ 
              status: "complete",
              reader_email: session.customer_email || null 
            })
            .eq("stripe_session_id", session.id)
            .select("author_id, amount, book_title, message")
            .single();
            
          if (tipError) {
            console.error("❌ Error updating tip record:", tipError);
            throw tipError;
          }
          
          console.log("✅ Tip record updated:", tipData);
          
          // Send email notification for tip
          if (tipData) {
            try {
              await sendEmailNotification('tip_received', tipData.author_id, {
                amount: tipData.amount,
                bookTitle: tipData.book_title || 'your book',
                message: tipData.message || ''
              });
              console.log("📧 Tip received email notification sent successfully");
            } catch (emailError) {
              console.error("❌ Failed to send tip received email notification:", emailError);
            }
          }
        } else if (session.metadata?.type === "qr_code_purchase") {
          console.log("🔍 Processing QR code purchase");
          
          // Validate required metadata
          if (!session.metadata.qrCodeId || !session.metadata.authorId) {
            console.error("❌ Missing required metadata for QR code purchase");
            throw new Error("Invalid QR code purchase metadata");
          }
          
          // Update QR code status with comprehensive logging
          const { data: qrCode, error: qrError } = await supabase.from("qr_codes")
            .update({
              qr_code_status: "active",
              is_paid: true,
              stripe_session_id: session.id
            })
            .eq('id', session.metadata.qrCodeId)
            .select("author_id, book_title");
            
          if (qrError) {
            console.error("❌ Error updating QR code record:", qrError);
            throw qrError;
          }
          
          console.log("✅ QR code updated to active status:", qrCode);
          
          // Send email notification for QR code purchase
          if (qrCode && qrCode.length > 0) {
            try {
              await sendEmailNotification('qr_code_purchased', qrCode[0].author_id, {
                bookTitle: qrCode[0].book_title
              });
              console.log("📧 QR code purchase email notification sent successfully");
            } catch (emailError) {
              console.error("❌ Failed to send QR code purchase email notification:", emailError);
            }
          }
        }
        break;
      }
      
      case "account.updated": {
        const account = event.data.object;
        console.log("🔄 Processing Stripe Connect account update:", account.id);
        
        // Look for the Supabase user ID in the account metadata
        if (account.metadata?.supabaseUserId) {
          console.log("🔍 Found supabaseUserId in metadata:", account.metadata.supabaseUserId);
          
          // Update the user's profile with the Stripe account status
          const { data: profile, error: updateError } = await supabase
            .from("profiles")
            .update({
              stripe_account_id: account.id, // Ensure the ID is saved
              stripe_setup_complete: account.payouts_enabled && account.details_submitted
            })
            .eq('id', account.metadata.supabaseUserId)
            .select();
            
          if (updateError) {
            console.error("❌ Error updating profile with Stripe status:", updateError);
            throw updateError;
          }
          
          console.log("✅ Profile updated with Stripe account status:", profile);
          
          // Send notification based on account status
          try {
            const notificationType = account.payouts_enabled && account.details_submitted
              ? 'stripe_setup_complete'
              : 'stripe_setup_incomplete';
              
            await sendEmailNotification(notificationType, account.metadata.supabaseUserId, {});
            console.log(`📧 ${notificationType} email notification sent`);
          } catch (emailError) {
            console.error("❌ Failed to send status update notification:", emailError);
          }
        } else {
          // If no user ID in metadata, try to find by account ID
          console.log("⚠️ No supabaseUserId in metadata, searching by account ID");
          
          const { data: profiles, error: findError } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_account_id", account.id);
            
          if (findError) {
            console.error("❌ Error finding profile by account ID:", findError);
            throw findError;
          }
          
          if (profiles && profiles.length > 0) {
            console.log(`✅ Found ${profiles.length} profiles with this account ID`);
            
            // Update profile status
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                stripe_setup_complete: account.payouts_enabled && account.details_submitted
              })
              .eq("stripe_account_id", account.id);
              
            if (updateError) {
              console.error("❌ Error updating profile status:", updateError);
              throw updateError;
            }
            
            // Update metadata on the Stripe account
            try {
              if (profiles.length === 1) {
                console.log("🔄 Updating Stripe account metadata with user ID");
                await stripe.accounts.update(account.id, {
                  metadata: { supabaseUserId: profiles[0].id }
                });
              }
            } catch (stripeError) {
              console.error("❌ Error updating Stripe account metadata:", stripeError);
            }
            
            console.log("✅ Profile status updated successfully");
          } else {
            console.warn("⚠️ No profile found with this account ID:", account.id);
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
