
import { format } from "date-fns";
import { Card } from "../ui/card";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "../ui/button";

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
  onDownload: () => void;
}

export const QRCodeStatsCard = ({ qrCode, onDownload }: QRCodeStatsCardProps) => {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">QR Code</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center">
          <QRCodeCanvas
            id="qr-canvas"
            value={`${window.location.origin}/qr/${qrCode.id}`}
            size={200}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <Button 
          onClick={onDownload}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
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
