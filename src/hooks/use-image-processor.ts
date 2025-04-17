
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useClientImageProcessor } from "./use-client-image-processor";

interface ImageProcessingOptions {
  type: 'avatar' | 'cover';
  maxWidth?: number;
  maxHeight?: number;
}

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const clientProcessor = useClientImageProcessor();

  const processImage = async (file: File, options: ImageProcessingOptions): Promise<string | null> => {
    setIsProcessing(true);
    
    try {
      // First try to use the server-side processor
      try {
        const imageData = await readFileAsDataURL(file);
        
        const { data, error } = await supabase.functions.invoke('image-processor', {
          body: {
            imageData,
            type: options.type,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight
          }
        });
        
        if (error) {
          console.warn('Server-side image processing failed, falling back to client-side:', error);
          throw error;
        }
        
        if (data.note && data.note.includes("disabled")) {
          console.log('Server-side processing is disabled, using client-side processing');
          throw new Error('Server-side processing disabled');
        }
        
        return data.processedImage;
      } catch (error) {
        console.log('Falling back to client-side image processing');
        // If server-side processing fails, fall back to client-side
        return await clientProcessor.processImage(file, options);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    processImage,
    isProcessing: isProcessing || clientProcessor.isProcessing
  };
};
