
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
    console.log('Generating QR code for:', { bookTitle, authorId, qrCodeId });

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

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    // Construct the tip URL for this book
    const tipUrl = `${req.headers.get('origin')}/author/profile/${authorId}?qr=${qrCodeId}`;
    console.log('Generated tip URL:', tipUrl);

    // Configure QR code payload
    const qrCodePayload = {
      name: `QR Code for ${bookTitle}`,
      qr_type: 2, // Dynamic QR code
      campaign: {
        content_type: 1, // Custom URL type
        custom_url: tipUrl
      },
      location_enabled: false,
      attributes: {
        color: '#2595ff',
        colorDark: '#2595ff',
        margin: 80,
        isVCard: false,
        frameText: 'Tip the author!',
        logoImage: 'https://quilltips.dev/public/lovable-uploads/4c722b40-1ed8-45e5-a9db-b2653f1b148b.png',
        logoScale: 0.1992,
        frameColor: '#2595ff',
        frameStyle: 'banner-bottom',
        logoMargin: 10,
        dataPattern: 'square',
        eyeBallShape: 'circle',
        gradientType: 'none',
        eyeFrameColor: '#2595ff',
        eyeFrameShape: 'rounded'
      }
    };

    console.log('Sending request to Uniqode API with payload:', JSON.stringify(qrCodePayload, null, 2));

    // Call Uniqode API to generate QR code
    const uniqodeResponse = await fetch('https://api.uniqode.com/api/2.0/qrcodes/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('UNIQODE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(qrCodePayload)
    });

    if (!uniqodeResponse.ok) {
      const errorText = await uniqodeResponse.text();
      console.error('Uniqode API error response:', errorText);
      throw new Error(`Failed to generate QR code: ${uniqodeResponse.status} ${errorText}`);
    }

    const qrCodeData = await uniqodeResponse.json();
    console.log('QR code generated successfully:', qrCodeData);

    // Get the QR code image URL from the response
    const qrCodeImageUrl = qrCodeData.qr_image || qrCodeData.url;

    if (!qrCodeImageUrl) {
      throw new Error('No QR code image URL in response');
    }

    // Update the QR code record with the generated image URL
    const { error: updateError } = await supabaseClient
      .from('qr_codes')
      .update({
        qr_code_image_url: qrCodeImageUrl,
        qr_code_status: 'generated'
      })
      .eq('id', qrCodeId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ url: qrCodeImageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating QR code:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500
      }
    );
  }
});
