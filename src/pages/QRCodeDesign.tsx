import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const qrCodeData = location.state?.qrCodeData;

  if (!qrCodeData) {
    navigate('/author/create-qr');
    return null;
  }

  const handleCheckout = async () => {
    try {
      // Create QR code record with selected template
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert([
          { 
            ...qrCodeData,
            template: selectedTemplate,
          }
        ])
        .select()
        .single();

      if (qrError) throw qrError;

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
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Choose QR Code Design</h1>
            <p className="text-muted-foreground">Select a template for your QR code</p>
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
            >
              Checkout and Download ($9.99)
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;