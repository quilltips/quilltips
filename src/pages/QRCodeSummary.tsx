import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, ArrowLeft, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StyledQRCode } from "@/components/qr/StyledQRCode";
import { useRef } from "react";
import { toPng, toSvg } from "html-to-image";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const QRCodeSummary = () => {
  const [searchParams] = useSearchParams();
  const qrCodeId = searchParams.get('qr_code');
  const qrCodeRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!qrCodeRef.current) return;

    try {
      // Try SVG first
      try {
        const svgDataUrl = await toSvg(qrCodeRef.current, { 
          cacheBust: true,
          backgroundColor: null, // Transparent background
          style: {
            borderRadius: '8px', // Ensure rounded corners in export
          }
        });
        
        const link = document.createElement('a');
        link.href = svgDataUrl;
        link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (svgError) {
        console.warn('SVG generation failed, falling back to PNG:', svgError);
      }

      // Fallback to PNG if SVG fails
      const pngDataUrl = await toPng(qrCodeRef.current, { 
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: null, // Transparent background
        style: {
          borderRadius: '8px', // Ensure rounded corners in export
        }
      });
      
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
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

                  <div>
                    <StyledQRCode 
                      ref={qrCodeRef}
                      value={qrValue}
                      size={200}
                      showBranding={true}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
                        onClick={handleDownload}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Info className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>SVG is best for print. This file format keeps your QR code crisp at any size, with transparent corners and smooth edges. Perfect for adding to your book cover or promotional materials.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
