
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QRCodeParams {
  bookTitle: string;
  authorId: string;
  qrCodeId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookTitle, authorId, qrCodeId } = await req.json() as QRCodeParams;

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get author's profile to construct the tip URL
    const { data: authorProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', authorId)
      .single();

    if (profileError) throw profileError;

    // Construct the tip URL for this book
    const tipUrl = `${req.headers.get('origin')}/author/profile/${authorId}?qr=${qrCodeId}`;

    // Call Uniqode API to generate QR code
    const uniqodeResponse = await fetch('https://api.uniqode.com/v2/qr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('UNIQODE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: tipUrl,
        options: {
          backgroundColor: '#FFFFFF',
          foregroundColor: '#000000',
          logo: {
            image: 'https://quilltips.dev/public/lovable-uploads/4c722b40-1ed8-45e5-a9db-b2653f1b148b.png',
            size: 0.2 // 20% of QR code size
          },
          caption: {
            text: 'Like the book? Tip the author!',
            fontSize: 14,
            color: '#000000',
            position: 'bottom'
          }
        }
      })
    });

    if (!uniqodeResponse.ok) {
      const errorData = await uniqodeResponse.json();
      console.error('Uniqode API error:', errorData);
      throw new Error('Failed to generate QR code');
    }

    const qrCodeData = await uniqodeResponse.json();

    // Update the QR code record with the generated image URL
    const { error: updateError } = await supabaseClient
      .from('qr_codes')
      .update({
        qr_code_image_url: qrCodeData.url,
        qr_code_status: 'generated'
      })
      .eq('id', qrCodeId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ url: qrCodeData.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating QR code:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
