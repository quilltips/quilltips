import { supabase } from "@/integrations/supabase/client";

export const useSlugGeneration = () => {
  const generateProfileSlug = async (name: string): Promise<string> => {
    const { data, error } = await supabase
      .rpc('generate_url_slug', { input_text: name });
    
    if (error) {
      console.error('Error generating profile slug:', error);
      throw error;
    }
    
    return data;
  };

  const generateQRCodeSlug = async (bookTitle: string): Promise<string> => {
    const { data, error } = await supabase
      .rpc('generate_url_slug', { input_text: bookTitle });
    
    if (error) {
      console.error('Error generating QR code slug:', error);
      throw error;
    }
    
    return data;
  };

  const generateProfileUrl = (name: string): string => {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    return `/author/${slug}`;
  };

  const generateBookUrl = (bookTitle: string): string => {
    const slug = bookTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    return `/book/${slug}`;
  };

  const generateAuthorBookUrl = (bookTitle: string): string => {
    const slug = bookTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    return `/author/book/${slug}`;
  };

  return {
    generateProfileSlug,
    generateQRCodeSlug,
    generateProfileUrl,
    generateBookUrl,
    generateAuthorBookUrl
  };
};