
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGenerationProps {
  qrCodeData: {
    id: string;
    author_id: string;
    book_title: string;
    cover_image?: string | null;
    slug?: string | null;
  } | null;
}

export const useQRCodeGeneration = ({ qrCodeData }: QRCodeGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const generateQRCode = async () => {
      if (!qrCodeData?.id) return;

      try {
        setIsGenerating(true);
        setQrCodePreview(null);

        const { data: existingQrCode, error: fetchError } = await supabase
          .from('qr_codes')
          .select('qr_code_image_url, qr_code_status, slug')
          .eq('id', qrCodeData.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingQrCode?.qr_code_image_url && existingQrCode.qr_code_status === 'generated') {
          console.log('Using existing QR code URL:', existingQrCode.qr_code_image_url);
          setQrCodePreview(existingQrCode.qr_code_image_url);
          return;
        }

        // Generate QR code URL - use slug if available, fallback to old format for backward compatibility
        const bookSlug = existingQrCode?.slug || qrCodeData.slug || 
          qrCodeData.book_title.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
        const tipUrl = bookSlug ? 
          `${window.location.origin}/book/${bookSlug}` : 
          `${window.location.origin}/qr/${qrCodeData.id}`;
        console.log('Setting QR code preview URL:', tipUrl);
        setQrCodePreview(tipUrl);

        // Update the database with the QR code URL
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({
            qr_code_image_url: tipUrl,
            qr_code_status: 'generated'
          })
          .eq('id', qrCodeData.id);

        if (updateError) {
          console.error("Error updating QR code in database:", updateError);
        }

      } catch (error: any) {
        console.error("Error generating QR code:", error);
        toast({
          title: "Error",
          description: "There was an issue generating the QR code preview. Your progress has been saved.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateQRCode();
  }, [qrCodeData, toast]);

  return {
    isGenerating,
    qrCodePreview
  };
};
