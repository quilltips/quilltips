
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Book, Loader2 } from "lucide-react";

interface QRCodeResponse {
  url: string;
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
    if (!qrCodeData) {
      navigate('/author/create-qr');
      return;
    }

    // Generate QR code on component mount
    const generateQRCode = async () => {
      try {
        setIsGenerating(true);
        setQrCodePreview(null); // Clear previous preview

        console.log('Generating QR code with data:', {
          bookTitle: qrCodeData.book_title,
          authorId: qrCodeData.author_id,
          qrCodeId: qrCodeData.id
        });

        const { data: qrResponse, error: qrGenError } = await supabase.functions.invoke<QRCodeResponse>('generate-qr-code', {
          body: {
            bookTitle: qrCodeData.book_title,
            authorId: qrCodeData.author_id,
            qrCodeId: qrCodeData.id
          }
        });

        if (qrGenError) {
          throw qrGenError;
        }

        if (!qrResponse?.url) {
          throw new Error('No QR code URL returned');
        }

        console.log('QR code preview generated:', qrResponse.url);
        setQrCodePreview(qrResponse.url);
      } catch (error: any) {
        console.error("Error generating preview:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to generate QR code preview",
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

      if (checkoutError) {
        throw new Error(`Checkout error: ${checkoutError.message}`);
      }

      if (!checkoutResponse?.url) {
        throw new Error("No checkout URL returned");
      }

      console.log('Redirecting to checkout:', checkoutResponse.url);
      window.location.href = checkoutResponse.url;
    } catch (error: any) {
      console.error("Error in checkout process:", error);
      let errorMessage = error.message;
      
      if (error.status === 401) {
        errorMessage = "Please log in to complete your purchase";
      } else if (error.status === 400) {
        errorMessage = "Invalid request. Please try again";
      }
      
      toast({
        title: "Error",
        description: errorMessage || "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!qrCodeData) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start gap-6">
            <div className="w-32 h-44 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
              {qrCodeData.cover_image ? (
                <img
                  src={qrCodeData.cover_image}
                  alt={qrCodeData.book_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Book className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{qrCodeData.book_title}</h1>
              <p className="text-muted-foreground">Your QR code is being generated</p>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Generating your QR code...</p>
                </div>
              ) : qrCodePreview ? (
                <div className="flex flex-col items-center gap-6">
                  <img
                    src={qrCodePreview}
                    alt="QR Code Preview"
                    className="max-w-[300px] w-full"
                  />
                  <Button 
                    onClick={handleCheckout}
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Purchase QR Code ($9.99)'
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Failed to generate QR code preview</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;
