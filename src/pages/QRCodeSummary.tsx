import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StyledQRCode } from "@/components/qr/StyledQRCode";
import { toPng } from "html-to-image";
import { QRCodeDownloadOptions } from "@/components/qr/QRCodeDownloadOptions";
import { useToast } from "@/hooks/use-toast";
import { generateBrandedQRCodeSVG } from "@/components/qr/generateBrandedQRCodeSVG"; // ✅ New import

const QRCodeSummary = () => {
  const [searchParams] = useSearchParams();
  const qrCodeId = searchParams.get('qr_code');
  const sessionId = searchParams.get('session_id');
  const screenRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'complete'>('idle');

  const { data: qrCode, isLoading, refetch } = useQuery({
    queryKey: ['qr-code', qrCodeId],
    queryFn: async () => {
      if (!qrCodeId) return null;
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', qrCodeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const updatePaymentStatus = useMutation({
    mutationFn: async () => {
      if (!qrCodeId || !sessionId) return;

      const { data, error: stripeError } = await supabase.functions.invoke('verify-stripe-session', {
        body: { sessionId }
      });
      
      if (stripeError || !data?.session || data.session.payment_status !== 'paid') {
        throw new Error('Payment verification failed');
      }
      
      const { error: updateError } = await supabase
        .from('qr_codes')
        .update({ 
          is_paid: true, 
          qr_code_status: 'active',
          stripe_session_id: sessionId 
        })
        .eq('id', qrCodeId);
        
      if (updateError) throw updateError;
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Payment confirmed!",
        description: "Your QR code is now ready to download and use.",
      });
      setVerificationStatus('complete');
      refetch();
    },
    onError: (error) => {
      console.error("Error verifying payment:", error);
      toast({
        title: "Payment verification error",
        description: "We couldn't verify your payment. Please contact support.",
        variant: "destructive"
      });
      setVerificationStatus('idle');
    }
  });

  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId && qrCode && !qrCode.is_paid && verificationStatus === 'idle') {
        setVerificationStatus('pending');
        await updatePaymentStatus.mutateAsync();
      }
    };
    
    if (qrCode) {
      verifyPayment();
    }
  }, [qrCode, sessionId, verificationStatus]);

  if (isLoading || verificationStatus === 'pending') {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div>Verifying your purchase...</div>
        </div>
      </Layout>
    );
  }

  if (!qrCode) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div>QR Code not found</div>
        </div>
      </Layout>
    );
  }

  const isPaid = qrCode.is_paid === true;
  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  const handleDownloadSVG = async () => {
    if (!isPaid) {
      toast({
        title: "QR Code not purchased",
        description: "You need to purchase this QR code before you can download it.",
        variant: "destructive"
      });
      return;
    }

    try {
      const svgUrl = await generateBrandedQRCodeSVG({
        url: qrValue,
        bookTitle: qrCode.book_title
      });

      const link = document.createElement('a');
      link.href = svgUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating SVG QR code:', error);
      toast({
        title: "SVG Download Failed",
        description: "Something went wrong generating your SVG.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPNG = async () => {
    if (!isPaid) {
      toast({
        title: "QR Code not purchased",
        description: "You need to purchase this QR code before you can download it.",
        variant: "destructive"
      });
      return;
    }

    if (!downloadRef.current) return;

    try {
      const pngDataUrl = await toPng(downloadRef.current, { 
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PNG QR code image:', error);
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

  return (
    <main className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/author/dashboard" 
          className="inline-flex items-center text-[#19363C] hover:text-[#19363C]/80 mb-8"
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
                  <p className="text-sm ">
                    {qrCode.book_title}
                  </p>
                </div>

                {/* Visible screen QR code */}
                <div>
                  <StyledQRCode
                    ref={screenRef}
                    value={qrValue}
                    showBranding={true}
                    isPaid={isPaid}
                    variant="screen"
                  />
                </div>

                {/* Hidden download QR code */}
                <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
                  <StyledQRCode
                    ref={downloadRef}
                    value={qrValue}
                    showBranding={true}
                    isPaid={isPaid}
                    variant="download"
                  />
                </div>

                <div className="space-y-3">
                  <QRCodeDownloadOptions 
                    onDownloadSVG={handleDownloadSVG}
                    onDownloadPNG={handleDownloadPNG}
                    disabled={!isPaid}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share QR Code
                  </Button>
                </div>

                {!isPaid && (
                  <p className="text-sm text-center text-orange-500">
                    This QR code hasn't been purchased yet. Please complete your purchase to download.
                  </p>
                )}

                <p className="text-sm text-center">
                  Does your publisher need access to info about this book in Quilltips?{' '}
                  Use the "Share" button above to forward your QR code to your publisher.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default QRCodeSummary;
