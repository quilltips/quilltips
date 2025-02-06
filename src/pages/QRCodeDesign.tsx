
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Book, Loader2 } from "lucide-react";

const QR_CODE_TEMPLATES = [
  { id: 'basic', name: 'Basic QR', preview: '/placeholder.svg' },
  { id: 'circular', name: 'Circular Design', preview: '/placeholder.svg' },
  { id: 'artistic', name: 'Artistic Pattern', preview: '/placeholder.svg' },
];

const QRCodeDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const qrCodeData = location.state?.qrCodeData;

  if (!qrCodeData) {
    navigate('/author/create-qr');
    return null;
  }

  const handleCheckout = async () => {
    try {
      setIsGenerating(true);

      // First, create the QR code record
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert([{ 
          ...qrCodeData,
          template: selectedTemplate,
        }])
        .select()
        .single();

      if (qrError) throw qrError;

      // Generate the QR code using our Edge Function
      const { data: qrResponse, error: qrGenError } = await supabase.functions.invoke('generate-qr-code', {
        body: {
          bookTitle: qrCodeData.book_title,
          authorId: qrCodeData.author_id,
          qrCodeId: qrCode.id
        }
      });

      if (qrGenError) throw qrGenError;

      // Create Stripe checkout session
      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          qrCodeId: qrCode.id,
          bookTitle: qrCodeData.book_title
        }
      });

      if (checkoutError) throw checkoutError;
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error in checkout process:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process checkout",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

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
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
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
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating QR Code...
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
