// supabase/functions/send-reader-notification/index.ts
console.log("📧 Reader notification edge function initialized");
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Create Supabase client with service role key
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
    const { type, readerEmail, data = {} } = await req.json();
    console.log(`📧 Processing ${type} notification for reader ${readerEmail}`);

    if (!readerEmail) {
      throw new Error("Reader email is required");
    }

    // Generate or retrieve unsubscribe token
    const unsubscribeToken = await getOrCreateUnsubscribeToken(data.tipId);
    console.log(`📧 Generated unsubscribe token for tip ${data.tipId}: ${unsubscribeToken}`);
    
    // Generate email content based on notification type
    const emailContent = generateEmailContent(type, data, unsubscribeToken);
    
    // Send email via Resend
    const emailHtml = generateEmailHtml({
      header: emailContent.header,
      message: emailContent.mainMessage,
      additionalContent: emailContent.additionalContent,
      unsubscribeToken: unsubscribeToken,
      tipId: data.tipId
    });

    const emailResponse = await resend.emails.send({
      from: "Quilltips <notifications@quilltips.co>",
      to: readerEmail,
      subject: emailContent.subject,
      html: emailHtml
    });

    console.log(`✅ Email sent successfully for ${type} notification to ${readerEmail}`);
    
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

// Helper function to generate or retrieve an unsubscribe token
async function getOrCreateUnsubscribeToken(tipId: string): Promise<string> {
  try {
    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('unsubscribe_tokens')
      .select('token')
      .eq('tip_id', tipId)
      .maybeSingle();
    
    if (existingToken?.token) {
      return existingToken.token;
    }
    
    // Create new token
    const token = crypto.randomUUID();
    
    const { error } = await supabase
      .from('unsubscribe_tokens')
      .insert({
        tip_id: tipId,
        token: token
      });
    
    if (error) throw error;
    
    return token;
  } catch (error) {
    console.error("Error creating unsubscribe token:", error);
    return crypto.randomUUID(); // Fallback to generate a token even if DB insert fails
  }
}

// Generate email content based on notification type
function generateEmailContent(
  type: string, 
  data: any,
  token: string
) {
  const baseUrl = "https://quilltips.app"; // Update with your actual domain
  
  switch(type) {
    case 'tip_liked':
      return {
        subject: `${data.authorName} liked your tip!`,
        header: `${data.authorName} liked your tip!`,
        mainMessage: `${data.authorName} has liked your tip${data.bookTitle ? ` for "${data.bookTitle}"` : ""}!`,
        additionalContent: data.message ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #FFD166; border-radius: 4px;">
            <p style="font-style: italic; margin: 0;">"${data.message}"</p>
            <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">Your tip: $${data.amount}</p>
          </div>
        ` : ''
      };
    case 'tip_commented':
      return {
        subject: `${data.authorName} commented on your tip!`,
        header: `${data.authorName} commented on your tip!`,
        mainMessage: `${data.authorName} has commented on your tip${data.bookTitle ? ` for "${data.bookTitle}"` : ""}!`,
        additionalContent: `
          ${data.message ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #FFD166; border-radius: 4px;">
              <p style="font-style: italic; margin: 0;">"${data.message}"</p>
              <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">Your tip: $${data.amount}</p>
            </div>
          ` : ''}
          <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #19363C; border-radius: 4px;">
            <p style="margin: 0;"><strong>Author's comment:</strong></p>
            <p style="margin: 10px 0 0 0;">"${data.commentContent}"</p>
          </div>
        `
      };
    default:
      return {
        subject: "Notification from Quilltips",
        header: "Notification from Quilltips",
        mainMessage: "You've received a notification from Quilltips."
      };
  }
}

// Generate HTML email template
function generateEmailHtml({
  header,
  message,
  additionalContent = '',
  unsubscribeToken,
  tipId
}: {
  header: string;
  message: string;
  additionalContent?: string;
  unsubscribeToken: string;
  tipId: string;
}): string {
  const siteUrl = Deno.env.get("SITE_URL") || "https://quilltips.co";
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}&tipId=${tipId}`;
  console.log(`📧 Generated unsubscribe URL: ${unsubscribeUrl}`);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${header}</title>
        <style>
          body {
            background-color: #f6f9fc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            background-color: #ffffff;
            margin: 0 auto;
            max-width: 600px;
            padding: 20px 0 48px;
            margin-bottom: 64px;
          }
          .box {
            padding: 0 48px;
          }
          .hr {
            border: none;
            border-top: 1px solid #e6ebf1;
            margin: 20px 0;
          }
          .paragraph {
            color: #333;
            font-size: 16px;
            line-height: 24px;
            text-align: center;
          }
          .brand-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 0;
          }
          .brand-tagline {
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-bottom: 24px;
          }
          .footer {
            color: #8898aa;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 12px;
          }
          .unsubscribe {
            font-size: 12px;
            color: #8898aa;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="box">
            <div class="logo-container">
              <img src="https://quilltips.co/lovable-uploads/quill_icon.png" width="60" alt="Quilltips Logo" style="border-radius: 8px;">
            </div>
            <h1 class="brand-title">Quilltips</h1>
            <p class="brand-tagline">Helping authors get paid</p>
            <hr class="hr">

            <h2 style="text-align: center;">${header}</h2>
            <p class="paragraph">${message}</p>
            
            ${additionalContent}

            <hr class="hr">

            <p class="footer">
              If you have any questions, contact us at <a href="mailto:hello@quilltips.co">hello@quilltips.co</a>
            </p>
            
            <div class="unsubscribe">
              <a href="${unsubscribeUrl}">Click here to unsubscribe</a> from notifications about this tip.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
