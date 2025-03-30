
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGenerationProps {
  qrCodeData: {
    id: string;
    author_id: string;
    book_title: string;
    cover_image?: string | null;
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

        try {
          const { data: qrResponse, error: qrGenError } = await supabase.functions.invoke<QRCodeResponse>('generate-qr-code', {
            body: {
              bookTitle: qrCodeData.book_title,
              authorId: qrCodeData.author_id,
              qrCodeId: qrCodeData.id
            }
          });

          if (qrGenError) {
            console.error("Error calling generate-qr-code function:", qrGenError);
            // We'll continue with the preview URL, but log the error
          } else if (!qrResponse?.url) {
            console.error("No QR code URL returned from function");
          } else {
            console.log('QR code generated and stored:', qrResponse.url);
          }
        } catch (functionError) {
          // We'll catch errors from the function but not throw, since we already have a preview URL
          console.error("Function execution error:", functionError);
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
