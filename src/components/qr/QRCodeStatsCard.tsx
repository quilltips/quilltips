import { format } from "date-fns";
import { Card } from "../ui/card";
import { RefObject, useRef } from "react";
import { StyledQRCode } from "./StyledQRCode";
import { QRCodeDownloadOptions } from "./QRCodeDownloadOptions";
import { toPng } from "html-to-image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { ShoppingCart, Share2 } from "lucide-react";
import { generateBrandedQRCodeSVG } from "./generateBrandedQRCodeSVG";
import { OptimizedImage } from "../ui/optimized-image";

interface QRCodeStats {
  total_tips: number | null;
  total_amount: number | null;
  average_tip: number | null;
  last_tip_date: string | null;
}

interface QRCodeStatsCardProps {
  qrCode: {
    id: string;
    book_title: string;
    is_paid?: boolean;
    cover_image?: string | null;
    publisher?: string | null;
    isbn?: string | null;
    release_date?: string | null;
  } & QRCodeStats;
  qrCodeRef?: RefObject<HTMLDivElement>;
}

export const QRCodeStatsCard = ({ qrCode, qrCodeRef }: QRCodeStatsCardProps) => {
  const { toast } = useToast();
  const isPaid = qrCode.is_paid !== false;
  const { isCheckingOut, handleCheckout } = useQRCheckout({
    qrCodeId: qrCode.id,
    bookTitle: qrCode.book_title
  });

  const downloadRef = useRef<HTMLDivElement>(null);

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
        url: `${window.location.origin}/qr/${qrCode.id}`,
        bookTitle: qrCode.book_title
      });

      const link = document.createElement("a");
      link.href = svgUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || "download"}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating SVG QR code:", error);
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

    if (!downloadRef?.current) return;

    try {
      const pngDataUrl = await toPng(downloadRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: null
      });

      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || "download"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating PNG QR code image:", error);
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
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left side - QR Code and Book Details */}
      <div className="space-y-6">
        {/* QR Code and Book Cover Container */}
        <Card className="p-6 border-2" style={{ borderColor: '#333333' }}>
          <div className="grid grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">QR Code</h3>
              <div className="bg-gray rounded-lg shadow-sm flex justify-center">
                <StyledQRCode
                  ref={qrCodeRef}
                  value={`${window.location.origin}/qr/${qrCode.id}`}
                  showBranding={true}
                  isPaid={isPaid}
                  variant="screen"
                />
              </div>
            </div>

            {/* Book Cover */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Book Cover</h3>
              <div className="aspect-[2/3] rounded-lg overflow-hidden">
                <OptimizedImage
                  src={qrCode.cover_image || "/lovable-uploads/quill_icon.png"}
                  alt={qrCode.book_title}
                  className="w-full h-full"
                  objectFit={qrCode.cover_image ? "cover" : "contain"}
                  fallbackSrc="/lovable-uploads/quill_icon.png"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Book Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Book Details</h3>
          <div className="space-y-2">
            <p className="text-lg font-medium">{qrCode.book_title}</p>
            {qrCode.publisher && (
              <p className="text-sm">
                <span className="font-medium">Publisher:</span> {qrCode.publisher}
              </p>
            )}
            {qrCode.isbn && (
              <p className="text-sm">
                <span className="font-medium">ISBN:</span> {qrCode.isbn}
              </p>
            )}
            {qrCode.release_date && (
              <p className="text-sm">
                <span className="font-medium">Release Date:</span>{' '}
                {format(new Date(qrCode.release_date), 'PPP')}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Right side - Stats and Actions */}
      <div className="space-y-6">
        {/* Tip Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">Total Tips</p>
                <p className="text-2xl font-bold">{qrCode.total_tips || 0}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">Total Amount</p>
                <p className="text-2xl font-bold">${qrCode.total_amount?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">Average Tip</p>
                <p className="text-2xl font-bold">${qrCode.average_tip?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">Last Tip</p>
                <p className="text-2xl font-bold">
                  {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), "MMM d") : "-"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="space-y-4">
            {/* Hidden download QR code */}
            <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
              <StyledQRCode
                ref={downloadRef}
                value={`${window.location.origin}/qr/${qrCode.id}`}
                showBranding={true}
                isPaid={isPaid}
                variant="download"
              />
            </div>

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

            {!isPaid && (
              <div className="space-y-2">
                <p className="text-sm text-center text-orange-500">
                  This QR code hasn't been purchased yet. Please complete your purchase to download.
                </p>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-[#FFD166] hover:bg-[#FFD166]/80 text-[#19363C]"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isCheckingOut ? "Processing..." : "Purchase QR Code"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
