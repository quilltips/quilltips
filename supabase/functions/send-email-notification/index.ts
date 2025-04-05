
console.log("send-email edge function is open!");
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { type, userId, data = {} } = await req.json();
    console.log(`📧 Processing ${type} notification for user ${userId}`);

    // Get user email from profiles table
    const { data: profile, error: profileError } = await supabase.from('profiles').select('name, email').eq('id', userId).single();

    if (profileError || !profile) {
      console.error(`❌ Error fetching user profile: ${profileError?.message || "User not found"}`);
      return new Response(JSON.stringify({
        error: `User profile not found: ${profileError?.message || "No profile"}`
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Extract user email
    const email = profile.email;
    if (!email) {
      console.error("❌ User does not have an email in their profile");
      return new Response(JSON.stringify({
        error: "User email not found in profile"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const userName = profile.name || "Author";

    // Generate email content based on notification type
    const emailContent = generateEmailContent(type, userName, data, userId);

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Quilltips <notifications@quilltips.co>",
      to: email,
      ...emailContent
    });

    console.log(`✅ Email sent successfully for ${type} notification`);
    
    return new Response(JSON.stringify({
      success: true,
      id: emailResponse.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(`❌ Error processing notification: ${error.message}`);
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

// Generate email subject and content based on notification type
function generateEmailContent(type, userName, data, userId) {
  switch(type) {
    case 'account_setup_complete':
      return {
        subject: "Welcome to Quilltips! Your account is ready",
        html: `
          <h1>Welcome to Quilltips, ${userName}!</h1>
          <p>Your author account has been successfully created. You're all set to start receiving tips from your readers.</p>
          <p>Next steps:</p>
          <ul>
            <li>Complete your Stripe setup to receive payments</li>
            <li>Create your first QR code for your book</li>
            <li>Share your QR code with readers</li>
          </ul>
          <p>Thank you for joining Quilltips!</p>
        `
      };
    case 'qr_code_purchased':
      return {
        subject: "Your Quilltips QR Code is Ready!",
        html: `
          <h1>QR Code Purchase Successful</h1>
          <p>Hello ${userName},</p>
          <p>Your QR code for "${data.bookTitle || 'your book'}" has been successfully purchased and is now ready to use.</p>
          <p>You can view and download your QR code from your <a href="https://quilltips.app/author/book-qr-codes">dashboard</a>.</p>
          <p>Happy writing!</p>
        `
      };
    case 'tip_received':
      return {
        subject: "You've Received a Tip on Quilltips!",
        html: `
          <h1>You Received a Tip!</h1>
          <p>Great news, ${userName}! Someone appreciated your work.</p>
          <p>You've received a tip of $${data.amount || '0'} for your book "${data.bookTitle || 'your book'}".</p>
          ${data.message ? `<p>Message from the reader: "${data.message}"</p>` : ''}
          <p>View all your tips in your <a href="https://quilltips.app/author/tip-feed">Tip Feed</a>.</p>
        `
      };
    case 'stripe_setup_incomplete':
      return {
        subject: "Action Required: Complete Your Payment Setup",
        html: `
          <h1>Complete Your Payment Setup</h1>
          <p>Hello ${userName},</p>
          <p>We noticed that your Stripe payment setup is incomplete. To start receiving tips from your readers, please complete your payment setup.</p>
          <p><a href="https://quilltips.app/author/bank-account">Complete Setup Now</a></p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        `
      };
    case 'stripe_setup_complete':
      return {
        subject: "Payment Setup Complete - Ready to Receive Tips!",
        html: `
          <h1>You're All Set to Receive Tips!</h1>
          <p>Congratulations, ${userName}!</p>
          <p>Your payment account has been successfully set up. You can now receive tips from your readers directly to your bank account.</p>
          <p>Create QR codes for your books to start receiving tips.</p>
          <p><a href="https://quilltips.app/author/create-qr">Create QR Code</a></p>
        `
      };
    case 'test_email':
      return {
        subject: "Quilltips Email System Test",
        html: `
          <h1>Email System Test</h1>
          <p>Hello ${userName},</p>
          <p>This is a test email to verify that the Quilltips email notification system is working correctly.</p>
          <p>If you're receiving this email, it means our system can successfully send emails to your address.</p>
          <p>Test details:</p>
          <ul>
            <li>Timestamp: ${new Date(data.timestamp || Date.now()).toLocaleString()}</li>
            <li>User ID: ${userId || 'Not provided'}</li>
          </ul>
          <p>You can ignore this email as it was sent for testing purposes only.</p>
          <p>Thank you for using Quilltips!</p>
        `
      };
    default:
      return {
        subject: "Notification from Quilltips",
        html: `<p>Hello ${userName}, this is a notification from Quilltips.</p>`
      };
  }
}
