import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { generateEmailHtml } from "./quilltips-email-template.ts";

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

    const messageContent = `
      <p style="margin-bottom: 20px;"><strong>${displayName}</strong> sent you a message${bookInfo}:</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #FFD166; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>

      ${readerEmail ? `<p style="margin-top: 20px;"><strong>Reply to:</strong> <a href="mailto:${readerEmail}" style="color: #19363C;">${readerEmail}</a></p>` : ''}
      
      <p style="margin-top: 30px; color: #666;">This message was sent through your Quilltips QR code${bookInfo}.</p>
    `;

    const emailHtml = generateEmailHtml({
      header: `📬 New Message from ${displayName}`,
      message: `Hi ${authorData.name || 'there'},`,
      additionalContent: messageContent,
      cta: "View in Dashboard",
      ctaUrl: "https://quilltips.co/dashboard"
    });

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
