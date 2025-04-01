
import { format } from "date-fns";
import { Card } from "../ui/card";
import { Download, Info } from "lucide-react";
import { Button } from "../ui/button";
import { StyledQRCode } from "./StyledQRCode";
import { RefObject } from "react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
  qrCodeRef?: RefObject<HTMLDivElement>;
}

export const QRCodeStatsCard = ({ qrCode, onDownload, qrCodeRef }: QRCodeStatsCardProps) => {
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
        <div className="flex items-center gap-2">
          <Button 
            onClick={onDownload}
            className="flex-grow"
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
