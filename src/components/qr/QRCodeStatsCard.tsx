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
    slug?: string | null;
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

  // Use slug if available, fallback to old format for backward compatibility
  const bookSlug = qrCode.slug || qrCode.book_title.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  const qrUrl = bookSlug ? 
    `${window.location.origin}/book/${bookSlug}` : 
    `${window.location.origin}/qr/${qrCode.id}`;

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
        url: qrUrl,
        bookTitle: qrCode.book_title
      });

      const link = document.createElement("a");
      link.href = svgUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || "download"}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR code downloaded",
        description: "Your branded QR code has been downloaded as an SVG file."
      });
    } catch (error) {
      console.error("Error downloading SVG:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the QR code. Please try again.",
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
      const dataUrl = await toPng(downloadRef.current, {
        backgroundColor: "white",
        pixelRatio: 2,
        width: 512,
        height: 512
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || "download"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR code downloaded",
        description: "Your QR code has been downloaded as a PNG file."
      });
    } catch (error) {
      console.error("Error downloading PNG:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `QuillTips QR Code for ${qrCode.book_title}`,
        text: `Check out this book: ${qrCode.book_title}`,
        url: qrUrl
      });
    } else {
      navigator.clipboard.writeText(qrUrl);
      toast({
        title: "Link copied",
        description: "QR code link copied to clipboard."
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Left column: QR + Cover + Details */}
      <div>
        <Card className="p-4 md:p-7 border" style={{ borderColor: '#333333' }}>
          <div className="space-y-8">
            {/* QR Code and Book Cover - Responsive Stacking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ">
              {/* QR Code */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg flex justify-center">
                  <StyledQRCode
                    ref={qrCodeRef}
                    value={qrUrl}
                    showBranding={true}
                    isPaid={isPaid}
                    variant="screen"
                    size={window.innerWidth < 768 ? 160 : 180}
                  />
                </div>
              </div>

              {/* Book Cover with Upload - Max Width Constraint */}
              <div className="space-y-4 max-w-sm mx-auto md:mx-0">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-44 h-64 relative">
                    <OptimizedImage
                      src={qrCode.cover_image || "/lovable-uploads/logo_nav.png"}
                      alt={qrCode.book_title}
                      className="w-full h-full rounded-lg shadow-lg"
                      objectFit={qrCode.cover_image ? "cover" : "contain"}
                      fallbackSrc="/lovable-uploads/logo_nav.png"
                      key={imageRefreshKey}
                    />
                  </div>
                  <BookCoverUpload 
                    qrCodeId={qrCode.id}
                    onUploadSuccess={(imageUrl) => updateCoverImage(imageUrl)}
                    bookTitle={qrCode.book_title}
                    placement="below"
                  />
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{qrCode.book_title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {qrCode.publisher && (
                  <p className="text-base">
                    <span className="font-sm">Publisher:</span>{' '}
                    {qrCode.publisher}
                  </p>
                )}
                {qrCode.isbn && (
                  <p className="text-base">
                    <span className="font-sm">ISBN:</span>{' '}
                    {qrCode.isbn}
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

      {/* Right column: Stats + Actions */}
      <div className="space-y-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <Card className="p-4 md:p-5 text-center bg-primary text-primary-foreground">
            <div className="text-2xl font-bold text-accent">{qrCode.total_tips || 0}</div>
            <div className="text-xs md:text-sm opacity-80">Total Tips</div>
          </Card>
          <Card className="p-4 md:p-5 text-center bg-primary text-primary-foreground">
            <div className="text-2xl font-bold text-accent">${(qrCode.total_amount || 0).toFixed(2)}</div>
            <div className="text-xs md:text-sm opacity-80">Total Amount</div>
          </Card>
          <Card className="p-4 md:p-5 text-center bg-primary text-primary-foreground">
            <div className="text-2xl font-bold text-accent">${(qrCode.average_tip || 0).toFixed(2)}</div>
            <div className="text-xs md:text-sm opacity-80">Average Tip</div>
          </Card>
          <Card className="p-4 md:p-5 text-center bg-primary text-primary-foreground">
            <div className="text-2xl font-bold text-accent">{qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), 'MMM d') : 'N/A'}</div>
            <div className="text-xs md:text-sm opacity-80">Last Tip</div>
          </Card>
        </div>

        {/* Hidden download QR code for PNG rendering */}
        <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
          <StyledQRCode
            ref={downloadRef}
            value={qrUrl}
            showBranding={true}
            isPaid={isPaid}
            variant="download"
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <QRCodeDownloadOptions
            onDownloadSVG={handleDownloadSVG}
            onDownloadPNG={handleDownloadPNG}
            disabled={!isPaid}
          />

          <Button
            onClick={handleShare}
            variant="secondary"
            className="w-full"
          >
            <Share2 className="h-4 w-4" />
            Share QR Code
          </Button>

          {!isPaid && (
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4" />
              {isCheckingOut ? "Processing..." : "Purchase QR Code"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};