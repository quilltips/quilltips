
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ImageMagick, MagickFormat } from 'https://deno.land/x/imagemagick_deno@0.0.19/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, type, maxWidth, maxHeight } = await req.json();

    if (!imageData || !type) {
      throw new Error('Missing required parameters');
    }

    // Convert base64 to Uint8Array
    const binary = atob(imageData.split(',')[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    // Process image with ImageMagick
    let processedImage;
    await ImageMagick.read(array, async (image) => {
      // Resize image while maintaining aspect ratio
      const width = maxWidth || 800;
      const height = maxHeight || 1200;
      image.resize(width, height);

      // Optimize image quality
      if (type === 'cover') {
        image.quality(85); // Good quality for book covers
      } else if (type === 'avatar') {
        image.quality(90); // Higher quality for avatars
        // Make avatar square if it isn't already
        const size = Math.min(width, height);
        image.extent(size, size);
      }

      // Get processed image data
      processedImage = await image.write(MagickFormat.Jpeg);
    });

    // Convert processed image back to base64
    const base64 = btoa(String.fromCharCode(...processedImage));
    const processedDataUrl = `data:image/jpeg;base64,${base64}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedImage: processedDataUrl 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
