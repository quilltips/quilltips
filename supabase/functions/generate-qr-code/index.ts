
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
  template?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookTitle, authorId, qrCodeId, template = 'basic' } = await req.json() as QRCodeParams;
    console.log('Generating QR code for:', { bookTitle, authorId, qrCodeId, template });

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

    // Configure QR code options based on template
    const qrOptions = {
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
      logo: {
        image: 'https://quilltips.dev/public/lovable-uploads/4c722b40-1ed8-45e5-a9db-b2653f1b148b.png',
        size: 0.2
      },
      caption: {
        text: 'Like the book? Tip the author!',
        fontSize: 14,
        color: '#000000',
        position: 'bottom'
      }
    };

    // Add template-specific customizations
    switch (template) {
      case 'circular':
        qrOptions.foregroundColor = '#1a365d';
        break;
      case 'artistic':
        qrOptions.foregroundColor = '#2b6cb0';
        break;
      default:
        break;
    }

    // Call Uniqode API to generate QR code
    const uniqodeResponse = await fetch('https://api.uniqode.com/v2/qr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('UNIQODE_API_KEY')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: tipUrl,
        options: qrOptions
      })
    });

    if (!uniqodeResponse.ok) {
      const errorText = await uniqodeResponse.text();
      console.error('Uniqode API error response:', errorText);
      throw new Error(`Failed to generate QR code: ${uniqodeResponse.status} ${errorText}`);
    }

    const qrCodeData = await uniqodeResponse.json();
    console.log('QR code generated successfully:', qrCodeData.url);

    // Update the QR code record with the generated image URL
    const { error: updateError } = await supabaseClient
      .from('qr_codes')
      .update({
        qr_code_image_url: qrCodeData.url,
        qr_code_status: 'generated',
        template
      })
      .eq('id', qrCodeId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

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

