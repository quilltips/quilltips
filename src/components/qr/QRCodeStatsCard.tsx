
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

  // This ref will be attached to the container Card—that includes the full styled card (QR code, instructions, etc.)
  const styledCardRef = useRef<HTMLDivElement>(null);

  // Here's how we share the card for preview and download
  // - The download options below will use this ref instead of inner QR code/hires QR code
  // - No need for highResRef; we'll scale the card for high-res PNG

  const handleDownloadSVG = async () => {
    if (!isPaid) {
      toast({
        title: "QR Code not purchased",
        description: "You need to purchase this QR code before you can download it.",
        variant: "destructive"
      });
      return;
    }
    if (!styledCardRef.current) return;
    try {
      const svgDataUrl = await toSvg(styledCardRef.current, { 
        cacheBust: true,
        backgroundColor: "#fff",
        style: {
          borderRadius: '12px',
        }
      });
      const link = document.createElement('a');
      link.href = svgDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating SVG from styled card:', error);
      toast({
        title: "SVG Download Error",
        description: "Failed to generate SVG file for this card.",
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
    const cardNode = styledCardRef.current;
    if (!cardNode) return;
    // We'll temporarily scale the card using CSS for high-res PNG (double or 4x for higher clarity)
    const originalStyle = cardNode.getAttribute("style") || "";
    const scale = 1024 / cardNode.offsetWidth;
    cardNode.style.transform = `scale(${scale})`;
    cardNode.style.transformOrigin = "top left";
    cardNode.style.background = "#fff"; // ensure white background
    cardNode.style.borderRadius = "12px";
    try {
      const pngDataUrl = await toPng(cardNode, { 
        cacheBust: true,
        width: 1024,
        height: cardNode.offsetHeight * scale,
        backgroundColor: "#fff",
        style: { borderRadius: '12px' }
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
        description: "Failed to generate PNG file for this card.",
        variant: "destructive"
      });
    } finally {
      // Clean up the scaling
      cardNode.setAttribute("style", originalStyle);
    }
  };

  return (
    <Card ref={styledCardRef} className="p-6 space-y-6 bg-white" style={{ borderRadius: 12, background: "#fff" }}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">QR Code</h2>
        <div className="bg-white rounded-lg shadow-sm flex justify-center">
          <StyledQRCode
            ref={qrCodeRef}
            value={`${window.location.origin}/qr/${qrCode.id}`}
            size={200}
            showBranding={true}
            isPaid={isPaid}
          />
        </div>
        {/* Download options now use the entire card, not an inner hi-res QR */}
        <QRCodeDownloadOptions 
          onDownloadSVG={handleDownloadSVG}
          onDownloadPNG={handleDownloadPNG}
          disabled={!isPaid}
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
