
import { format } from "date-fns";
import { Card } from "../ui/card";
import { RefObject } from "react";
import { StyledQRCode } from "./StyledQRCode";
import { QRCodeDownloadOptions } from "./QRCodeDownloadOptions";
import { toPng, toSvg } from "html-to-image";

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
  } & QRCodeStats;
  qrCodeRef?: RefObject<HTMLDivElement>;
}

export const QRCodeStatsCard = ({ qrCode, qrCodeRef }: QRCodeStatsCardProps) => {
  const handleDownloadSVG = async () => {
    if (!qrCodeRef?.current) return;

    try {
      const svgDataUrl = await toSvg(qrCodeRef.current, { 
        cacheBust: true,
        backgroundColor: null,
        style: {
          borderRadius: '8px',
        }
      });
      
      const link = document.createElement('a');
      link.href = svgDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating SVG QR code image:', error);
    }
  };

  const handleDownloadPNG = async () => {
    if (!qrCodeRef?.current) return;

    try {
      const pngDataUrl = await toPng(qrCodeRef.current, { 
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: null,
        style: {
          borderRadius: '8px',
        }
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

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">QR Code</h2>
        <div className="bg-white rounded-lg shadow-sm flex justify-center">
          <StyledQRCode
            ref={qrCodeRef}
            value={`${window.location.origin}/qr/${qrCode.id}`}
            size={200}
            showBranding={true}
          />
        </div>
        <QRCodeDownloadOptions 
          onDownloadSVG={handleDownloadSVG}
          onDownloadPNG={handleDownloadPNG}
        />
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
