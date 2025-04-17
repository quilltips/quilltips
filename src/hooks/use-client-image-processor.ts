
import { useState } from "react";

interface ImageProcessingOptions {
  type: 'avatar' | 'cover';
  maxWidth?: number;
  maxHeight?: number;
}

export const useClientImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (file: File, options: ImageProcessingOptions): Promise<string | null> => {
    setIsProcessing(true);
    
    try {
      // Create a canvas element to resize the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Load image
      const img = new Image();
      img.src = await readFileAsDataURL(file);
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Calculate dimensions
      let width = img.width;
      let height = img.height;
      
      // Set max dimensions based on type
      const maxWidth = options.maxWidth || (options.type === 'avatar' ? 400 : 800);
      const maxHeight = options.maxHeight || (options.type === 'avatar' ? 400 : 1200);
      
      // Resize if necessary
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      // Handle avatar specific logic (square crop)
      if (options.type === 'avatar') {
        const size = Math.min(width, height, maxWidth, maxHeight);
        
        // Set canvas to square dimensions
        canvas.width = size;
        canvas.height = size;
        
        // Draw the image centered in the canvas
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;
        
        ctx.drawImage(
          img, 
          offsetX, offsetY, size, size, // Source rectangle
          0, 0, size, size // Destination rectangle
        );
      } else {
        // Regular resize for cover images
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      // Convert to JPEG with quality setting
      const quality = options.type === 'avatar' ? 0.9 : 0.85;
      const processedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      return processedDataUrl;
    } catch (error) {
      console.error('Error processing image on client:', error);
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
    isProcessing
  };
};
