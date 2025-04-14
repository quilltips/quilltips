
// supabase/functions/stripe-email-reminders/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from 'https://esm.sh/stripe@14.21.0';

console.log("💌 Stripe email reminders edge function running");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || '',
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ''
);

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("⏰ Starting scheduled Stripe email reminder job");
    
    // 1. Get profiles with Stripe accounts but no completed onboarding
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, stripe_account_id, stripe_onboarding_started_at, stripe_onboarding_completed_at, stripe_emails_sent')
      .is('stripe_onboarding_completed_at', null)
      .not('stripe_account_id', 'is', null);
    
    if (error) {
      throw new Error(`Failed to fetch profiles: ${error.message}`);
    }
    
    console.log(`🔍 Found ${profiles.length} profiles with incomplete Stripe onboarding`);
    
    // Track results for reporting
    const results = {
      processed: 0,
      day1_reminders_sent: 0,
      day3_reminders_sent: 0,
      errors: 0
    };
    
    // Process each profile
    for (const profile of profiles || []) {
      try {
        results.processed++;
        
        // Skip if no stripe_account_id
        if (!profile.stripe_account_id) continue;
        
        // Check if emails have already been sent
        const emailsSent = profile.stripe_emails_sent || [];
        const hasDay1EmailBeenSent = emailsSent.some((email: any) => email.type === 'stripe_setup_reminder_day1');
        const hasDay3EmailBeenSent = emailsSent.some((email: any) => email.type === 'stripe_setup_reminder_day3');
        
        // Fetch Stripe account details to determine status
        const account = await stripe.accounts.retrieve(profile.stripe_account_id);
        
        // Determine if onboarding has been started (some details submitted)
        const onboardingStarted = account.details_submitted || 
                                  (account.requirements?.currently_due?.length !== account.requirements?.eventually_due?.length);
        
        const now = new Date();
        let shouldSendEmail = false;
        let emailType = '';
        
        // If onboarding has been started
        if (onboardingStarted) {
          // Update onboarding_started_at if not set
          if (!profile.stripe_onboarding_started_at) {
            await supabaseAdmin
              .from('profiles')
              .update({ stripe_onboarding_started_at: new Date().toISOString() })
              .eq('id', profile.id);
          }
          
          // Check if day 1 reminder is due and hasn't been sent yet
          const startedAt = profile.stripe_onboarding_started_at ? new Date(profile.stripe_onboarding_started_at) : null;
          if (startedAt && !hasDay1EmailBeenSent) {
            const daysSinceStarted = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceStarted >= 1) {
              shouldSendEmail = true;
              emailType = 'stripe_setup_reminder_day1';
            }
          }
        } else {
          // Onboarding not started, check for day 3 reminder
          // We'll use the creation date of the stripe account as reference
          const createdAt = new Date(account.created * 1000);
          const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceCreated >= 3 && !hasDay3EmailBeenSent) {
            shouldSendEmail = true;
            emailType = 'stripe_setup_reminder_day3';
          }
        }
        
        // Send email if needed
        if (shouldSendEmail && emailType) {
          await sendEmailNotification(emailType, profile.id);
          
          // Record that email was sent
          await supabaseAdmin.rpc('record_email_sent', {
            user_id: profile.id,
            email_type: emailType
          });
          
          if (emailType === 'stripe_setup_reminder_day1') {
            results.day1_reminders_sent++;
          } else if (emailType === 'stripe_setup_reminder_day3') {
            results.day3_reminders_sent++;
          }
        }
      } catch (profileError) {
        console.error(`❌ Error processing profile ${profile.id}:`, profileError);
        results.errors++;
      }
    }
    
    console.log(`✅ Completed Stripe email reminders: ${JSON.stringify(results)}`);
    
    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("❌ Error in stripe-email-reminders function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});

// Helper function to send email notifications
async function sendEmailNotification(type: string, userId: string) {
  const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
    },
    body: JSON.stringify({ type, userId })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send ${type} email notification: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}
