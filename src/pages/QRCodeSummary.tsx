
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, ArrowLeft } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Layout } from "@/components/Layout";

const QRCodeSummary = () => {
  const [searchParams] = useSearchParams();
  const qrCodeId = searchParams.get('qr_code');

  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['qr-code', qrCodeId],
    queryFn: async () => {
      if (!qrCodeId) return null;
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrCodeId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${qrCode?.book_title || 'download'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code for ${qrCode?.book_title}`,
          text: 'Check out my QR code on Quilltips!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (isLoading || !qrCode) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  // Updated to point to the public QR code details page
  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  return (
    <Layout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/author/dashboard" 
            className="inline-flex items-center text-[#9b87f5] hover:text-[#9b87f5]/80 mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>

          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold text-[#403E43]">
                    Your Quilltips Jar is ready
                  </h1>
                  <div className="flex items-center gap-8">
                    <img 
                      src="/lovable-uploads/quill_icon.png" 
                      alt="Quill Icon" 
                      className="h-16 w-16"
                    />
                    <div className="text-2xl text-[#403E43]">+</div>
                    <img 
                      src="/lovable-uploads/book_icon.png" 
                      alt="Book Icon" 
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-lg font-medium">QR Code</h2>
                    <p className="text-sm text-muted-foreground">
                      {qrCode.book_title}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <QRCodeCanvas
                      id="qr-canvas"
                      value={qrValue}
                      size={200}
                      level="H"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share QR Code
                    </Button>
                  </div>

                  <p className="text-sm text-center text-muted-foreground">
                    Does your publisher need access to info about this book in Quilltips?{' '}
                    <button className="text-[#9b87f5] hover:underline">
                      Send an invite
                    </button>{' '}
                    to your publisher to claim this book.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
};

export default QRCodeSummary;
