
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
      message: emailContent.mainMessage,
      header: emailContent.header,
      additionalContent: emailContent.additionalContent,
      cta: emailContent.cta,
      ctaUrl: emailContent.ctaUrl,
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
async function getOrCreateUnsubscribeToken(tipId) {
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
function generateEmailContent(type, data, token) {
  switch (type) {
    case 'tip_liked':
      return {
        subject: `${data.authorName} liked your tip!`,
        header: "Your tip was liked! 💛",
        mainMessage: `${data.authorName} has liked your tip${data.bookTitle ? ` for "${data.bookTitle}"` : ""}!`,
        cta: "View Your Tips",
        ctaUrl: "https://quilltips.co/dashboard",
        additionalContent: data.message ? `
          <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #FFD166; border-radius: 8px;">
            <p style="font-style: italic; margin: 0; font-size: 16px; color: #4A5568;">"${data.message}"</p>
            <p style="font-size: 14px; color: #6B7280; margin: 12px 0 0 0; font-weight: 500;">Your tip: $${data.amount}</p>
          </div>
        ` : ''
      };
    case 'tip_commented':
      return {
        subject: `${data.authorName} commented on your tip!`,
        header: "New comment on your tip! 💬",
        mainMessage: `${data.authorName} has commented on your tip${data.bookTitle ? ` for "${data.bookTitle}"` : ""}!`,
        cta: "View Comment",
        ctaUrl: "https://quilltips.co/dashboard",
        additionalContent: `
          ${data.message ? `
            <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #FFD166; border-radius: 8px;">
              <p style="font-style: italic; margin: 0; font-size: 16px; color: #4A5568;">"${data.message}"</p>
              <p style="font-size: 14px; color: #6B7280; margin: 12px 0 0 0; font-weight: 500;">Your tip: $${data.amount}</p>
            </div>
          ` : ''}
          <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #19363C; border-radius: 8px;">
            <p style="margin: 0; font-weight: 600; color: #19363C; font-size: 16px;">Author's comment:</p>
            <p style="margin: 12px 0 0 0; font-size: 16px; color: #4A5568;">"${data.commentContent}"</p>
          </div>
        `
      };
    default:
      return {
        subject: "Notification from Quilltips",
        header: "You have a notification",
        mainMessage: "You've received a notification from Quilltips.",
        cta: "Visit Quilltips",
        ctaUrl: "https://quilltips.co"
      };
  }
}

// Generate HTML email template with enhanced styling matching the main template
function generateEmailHtml({ message, header, additionalContent = '', cta, ctaUrl, unsubscribeToken, tipId }) {
  const siteUrl = Deno.env.get("SITE_URL") || "https://quilltips.co";
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}&tipId=${tipId}`;
  console.log(`📧 Generated unsubscribe URL: ${unsubscribeUrl}`);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${header || 'Notification from Quilltips'}</title>
        
        <!-- Google Fonts Import with Fallbacks -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <style type="text/css">
          /* Font fallbacks for email clients that don't support Google Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;500;600;700&display=swap');
          
          /* Gmail-specific CSS fixes */
          .gmail-fix { display: none !important; }
          
          /* Target Gmail specifically */
          u + .body .gmail-background { background-color: #f8fafc !important; }
          u + .body .gmail-container { background-color: #ffffff !important; }
          u + .body .gmail-header { background-color: #19363C !important; }
          u + .body .gmail-button { background-color: #FFD166 !important; }
          u + .body .gmail-footer { background-color: #F7FAFC !important; }
          
          /* Gmail Dark Mode fixes */
          [data-ogsc] .gmail-container { background-color: #ffffff !important; }
          [data-ogsc] .gmail-header { background-color: #19363C !important; }
          [data-ogsc] .gmail-button { background-color: #FFD166 !important; color: #19363C !important; }
          [data-ogsc] .gmail-footer { background-color: #F7FAFC !important; }
          
          /* Responsive typography and layout */
          @media screen and (max-width: 600px) {
            .gmail-mobile { width: 100% !important; }
            .gmail-mobile-padding { padding: 20px !important; }
            .mobile-stack { display: block !important; width: 100% !important; }
            .mobile-logo { text-align: center !important; padding-bottom: 16px !important; }
            .mobile-text { text-align: center !important; }
            
            /* Mobile font sizing */
            .mobile-body { font-size: 15px !important; }
            .mobile-padding { padding: 16px !important; }
            .mobile-header-padding { padding: 24px 16px !important; }
          }
          
          @media screen and (min-width: 601px) {
            /* Desktop font sizing */
            .desktop-body { font-size: 16px !important; }
          }
          
          /* Remove Gmail's blue links */
          a[x-gmail-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
          /* Fix Gmail image issues */
          img {
            outline: none !important;
            text-decoration: none !important;
            -ms-interpolation-mode: bicubic !important;
            border: 0 !important;
          }
          
          /* Font family definitions with fallbacks */
          .font-playfair {
            font-family: 'Playfair Display', Georgia, 'Times New Roman', serif !important;
          }
          
          .font-lato {
            font-family: 'Lato', Arial, Helvetica, sans-serif !important;
          }
        </style>
        
        <!--[if mso]>
        <style type="text/css">
          table { border-collapse: collapse; border-spacing: 0; }
          .button { padding: 0 !important; }
          .button a { padding: 16px 32px !important; }
          /* Outlook font handling */
          .font-playfair { font-family: Georgia, 'Times New Roman', serif !important; }
          .font-lato { font-family: Arial, Helvetica, sans-serif !important; }
          /* Outlook dark header fix */
          .gmail-header { background-color: #19363C !important; }
        </style>
        <![endif]-->
      </head>
      <body class="body font-lato" style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Lato', Arial, Helvetica, sans-serif;">
        <!-- Gmail background fix -->
        <div class="gmail-background" style="background-color: #f8fafc;">
          <!-- Main Container Table -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; margin: 0; padding: 0;" bgcolor="#f8fafc">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                
                <!-- Email Content Table -->
                <table class="gmail-container gmail-mobile" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" bgcolor="#ffffff">
                  
                  <!-- Dark Header Section with Logo and Branding -->
                  <tr>
                    <td class="gmail-header mobile-header-padding" style="background-color: #19363C; padding: 40px 48px; text-align: center;" bgcolor="#19363C" align="center">
                      <!-- Logo -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding-bottom: 16px;">
                            <img src="https://qrawynczvedffcvnympn.supabase.co/storage/v1/object/public/public-assets/logo_nav.png" 
                                 alt="Quilltips Logo" 
                                 style="display: block; max-width: 100%; width: 220px; height: auto; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" 
                                 class="mobile-logo" />
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Tagline -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #ffffff; text-align: center; font-weight: 300; opacity: 0.9;" align="center">
                            Connecting authors with their readers
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Main Content Section -->
                  <tr>
                    <td class="gmail-mobile-padding mobile-padding" style="padding: 48px 48px; background-color: #ffffff;" bgcolor="#ffffff">
                      
                      <!-- Header Text -->
                      ${header ? `
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-playfair" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #19363C; text-align: center; line-height: 1.3; margin: 0 0 24px 0; padding-bottom: 24px;" align="center">
                            ${header}
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <!-- Main Message -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato desktop-body mobile-body" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; text-align: center; line-height: 1.6; margin: 0 0 32px 0; padding-bottom: 32px;" align="center">
                            ${message}
                          </td>
                        </tr>
                      </table>
                      
                      ${additionalContent ? `
                      <!-- Additional Content -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #4A5568; line-height: 1.6; margin: 24px 0; padding: 24px 0;">
                            ${additionalContent}
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      ${cta && ctaUrl ? `
                      <!-- CTA Button with Enhanced Styling -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 40px 0;">
                            <!--[if mso]>
                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:56px;v-text-anchor:middle;width:240px;" arcsize="28%" stroke="f" fillcolor="#FFD166">
                              <w:anchorlock/>
                              <center class="font-lato" style="color:#19363C;font-family:'Lato', Arial, sans-serif;font-size:16px;font-weight:600;">${cta}</center>
                            </v:roundrect>
                            <![endif]-->
                            <!--[if !mso]><!-->
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td class="gmail-button" style="background-color: #FFD166; border: none; border-radius: 16px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" bgcolor="#FFD166">
                                  <a href="${ctaUrl}" 
                                     class="font-lato"
                                     style="display: inline-block; padding: 20px 40px; font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; color: #19363C !important; text-decoration: none; min-width: 180px; text-align: center; line-height: 1; border-radius: 16px; transition: all 0.2s ease;"
                                     target="_blank">
                                    ${cta}
                                  </a>
                                </td>
                              </tr>
                            </table>
                            <!--<![endif]-->
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <!-- Secondary Link -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 16px; color: #6B7280; text-align: center; padding: 24px 0;" align="center">
                            Visit <a href="https://quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: 600;" target="_blank">quilltips.co</a> for more information
                          </td>
                        </tr>
                      </table>
                      
                    </td>
                  </tr>
                  
                  <!-- Enhanced Footer Section -->
                  <tr>
                    <td class="gmail-footer gmail-mobile-padding mobile-padding" style="background-color: #F7FAFC; padding: 32px 48px; text-align: center; border-top: 1px solid #E2E8F0;" bgcolor="#F7FAFC" align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td class="font-lato" style="font-family: 'Lato', Arial, Helvetica, sans-serif; font-size: 14px; color: #6B7280; line-height: 1.5; text-align: center;" align="center">
                            Questions? Contact us at <a href="mailto:hello@quilltips.co" style="color: #19363C !important; text-decoration: none; font-weight: 600;" target="_blank">hello@quilltips.co</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 20px;">
                            <div class="font-lato" style="font-size: 12px; color: #8898aa; text-align: center;">
                              <a href="${unsubscribeUrl}" style="color: #8898aa; text-decoration: underline;">Click here to unsubscribe</a> from notifications about this tip.
                              <br><br>
                              <span style="color: #9CA3AF;">© 2024 Quilltips. All rights reserved.</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
                <!-- End Email Content Table -->
                
              </td>
            </tr>
          </table>
          <!-- End Main Container Table -->
        </div>
        <!-- End Gmail background fix -->
      </body>
    </html>
  `;
}
