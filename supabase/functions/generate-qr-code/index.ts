
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
    console.log('Starting QR code generation for:', { bookTitle, authorId, qrCodeId });

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

    // Configure QR code payload for the basic version
    const basicQRCodePayload = {
      name: `QR Code for ${bookTitle}`,
      organization: parseInt(Deno.env.get('UNIQODE_ORGANIZATION_ID') || '0', 10),
      qr_type: 2, // Dynamic QR code
      campaign: {
        content_type: 1, // Custom URL type
        custom_url: tipUrl
      },
      location_enabled: false,
      attributes: {
        color: '#000000',
        colorDark: '#000000',
        margin: 0,
        isVCard: false,
        frameText: '',
        logoScale: 0,
        dataPattern: 'square',
        eyeBallShape: 'circle',
        gradientType: 'none',
        eyeFrameColor: '#000000',
        eyeFrameShape: 'rounded'
      }
    };

    // Configure QR code payload for the framed version
    const framedQRCodePayload = {
      name: `Framed QR Code for ${bookTitle}`,
      organization: parseInt(Deno.env.get('UNIQODE_ORGANIZATION_ID') || '0', 10),
      qr_type: 2,
      campaign: {
        content_type: 1,
        custom_url: tipUrl
      },
      location_enabled: false,
      attributes: {
        color: '#2595ff',
        colorDark: '#2595ff',
        margin: 80,
        isVCard: false,
        frameText: 'Like the book? Tip the author!',
        logoImage: 'https://quilltips.dev/public/lovable-uploads/9e643d19-106e-42b3-b358-0dd83952415a.png',
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

    console.log('Sending request to Uniqode API for basic QR code');
    const basicQRResponse = await fetch('https://api.uniqode.com/api/2.0/qrcodes/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('UNIQODE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(basicQRCodePayload)
    });

    console.log('Basic QR Response status:', basicQRResponse.status);
    const basicQRData = await basicQRResponse.json();
    console.log('Basic QR Response data:', basicQRData);

    console.log('Sending request to Uniqode API for framed QR code');
    const framedQRResponse = await fetch('https://api.uniqode.com/api/2.0/qrcodes/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('UNIQODE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(framedQRCodePayload)
    });

    console.log('Framed QR Response status:', framedQRResponse.status);
    const framedQRData = await framedQRResponse.json();
    console.log('Framed QR Response data:', framedQRData);

    if (!basicQRResponse.ok || !framedQRResponse.ok) {
      console.error('QR code generation failed. Basic QR:', basicQRData, 'Framed QR:', framedQRData);
      throw new Error(`Failed to generate QR codes: ${basicQRResponse.status} ${framedQRResponse.status}`);
    }

    // Update the QR code record with both URLs
    const updateData = {
      qr_code_image_url: basicQRData.url,
      framed_qr_code_image_url: framedQRData.url,
      uniqode_qr_code_id: basicQRData.id.toString(),
      qr_code_status: 'generated'
    };
    
    console.log('Updating QR code record with:', updateData);
    
    const { error: updateError } = await supabaseClient
      .from('qr_codes')
      .update(updateData)
      .eq('id', qrCodeId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('Successfully updated QR code record');

    return new Response(
      JSON.stringify({ 
        url: basicQRData.url,
        framedUrl: framedQRData.url,
        uniqodeId: basicQRData.id.toString()
      }),
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
