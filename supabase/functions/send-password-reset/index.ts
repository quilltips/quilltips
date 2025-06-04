
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { generateEmailHtml } from "../send-verification-code/verification-email-template.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const { email } = await req.json();
    console.log(`📧 Processing password reset request for ${email}`);

    // Get user profile from email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error(`❌ Error fetching user profile: ${profileError?.message || "User not found"}`);
      // Don't reveal if email exists or not for security
      return new Response(JSON.stringify({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Generate password reset link using Supabase Auth
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://quilltips.co'}/author/reset-password`
      }
    });

    if (error) {
      console.error(`❌ Error generating reset link: ${error.message}`);
      throw error;
    }

    const resetUrl = data.properties?.action_link;
    if (!resetUrl) {
      throw new Error("Failed to generate reset link");
    }

    console.log(`✅ Generated reset link for ${email}`);

    // Generate email content using the existing template
    const emailHtml = generateEmailHtml({
      code: '', // We don't need a code for password reset
      type: 'password_reset'
    });

    // Customize the email HTML for password reset
    const customEmailHtml = emailHtml
      .replace('Welcome to Quilltips!', 'Reset Your Password')
      .replace('Thanks for signing up! Please verify your email address with the code below:', 
               'Click the button below to reset your password. This link will expire in 1 hour.')
      .replace(/<div class="code-container">[\s\S]*?<\/div>/, 
               `<div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #FFD166; color: #2D3748; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>`)
      .replace('This code will expire in 10 minutes.', 'This link will expire in 1 hour.')
      .replace('If you didn\'t request this verification code', 'If you didn\'t request this password reset');

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Quilltips <notifications@quilltips.co>",
      to: email,
      subject: "Reset Your Quilltips Password",
      html: customEmailHtml
    });

    console.log(`✅ Password reset email sent successfully`);
    
    return new Response(JSON.stringify({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      id: emailResponse.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(`❌ Error processing password reset: ${error.message}`);
    return new Response(JSON.stringify({
      error: "Failed to process password reset request"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
