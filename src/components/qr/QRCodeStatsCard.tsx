
import { format } from "date-fns";
import { Card } from "../ui/card";
import { RefObject, useRef } from "react";
import { StyledQRCode } from "./StyledQRCode";
import { QRCodeDownloadOptions } from "./QRCodeDownloadOptions";
import { toPng, toSvg } from "html-to-image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { ShoppingCart } from "lucide-react";

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

  // Reference to the displayed/canvas QR for SVG downloads
  const visibleQRCodeRef = qrCodeRef || useRef<HTMLDivElement>(null);

  // High-res QR frame for PNG download (hidden, 1024x1024)
  const highResRef = useRef<HTMLDivElement>(null);

  const handleDownloadSVG = async () => {
    if (!isPaid) {
      toast({
        title: "QR Code not purchased",
        description: "You need to purchase this QR code before you can download it.",
        variant: "destructive"
      });
      return;
    }
    // Download the visible QRCode frame, not the stats card!
    if (!visibleQRCodeRef.current) return;
    try {
      const svgDataUrl = await toSvg(visibleQRCodeRef.current, { 
        cacheBust: true,
        backgroundColor: "#fff",
        style: { borderRadius: '12px' }
      });
      const link = document.createElement('a');
      link.href = svgDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating SVG from styled QR:', error);
      toast({
        title: "SVG Download Error",
        description: "Failed to generate SVG file for this QR code.",
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
    // Use the hidden, high-res QR frame for PNG
    if (!highResRef.current) return;
    try {
      const pngDataUrl = await toPng(highResRef.current, { 
        cacheBust: true,
        width: 1024,
        height: 1024,
        backgroundColor: "#fff",
        style: { borderRadius: '32px' }
      });
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PNG QR code image:', error);
      toast({
        title: "PNG Download Error",
        description: "Failed to generate PNG file for this QR code.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-white" style={{ borderRadius: 12, background: "#fff" }}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">QR Code</h2>
        <div className="bg-white rounded-lg shadow-sm flex justify-center">
          {/* This is the visible QR frame (for display & SVG download) */}
          <StyledQRCode
            ref={visibleQRCodeRef}
            value={`${window.location.origin}/qr/${qrCode.id}`}
            size={200}
            showBranding={true}
            isPaid={isPaid}
          />
        </div>
        <QRCodeDownloadOptions 
          onDownloadSVG={handleDownloadSVG}
          onDownloadPNG={handleDownloadPNG}
          disabled={!isPaid}
          // Hidden, high-res QR code canvas for PNG (offscreen)
          hiddenHighResCanvas={
            <StyledQRCode
              ref={highResRef}
              value={`${window.location.origin}/qr/${qrCode.id}`}
              size={1024}
              highRes={true}
              showBranding={true}
              isPaid={isPaid}
            />
          }
        />
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

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Tips</p>
            <p className="text-2xl font-bold">{qrCode.total_tips || 0}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${qrCode.total_amount?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Average Tip</p>
            <p className="text-2xl font-bold">${qrCode.average_tip?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Last Tip</p>
            <p className="text-2xl font-bold">
              {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), 'MMM d') : '-'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
