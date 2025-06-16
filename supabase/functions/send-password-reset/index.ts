
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Email template function for password reset
function generatePasswordResetEmailHtml({ resetUrl }: { resetUrl: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Quilltips Password</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; 
          background-color: #f6f9fc; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          padding: 40px 20px; 
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
        }
        .logo { 
          width: 60px; 
          height: 60px; 
          margin: 0 auto 12px; 
          background-color: #FFD166; 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        }
        .brand-title { 
          font-size: 24px; 
          font-weight: bold; 
          color: #2D3748; 
          margin: 0; 
        }
        .brand-tagline { 
          font-size: 14px; 
          color: #666; 
          margin: 4px 0 0 0; 
        }
        .content { 
          text-align: center; 
          margin: 30px 0; 
        }
        .message { 
          font-size: 16px; 
          color: #333; 
          line-height: 1.5; 
          margin-bottom: 30px; 
        }
        .button-container { 
          text-align: center; 
          margin: 30px 0; 
        }
        .reset-button { 
          background-color: #FFD166; 
          color: #2D3748; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: bold; 
          display: inline-block; 
          margin: 20px 0; 
        }
        .expiry { 
          font-size: 14px; 
          color: #666; 
          margin-top: 20px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e9ecef; 
          font-size: 12px; 
          color: #666; 
        }
        hr { 
          border: none; 
          border-top: 1px solid #e9ecef; 
          margin: 20px 0; 
        }
        .url-fallback {
          font-size: 12px;
          color: #666;
          margin-top: 15px;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📚</div>
          <h1 class="brand-title">Quilltips</h1>
          <p class="brand-tagline">Helping authors grow</p>
        </div>
        
        <div class="content">
          <p class="message">We received a request to reset your password. Click the button below to create a new password for your Quilltips account.</p>
          
          <div class="button-container">
            <a href="${resetUrl}" class="reset-button">Reset Password</a>
          </div>
          
          <p class="expiry">This link will expire in 1 hour for security reasons.</p>
          
          <p class="url-fallback">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="color: #2D3748;">${resetUrl}</span>
          </p>
        </div>

        <hr>
        
        <div class="footer">
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>Need help? Contact us at <a href="mailto:hello@quilltips.co">hello@quilltips.co</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

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

    // Generate email content using the template
    const emailHtml = generatePasswordResetEmailHtml({ resetUrl });

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Quilltips <notifications@quilltips.co>",
      to: email,
      subject: "Reset Your Quilltips Password",
      html: emailHtml
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
