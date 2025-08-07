
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

    // Get QR code details to construct the tip URL using slug
    const { data: qrCodeData, error: qrError } = await supabaseClient
      .from('qr_codes')
      .select('slug, book_title')
      .eq('id', qrCodeId)
      .maybeSingle();

    if (qrError) {
      console.error('QR code error:', qrError);
      throw qrError;
    }

    // Construct the tip URL using slug if available, fallback to old format for backward compatibility
    const bookSlug = qrCodeData?.slug || 
      qrCodeData?.book_title?.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
    const tipUrl = bookSlug ? 
      `${req.headers.get('origin')}/book/${bookSlug}` : 
      `${req.headers.get('origin')}/qr/${qrCodeId}`;
    console.log('Generated tip URL:', tipUrl);

    try {
      // Configure QR code payload
      const qrCodePayload = {
        name: `QR Code for ${bookTitle}`,
        organization: parseInt(Deno.env.get('UNIQODE_ORGANIZATION_ID') || '0', 10),
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
        
        // Return error but don't throw - we still want to update the database
        const error = `Failed to generate QR code: ${uniqodeResponse.status} ${errorText}`;
        
        // Update the record to show generation failed
        await supabaseClient
          .from('qr_codes')
          .update({
            qr_code_status: 'error'
          })
          .eq('id', qrCodeId);
          
        return new Response(
          JSON.stringify({ 
            error: error,
            details: `Uniqode API returned status: ${uniqodeResponse.status}`
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }

      const qrCodeData = await uniqodeResponse.json();
      console.log('QR code response:', qrCodeData);

      if (!qrCodeData.url) {
        throw new Error('No QR code URL found in response');
      }

      // Update the QR code record with the generated URL and Uniqode ID
      const { error: updateError } = await supabaseClient
        .from('qr_codes')
        .update({
          qr_code_image_url: qrCodeData.url,
          uniqode_qr_code_id: qrCodeData.id.toString(),
          qr_code_status: 'generated'
        })
        .eq('id', qrCodeId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          url: qrCodeData.url,
          uniqodeId: qrCodeData.id.toString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (apiError) {
      console.error('API or Processing error:', apiError);
      
      // Just store a placeholder URL when the real QR generation fails
      // This allows the frontend to continue with a preview
      const { error: updateError } = await supabaseClient
        .from('qr_codes')
        .update({
          qr_code_status: 'error'
        })
        .eq('id', qrCodeId);
        
      if (updateError) {
        console.error('Database update error:', updateError);
      }
      
      throw apiError;
    }
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
