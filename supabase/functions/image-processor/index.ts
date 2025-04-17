
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Sharp from 'https://deno.land/x/sharp@0.32.6/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Image processor function started");
    
    const { imageData, type, maxWidth, maxHeight } = await req.json();

    if (!imageData || !type) {
      console.error("Missing required parameters:", { hasImageData: !!imageData, type });
      throw new Error('Missing required parameters');
    }

    console.log("Processing image with parameters:", { type, maxWidth, maxHeight });

    // Convert base64 to Uint8Array
    const binary = atob(imageData.split(',')[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    // Initialize Sharp with the input buffer
    const sharp = Sharp(array);

    // Get image metadata
    const metadata = await sharp.metadata();
    console.log("Original image dimensions:", { 
      width: metadata.width, 
      height: metadata.height,
      format: metadata.format 
    });

    // Process image with Sharp
    let processedImage;
    if (type === 'cover') {
      processedImage = await sharp
        .resize(maxWidth || 800, maxHeight || 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else if (type === 'avatar') {
      const size = Math.min(maxWidth || 400, maxHeight || 400);
      processedImage = await sharp
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    console.log("Image processing completed successfully");

    // Convert processed image back to base64
    const base64 = btoa(String.fromCharCode(...new Uint8Array(processedImage)));
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
        error: error.message || 'An unexpected error occurred while processing the image'
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
