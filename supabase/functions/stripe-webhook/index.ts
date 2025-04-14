// supabase/functions/stripe-webhook/index.ts
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

// Create a Supabase client with the service role key for admin operations
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
            
            // Send email notification directly instead of relying on database trigger
            if (data && data.length > 0) {
              const tip = data[0];
              try {
                await sendEmailNotification('tip_received', tip.author_id, {
                  amount: tip.amount,
                  bookTitle: tip.book_title || 'your book',
                  message: tip.message
                });
                console.log("📧 Tip received email notification sent successfully");
              } catch (emailError) {
                console.error("❌ Failed to send tip received email notification:", emailError);
                // Continue processing - don't fail the webhook just because email failed
              }
            }
          }
          
          if (session.metadata?.type === "qr_code_purchase") {
            // Get author ID from the metadata
            const { authorId, qrCodeId } = session.metadata;
            console.log(`💰 Processing QR code purchase for author ${authorId}, code ${qrCodeId}`);
            
            const { data: qrCode, error } = await supabase.from("qr_codes")
              .update({
                qr_code_status: "active",
                is_paid: true,
                stripe_session_id: session.id
              })
              .eq("id", qrCodeId)
              .select("author_id, book_title");
              
            if (error) {
              console.error("❌ Error updating QR code status:", error);
              throw error;
            }
            
            console.log("✅ QR code updated to active status");
            
            // Send email notification directly
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
      case "account.updated":
        {
          const account = event.data.object;
          console.log("🔄 Processing Stripe Connect account update:", account.id);
          
          // Check if the account has a user ID in the metadata
          if (account.metadata?.supabaseUserId) {
            console.log("🔍 Found user ID in account metadata:", account.metadata.supabaseUserId);
            
            // Get current profile data
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("stripe_setup_complete, stripe_onboarding_started_at, stripe_onboarding_completed_at")
              .eq("id", account.metadata.supabaseUserId)
              .single();
            
            if (profileError) {
              console.error("❌ Error fetching profile:", profileError);
              throw profileError;
            }
            
            // Determine onboarding progress
            const onboardingStarted = account.details_submitted || 
                                     (account.requirements?.currently_due?.length !== account.requirements?.eventually_due?.length);
            
            const onboardingCompleted = account.payouts_enabled && account.details_submitted;
            
            // Prepare update data
            const updateData: any = {
              stripe_account_id: account.id,
              stripe_setup_complete: onboardingCompleted
            };
            
            // Track onboarding start time if needed
            if (onboardingStarted && !profileData.stripe_onboarding_started_at) {
              updateData.stripe_onboarding_started_at = new Date().toISOString();
            }
            
            // Track onboarding completion time if newly completed
            if (onboardingCompleted && !profileData.stripe_onboarding_completed_at) {
              updateData.stripe_onboarding_completed_at = new Date().toISOString();
              
              // Send completion email only when newly completed
              try {
                await sendEmailNotification('stripe_setup_complete', account.metadata.supabaseUserId, {});
                await supabase.rpc('record_email_sent', {
                  user_id: account.metadata.supabaseUserId,
                  email_type: 'stripe_setup_complete'
                });
                console.log("📧 stripe_setup_complete email notification sent");
              } catch (emailError) {
                console.error("❌ Failed to send stripe setup complete email:", emailError);
              }
            }
            
            // Update profile
            const { error: updateError } = await supabase
              .from("profiles")
              .update(updateData)
              .eq("id", account.metadata.supabaseUserId);
            
            if (updateError) {
              console.error("❌ Error updating profile:", updateError);
              throw updateError;
            }
            
            console.log("✅ Profile updated with onboarding progress");
          } else {
            console.log("⚠️ No user ID found in account metadata, searching by account ID");
            
            const { data: profiles, error: findError } = await supabase
              .from("profiles")
              .select("id, stripe_setup_complete, stripe_onboarding_started_at, stripe_onboarding_completed_at")
              .eq("stripe_account_id", account.id);
            
            if (findError) {
              console.error("❌ Error finding profiles with account ID:", findError);
              throw findError;
            }
            
            if (profiles?.length) {
              console.log(`✅ Found ${profiles.length} profiles with this account ID`);
              
              for (const profile of profiles) {
                // Determine onboarding progress
                const onboardingStarted = account.details_submitted || 
                                         (account.requirements?.currently_due?.length !== account.requirements?.eventually_due?.length);
                
                const onboardingCompleted = account.payouts_enabled && account.details_submitted;
                
                // Prepare update data
                const updateData: any = {
                  stripe_setup_complete: onboardingCompleted
                };
                
                // Track onboarding start time if needed
                if (onboardingStarted && !profile.stripe_onboarding_started_at) {
                  updateData.stripe_onboarding_started_at = new Date().toISOString();
                }
                
                // Track onboarding completion time if newly completed
                if (onboardingCompleted && !profile.stripe_onboarding_completed_at) {
                  updateData.stripe_onboarding_completed_at = new Date().toISOString();
                  
                  // Send completion email only when newly completed
                  try {
                    await sendEmailNotification('stripe_setup_complete', profile.id, {});
                    await supabase.rpc('record_email_sent', {
                      user_id: profile.id,
                      email_type: 'stripe_setup_complete'
                    });
                    console.log(`📧 stripe_setup_complete email notification sent to user ${profile.id}`);
                  } catch (emailError) {
                    console.error(`❌ Failed to send stripe setup complete email to user ${profile.id}:`, emailError);
                  }
                }
                
                // Update profile
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update(updateData)
                  .eq("id", profile.id);
                
                if (updateError) {
                  console.error(`❌ Error updating profile ${profile.id}:`, updateError);
                  throw updateError;
                }
                
                console.log(`✅ Profile ${profile.id} updated with onboarding progress`);
              }
            } else {
              console.warn("⚠️ No profiles found with this account ID:", account.id);
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
