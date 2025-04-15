
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProcessImageOptions {
  type: 'avatar' | 'cover';
  maxWidth?: number;
  maxHeight?: number;
}

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (file: File, options: ProcessImageOptions): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Convert File to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Call the image processing function
      const { data, error } = await supabase.functions.invoke('image-processor', {
        body: {
          imageData: base64,
          type: options.type,
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to process image');

      return data.processedImage;
    } catch (err) {
      console.error('Error in image processing:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processImage,
    isProcessing,
    error,
  };
};
