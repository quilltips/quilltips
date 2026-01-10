
console.log("send-email edge function is open!");
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "resend";
import { generateEmailHtml } from "./quilltips-email-template.ts";

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
      subject: emailContent.subject,
      html: generateEmailHtml({
        header: emailContent.header || emailContent.subject,
        message: emailContent.mainMessage,
        cta: emailContent.cta?.text,
        ctaUrl: emailContent.cta?.url,
        additionalContent: emailContent.additionalContent
      })
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

// Generate email content based on notification type
function generateEmailContent(type, userName, data, userId) {
  switch(type) {
    case 'account_setup_complete':
      return {
        subject: "Welcome to Quilltips! Your account is ready",
        header: `Welcome to Quilltips, ${userName}!`,
        mainMessage: "Your author account has been successfully created. You're all set to start receiving tips from your readers.",
        additionalContent: `
          <p><strong>Next steps:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>Complete your Stripe setup to receive payments</li>
            <li>Create your first QR code for your book</li>
            <li>Share your QR code with readers</li>
          </ul>
        `,
        cta: {
          text: "Go to Dashboard",
          url: "https://quilltips.co/author/dashboard"
        }
      };
    case 'qr_code_purchased':
      return {
        subject: "Your Quilltips QR Code is Ready!",
        header: "QR Code Purchase Successful",
        mainMessage: `Hello ${userName}, your QR code for "${data.bookTitle || 'your book'}" has been successfully purchased and is now ready to use.`,
        cta: {
          text: "View Your QR Codes",
          url: "https://quilltips.co/author/book-qr-codes"
        }
      };
    case 'tip_received':
      return {
        subject: "You've Received a Tip on Quilltips!",
        header: "You Received a Tip!",
        mainMessage: `Great news, ${userName}! Someone appreciated your work.`,
        additionalContent: `
          <p>You've received a tip of $${data.amount || '0'} for your book "${data.bookTitle || 'your book'}".</p>
          ${data.message ? `<p><em>"${data.message}"</em></p>` : ''}
        `,
        cta: {
          text: "View Tip Details",
          url: "https://quilltips.co/author/tip-feed"
        }
      };
    case 'arc_signup':
      return {
        subject: "New ARC Reader Signup on Quilltips",
        header: "New ARC Reader Request",
        mainMessage: `Hello ${userName}, you have received a new ARC reader signup request.`,
        additionalContent: `
          <p><strong>Reader Details:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>Name: ${data.readerName || 'Not provided'}</li>
            <li>Email: ${data.readerEmail || 'Not provided'}</li>
            ${data.readerLocation ? `<li>Location: ${data.readerLocation}</li>` : ''}
          </ul>
          ${data.message ? `<p><strong>Message:</strong></p><p><em>"${data.message}"</em></p>` : ''}
        `,
        cta: {
          text: "View Dashboard",
          url: "https://quilltips.co/author/data"
        }
      };
    case 'beta_reader_signup':
      return {
        subject: "New Beta Reader Application on Quilltips",
        header: "New Beta Reader Application",
        mainMessage: `Hello ${userName}, you have received a new beta reader application.`,
        additionalContent: `
          <p><strong>Applicant Details:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>Name: ${data.readerName || 'Not provided'}</li>
            <li>Email: ${data.readerEmail || 'Not provided'}</li>
            ${data.readingExperience ? `<li>Reading Experience: ${data.readingExperience}</li>` : ''}
          </ul>
          ${data.message ? `<p><strong>Why they want to be a beta reader:</strong></p><p><em>"${data.message}"</em></p>` : ''}
        `,
        cta: {
          text: "View Dashboard",
          url: "https://quilltips.co/author/data"
        }
      };
    case 'newsletter_signup':
      return {
        subject: "New Newsletter Subscriber on Quilltips",
        header: "New Newsletter Subscriber",
        mainMessage: `Hello ${userName}, you have a new newsletter subscriber.`,
        additionalContent: `
          <p><strong>Subscriber Details:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            ${data.subscriberName ? `<li>Name: ${data.subscriberName}</li>` : ''}
            <li>Email: ${data.subscriberEmail || 'Not provided'}</li>
          </ul>
        `,
        cta: {
          text: "View Dashboard",
          url: "https://quilltips.co/author/data"
        }
      };
    case 'book_club_invite':
      const eventTypeLabels = {
        'book_club': 'Book Club Meeting',
        'virtual_event': 'Virtual Event',
        'in_person_event': 'In-Person Event',
        'other': 'Other Event'
      };
      return {
        subject: "New Book Club Invitation on Quilltips",
        header: "New Event Invitation",
        mainMessage: `Hello ${userName}, you have received an invitation to attend a reader event.`,
        additionalContent: `
          <p><strong>Event Details:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>From: ${data.readerName || 'Not provided'}</li>
            <li>Email: ${data.readerEmail || 'Not provided'}</li>
            <li>Event Type: ${eventTypeLabels[data.eventType] || data.eventType || 'Not specified'}</li>
            ${data.eventDate ? `<li>Date: ${data.eventDate}</li>` : ''}
            ${data.eventLocation ? `<li>Location: ${data.eventLocation}</li>` : ''}
          </ul>
          ${data.message ? `<p><strong>About the event:</strong></p><p><em>"${data.message}"</em></p>` : ''}
          <p style="margin-top: 16px;">Feel free to email the reader directly to coordinate and learn more.</p>
        `,
        cta: {
          text: "View Dashboard",
          url: "https://quilltips.co/author/data"
        }
      };
    case 'stripe_setup_incomplete':
      return {
        subject: "Action Required: Complete Your Payment Setup",
        header: "Complete Your Payment Setup",
        mainMessage: `Hello ${userName}, we noticed that your Stripe payment setup is incomplete. To start receiving tips from your readers, please complete your payment setup.`,
        cta: {
          text: "Complete Setup Now",
          url: "https://quilltips.co/author/bank-account"
        }
      };
    case 'stripe_setup_complete':
      return {
        subject: "Payment Setup Complete - Ready to Receive Tips!",
        header: "You're All Set to Receive Tips!",
        mainMessage: `Congratulations, ${userName}! Your payment account has been successfully set up. You can now receive tips from your readers directly to your bank account.`,
        additionalContent: `
          <p>All the necessary payment details have been verified and your account is ready to go. Tips will be automatically transferred to your connected bank account.</p>
          <p>Now's a great time to create QR codes for your books so readers can show their appreciation!</p>
        `,
        cta: {
          text: "Create QR Code",
          url: "https://quilltips.co/author/create-qr"
        }
      };
    case 'stripe_setup_reminder_day1':
      return {
        subject: "Finish Your Payment Setup - Just a Few Steps Left",
        header: "Almost There! Finish Your Payment Setup",
        mainMessage: `Hello ${userName}, you've started setting up your payment account but haven't completed it yet.`,
        additionalContent: `
          <p>You're just a few steps away from being able to receive tips from your readers. It only takes a few minutes to complete the remaining steps.</p>
          <p><strong>Benefits of completing your setup:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>Start receiving tips directly to your bank account</li>
            <li>Track all your earnings in one place</li>
            <li>Get paid automatically when readers appreciate your work</li>
          </ul>
        `,
        cta: {
          text: "Complete Your Setup",
          url: "https://quilltips.co/author/bank-account"
        }
      };
    case 'stripe_setup_reminder_day3':
      return {
        subject: "Set Up Payments to Start Receiving Tips",
        header: "Don't Miss Out on Reader Tips",
        mainMessage: `Hello ${userName}, we noticed you haven't set up your payment account yet.`,
        additionalContent: `
          <p>Setting up your payment account is essential to start receiving tips from your readers. The process is simple and only takes a few minutes.</p>
          <p><strong>Why connect your bank account?</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>Allow readers to send you tips for your books</li>
            <li>Receive payments directly into your bank account</li>
            <li>Build a stronger connection with your audience</li>
          </ul>
          <p>Our authors who complete their payment setup see an average increase of 30% in reader engagement!</p>
        `,
        cta: {
          text: "Connect Your Bank Account",
          url: "https://quilltips.co/author/bank-account"
        }
      };
    case 'test_email':
      return {
        subject: "Quilltips Email System Test",
        header: "Email System Test",
        mainMessage: `Hello ${userName}, this is a test email to verify that the Quilltips email notification system is working correctly.`,
        additionalContent: `
          <p>If you're receiving this email, it means our system can successfully send emails to your address.</p>
          <p><strong>Test details:</strong></p>
          <ul style="text-align: left; display: inline-block;">
            <li>Timestamp: ${new Date(data.timestamp || Date.now()).toLocaleString()}</li>
            <li>User ID: ${userId || 'Not provided'}</li>
          </ul>
          <p>You can ignore this email as it was sent for testing purposes only.</p>
        `
      };
    default:
      return {
        subject: "Notification from Quilltips",
        mainMessage: `Hello ${userName}, this is a notification from Quilltips.`
      };
  }
}
