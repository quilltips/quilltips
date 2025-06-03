
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { generateEmailHtml } from "./verification-email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { email, type = 'signup' } = await req.json();
    console.log(`📧 Sending verification code for ${email}`);

    if (!email) {
      return new Response(JSON.stringify({
        error: "Email is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Check rate limiting - allow max 3 codes per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentCodes, error: countError } = await supabase
      .from('verification_codes')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
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

    if (recentCodes && recentCodes.length >= 3) {
      return new Response(JSON.stringify({
        error: "Too many verification codes requested. Please try again later."
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in database
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error("Error storing verification code:", insertError);
      return new Response(JSON.stringify({
        error: "Failed to generate verification code"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Quilltips <notifications@quilltips.co>",
      to: email,
      subject: "Your Quilltips verification code",
      html: generateEmailHtml({
        code,
        type
      })
    });

    console.log(`✅ Verification code sent successfully for ${email}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Verification code sent successfully"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(`❌ Error sending verification code: ${error.message}`);
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
