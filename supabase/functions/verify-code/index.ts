
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { email, code } = await req.json();
    console.log(`🔍 Verifying code for ${email}`);

    if (!email || !code) {
      return new Response(JSON.stringify({
        error: "Email and code are required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Clean up expired codes first
    await supabase.rpc('cleanup_expired_verification_codes');

    // Find valid verification code
    const { data: verificationRecord, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching verification code:", fetchError);
      return new Response(JSON.stringify({
        error: "Database error"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    if (!verificationRecord) {
      // Check if there's an expired or already used code
      const { data: expiredRecord } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (expiredRecord) {
        if (expiredRecord.verified) {
          return new Response(JSON.stringify({
            error: "This verification code has already been used"
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
        } else {
          return new Response(JSON.stringify({
            error: "This verification code has expired"
          }), {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
        }
      }

      // Increment attempts for rate limiting
      await supabase
        .from('verification_codes')
        .update({ attempts: verificationRecord?.attempts ? verificationRecord.attempts + 1 : 1 })
        .eq('email', email)
        .eq('code', code);

      return new Response(JSON.stringify({
        error: "Invalid verification code"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Mark code as verified
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', verificationRecord.id);

    if (updateError) {
      console.error("Error updating verification code:", updateError);
      return new Response(JSON.stringify({
        error: "Failed to verify code"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    console.log(`✅ Code verified successfully for ${email}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Email verified successfully"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(`❌ Error verifying code: ${error.message}`);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
