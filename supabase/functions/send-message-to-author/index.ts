import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { authorId, authorName, readerName, readerEmail, message, bookTitle, qrCodeId } = await req.json();

    console.log(`📧 Sending message to author ${authorName} from ${readerEmail}`);

    if (!authorId || !readerEmail || !message) {
      throw new Error("Missing required fields");
    }

    // Get author's email
    const { data: authorData, error: authorError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', authorId)
      .single();

    if (authorError || !authorData?.email) {
      console.error("Error fetching author email:", authorError);
      throw new Error("Could not find author email");
    }

    const displayName = readerName || 'A reader';
    const bookInfo = bookTitle ? ` about "${bookTitle}"` : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #19363C; padding: 30px 20px; text-align: center; }
            .header h1 { color: #FFD166; margin: 0; font-size: 24px; }
            .content { padding: 40px 30px; }
            .message-box { background-color: #f9f9f9; border-left: 4px solid #FFD166; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .message-box p { margin: 0; white-space: pre-wrap; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .footer a { color: #19363C; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Message from a Reader</h1>
            </div>
            <div class="content">
              <p>Hi ${authorData.name || 'there'},</p>
              <p><strong>${displayName}</strong> sent you a message${bookInfo}:</p>
              
              <div class="message-box">
                <p>${message}</p>
              </div>

              ${readerEmail ? `<p><strong>Reply to:</strong> <a href="mailto:${readerEmail}">${readerEmail}</a></p>` : ''}
              
              <p style="margin-top: 30px;">This message was sent through your Quilltips QR code${bookInfo}.</p>
            </div>
            <div class="footer">
              <p>
                <a href="https://quilltips.co">Quilltips</a> | 
                Connecting authors with readers
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Quilltips <notifications@quilltips.co>",
      to: authorData.email,
      replyTo: readerEmail,
      subject: `New message from ${displayName}${bookInfo}`,
      html: emailHtml
    });

    console.log(`✅ Message sent successfully to ${authorData.email}`);

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
    console.error(`❌ Error sending message: ${error.message}`);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
