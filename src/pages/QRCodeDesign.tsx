import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const QR_CODE_TEMPLATES = [
  { 
    id: 'basic', 
    name: 'Basic QR', 
    preview: '/lovable-uploads/0bce5689-316d-436b-9c15-70c3a925c4cd.png',
    description: 'A clean, professional QR code design'
  },
  { 
    id: 'circular', 
    name: 'Circular Design', 
    preview: '/lovable-uploads/0bce5689-316d-436b-9c15-70c3a925c4cd.png',
    description: 'Round-styled QR code with enhanced scanning capabilities'
  },
  { 
    id: 'artistic', 
    name: 'Artistic Pattern', 
    preview: '/lovable-uploads/0bce5689-316d-436b-9c15-70c3a925c4cd.png',
    description: 'Beautifully designed QR code with artistic elements'
  },
];

const QRCodeDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);

  useEffect(() => {
    console.log("Location state:", location.state);
    if (!location.state?.qrCodeData) {
      console.log("No QR code data found, redirecting...");
      navigate('/author/create-qr');
      return;
    }
    setQrCodeData(location.state.qrCodeData);
  }, [location.state, navigate]);

  if (!qrCodeData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      console.log("Processing checkout with data:", {
        ...qrCodeData,
        template: selectedTemplate,
      });

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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Choose QR Code Design</h1>
            <p className="text-muted-foreground">
              Select a template for your QR code for "{qrCodeData.book_title}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QR_CODE_TEMPLATES.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <img
                      src={template.preview}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-center">{template.name}</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleCheckout}
              size="lg"
              className="w-full md:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Checkout and Download ($9.99)"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;