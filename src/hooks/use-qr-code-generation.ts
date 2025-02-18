
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGenerationProps {
  qrCodeData: {
    id: string;
    author_id: string;
    book_title: string;
  } | null;
}

interface QRCodeResponse {
  url: string;
  uniqodeId: string;
  error?: string;
  details?: string;
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
          .select('qr_code_image_url, qr_code_status')
          .eq('id', qrCodeData.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingQrCode?.qr_code_image_url && existingQrCode.qr_code_status === 'generated') {
          console.log('Using existing QR code URL:', existingQrCode.qr_code_image_url);
          setQrCodePreview(existingQrCode.qr_code_image_url);
          return;
        }

        const tipUrl = `${window.location.origin}/author/profile/${qrCodeData.author_id}?qr=${qrCodeData.id}&autoOpenTip=true`;
        console.log('Setting QR code preview URL:', tipUrl);
        setQrCodePreview(tipUrl);

        const { data: qrResponse, error: qrGenError } = await supabase.functions.invoke<QRCodeResponse>('generate-qr-code', {
          body: {
            bookTitle: qrCodeData.book_title,
            authorId: qrCodeData.author_id,
            qrCodeId: qrCodeData.id
          }
        });

        if (qrGenError) throw qrGenError;
        if (!qrResponse?.url) throw new Error('No QR code URL returned');

        console.log('QR code generated and stored:', qrResponse.url);

      } catch (error: any) {
        console.error("Error generating QR code:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to generate QR code",
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
