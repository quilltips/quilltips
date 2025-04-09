
// supabase/functions/account-created-listener/index.ts
export const config = {
  path: "/account-created-listener",
};
console.log("🚀 Account Created Listener function deployed");
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '';
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log("📬 Account Created Listener: Processing request");
    const { userId } = await req.json();
    
    if (!userId) {
      console.error("❌ Missing userId in request body");
      return new Response(JSON.stringify({
        error: "Missing userId in request body"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    console.log(`🔍 Looking up user profile for id: ${userId}`);
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error(`❌ Error fetching user profile: ${profileError?.message || "Profile not found"}`);
      return new Response(JSON.stringify({
        error: `Error fetching user profile: ${profileError?.message || "Profile not found"}`
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    console.log(`📧 Sending account_setup_complete notification for user ${userId}`);
    // Send email notification
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        type: 'account_setup_complete',
        userId,
        data: {
          // Any additional data needed for the email template
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error(`❌ Failed to send email notification: ${emailResponse.status} ${errorText}`);
      throw new Error(`Failed to send email notification: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log(`✅ Email notification sent successfully: ${JSON.stringify(emailResult)}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Account setup notification sent",
      emailId: emailResult.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error(`❌ Error in account-created-listener: ${error.message}`);
    return new Response(JSON.stringify({
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
