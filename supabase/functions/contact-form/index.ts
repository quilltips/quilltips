
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL") || "hello@quilltips.co";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { name, email, message }: ContactFormData = await req.json();
    
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Processing contact form submission from ${name} (${email})`);

    // 1. Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "Quilltips <notifications@quilltips.co>",
      to: email,
      subject: "We've received your message",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for contacting us!</h2>
          <p>Hello ${name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <p>Here's a copy of your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="white-space: pre-line;">${message}</p>
          </div>
          <p>Best regards,<br>The Quilltips Team</p>
        </div>
      `
    });

    // 2. Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Quilltips Contact Form <notifications@quilltips.co>",
      to: adminEmail,
      subject: `New contact form message from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="white-space: pre-line;">${message}</p>
          </div>
          <p>You can reply directly to this email to respond to ${name}.</p>
        </div>
      `
    });

    console.log("Emails sent successfully:", {
      userEmailId: userEmailResponse.id,
      adminEmailId: adminEmailResponse.id
    });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Your message has been sent successfully!" 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({ 
        error: "There was an error sending your message. Please try again." 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
