
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Book, Loader2 } from "lucide-react";

const QR_CODE_TEMPLATES = [
  { id: 'basic', name: 'Basic QR', preview: '/placeholder.svg' },
  { id: 'circular', name: 'Circular Design', preview: '/placeholder.svg' },
  { id: 'artistic', name: 'Artistic Pattern', preview: '/placeholder.svg' },
];

interface QRCodeResponse {
  url: string;
  error?: string;
  details?: string;
}

const QRCodeDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const qrCodeData = location.state?.qrCodeData;

  useEffect(() => {
    if (!qrCodeData) {
      navigate('/author/create-qr');
      return;
    }

    // Generate preview on template selection
    const generatePreview = async () => {
      try {
        setIsGenerating(true);
        setQrCodePreview(null); // Clear previous preview

        console.log('Generating QR code preview with data:', {
          bookTitle: qrCodeData.book_title,
          authorId: qrCodeData.author_id,
          qrCodeId: qrCodeData.id,
          template: selectedTemplate
        });

        const { data: qrResponse, error: qrGenError } = await supabase.functions.invoke<QRCodeResponse>('generate-qr-code', {
          body: {
            bookTitle: qrCodeData.book_title,
            authorId: qrCodeData.author_id,
            qrCodeId: qrCodeData.id,
            template: selectedTemplate
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

    generatePreview();
  }, [qrCodeData, navigate, selectedTemplate, toast]);

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
              <p className="text-muted-foreground">Select a template for your QR code</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QR_CODE_TEMPLATES.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {qrCodePreview && selectedTemplate === template.id ? (
                      <img
                        src={qrCodePreview}
                        alt={template.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isGenerating ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <img
                            src={template.preview}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-center">{template.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCheckout}
              size="lg"
              className="w-full md:w-auto"
              disabled={isCheckingOut || isGenerating || !qrCodePreview}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Checkout and Download ($9.99)'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;

