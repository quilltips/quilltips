
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
import { BookCoverUpload } from "./BookCoverUpload";
import { useQRCodeDetailsPage } from "@/hooks/use-qr-code-details-page";

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
  const { updateCoverImage, imageRefreshKey } = useQRCodeDetailsPage();

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
    <div className="grid xl:grid-cols-[3fr_2fr] gap-7 mx-auto">
      {/* Left side - QR Code, Book Cover, and Book Details */}
      <div className="">
        {/* QR Code, Book Cover, and Book Details Container */}
        <Card className="p-4 md:p-7 border" style={{ borderColor: '#333333' }}>
          <div className="space-y-8">
            {/* QR Code and Book Cover - Responsive Stacking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ">
              {/* QR Code */}
              <div className="space-y-4">
                <div className="bg-gray rounded-lg flex justify-center">
                  <StyledQRCode
                    ref={qrCodeRef}
                    value={`${window.location.origin}/qr/${qrCode.id}`}
                    showBranding={true}
                    isPaid={isPaid}
                    variant="screen"
                    size={window.innerWidth < 768 ? 180 : 200}
                  />
                </div>
              </div>

              {/* Book Cover with Upload - Max Width Constraint */}
              <div className="space-y-4">
                <div className="aspect-[2/3] rounded-lg overflow-hidden relative max-w-xs mx-auto md:mx-0">
                  <OptimizedImage
                    key={imageRefreshKey}
                    src={qrCode.cover_image || "/lovable-uploads/logo_nav.png"}
                    alt={qrCode.book_title}
                    className="w-full h-full"
                    objectFit={qrCode.cover_image ? "cover" : "contain"}
                    fallbackSrc="/lovable-uploads/logo_nav.png"
                  />
                  <BookCoverUpload 
                    qrCodeId={qrCode.id}
                    coverImage={qrCode.cover_image}
                    bookTitle={qrCode.book_title}
                    updateCoverImage={updateCoverImage}
                  />
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="space-y-2 pt-2">
              <div className="space-y-2">
                <p className="text-base font-bold">{qrCode.book_title}</p>
                {qrCode.publisher && (
                  <p className="text-base">
                    <span className="font-sm">Publisher:</span> {qrCode.publisher}
                  </p>
                )}
                {qrCode.isbn && (
                  <p className="text-base">
                    <span className="font-sm">ISBN:</span> {qrCode.isbn}
                  </p>
                )}
                {qrCode.release_date && (
                  <p className="text-base">
                    <span className="font-sm">Release Date:</span>{' '}
                    {format(new Date(qrCode.release_date), 'PPP')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right side - Stats and Actions */}
      <div className="space-y-6">
        {/* Individual Tip Statistics Tiles */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Total Tips</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">{qrCode.total_tips || 0}</p>
            </Card>
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Total Amount</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">${qrCode.total_amount?.toFixed(2) || "0.00"}</p>
            </Card>
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Average Tip</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">${qrCode.average_tip?.toFixed(2) || "0.00"}</p>
            </Card>
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Last Tip</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">
                {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), "MMM d") : "-"}
              </p>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <Card className="p-4 md:p-5 md:mt-4">
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
              variant="secondary" 
              className="w-full border border-[#333333]"
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
