
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

// Email template function (copied from verification-email-template.ts)
function generateEmailHtml({ code, type = 'signup' }: { code: string; type?: string }) {
  const title = type === 'signup' ? 'Welcome to Quilltips!' : 'Verify Your Email';
  const message = type === 'signup' 
    ? 'Thanks for signing up! Please verify your email address with the code below:'
    : 'Please verify your email address with the code below:';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
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
        .code-container { 
          background-color: #f8f9fa; 
          border: 2px solid #e9ecef; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
          display: inline-block; 
        }
        .code { 
          font-size: 32px; 
          font-weight: bold; 
          color: #2D3748; 
          letter-spacing: 4px; 
          font-family: 'Courier New', monospace; 
        }
        .code-label { 
          font-size: 12px; 
          color: #666; 
          text-transform: uppercase; 
          margin-bottom: 8px; 
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📚</div>
          <h1 class="brand-title">Quilltips</h1>
          <p class="brand-tagline">Helping authors get paid</p>
        </div>
        
        <div class="content">
          <p class="message">${message}</p>
          
          <div class="code-container">
            <div class="code-label">Verification Code</div>
            <div class="code">${code}</div>
          </div>
          
          <p class="expiry">This code will expire in 10 minutes.</p>
        </div>

        <hr>
        
        <div class="footer">
          <p>If you didn't request this verification code, you can safely ignore this email.</p>
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
