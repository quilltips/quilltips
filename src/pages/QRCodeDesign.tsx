
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QRCodeHeader } from "@/components/qr/QRCodeHeader";
import { QRCodePreview } from "@/components/qr/QRCodePreview";

interface QRCodeResponse {
  url: string;
  uniqodeId: string;
  error?: string;
  details?: string;
}

const QRCodeDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const qrCodeData = location.state?.qrCodeData;

  useEffect(() => {
    if (!qrCodeData?.id) {
      navigate('/author/create-qr');
      return;
    }

    const generateQRCode = async () => {
      try {
        setIsGenerating(true);
        setQrCodePreview(null);

        // First check if the QR code image already exists
        const { data: existingQrCode, error: fetchError } = await supabase
          .from('qr_codes')
          .select('qr_code_image_url, qr_code_status')
          .eq('id', qrCodeData.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingQrCode?.qr_code_image_url && existingQrCode.qr_code_status === 'generated') {
          console.log('Using existing QR code:', existingQrCode.qr_code_image_url);
          setQrCodePreview(existingQrCode.qr_code_image_url);
          return;
        }

        // Call the edge function to generate the QR code
        const { data: qrResponse, error: qrGenError } = await supabase.functions.invoke<QRCodeResponse>('generate-qr-code', {
          body: {
            bookTitle: qrCodeData.book_title,
            authorId: qrCodeData.author_id,
            qrCodeId: qrCodeData.id
          }
        });

        if (qrGenError) throw qrGenError;
        if (!qrResponse?.url) throw new Error('No QR code URL returned');

        console.log('QR code generated:', qrResponse.url);
        setQrCodePreview(qrResponse.url);

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
  }, [qrCodeData, navigate, toast]);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      console.log('Starting checkout process for QR code:', qrCodeData.id);

      const { data: checkoutResponse, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          qrCodeId: qrCodeData.id,
          bookTitle: qrCodeData.book_title
        }
      });

      if (checkoutError) throw checkoutError;
      if (!checkoutResponse?.url) throw new Error("No checkout URL returned");

      console.log('Redirecting to checkout:', checkoutResponse.url);
      window.location.href = checkoutResponse.url;
    } catch (error: any) {
      console.error("Error in checkout process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!qrCodeData) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <QRCodeHeader
            coverImage={qrCodeData.cover_image}
            bookTitle={qrCodeData.book_title}
          />
          <QRCodePreview
            isGenerating={isGenerating}
            qrCodePreview={qrCodePreview}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
          />
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;
