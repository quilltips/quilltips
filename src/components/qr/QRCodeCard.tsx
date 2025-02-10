
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ChevronDown, Download, QrCode } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { QRCodeCardDetails } from "./QRCodeCardDetails";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeCardProps {
  qrCode: any;
  onNavigate: (id: string) => void;
}

export const QRCodeCard = ({ qrCode, onNavigate }: QRCodeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    const canvas = document.getElementById(`qr-${qrCode.id}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrCode.book_title}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  return (
    <Card className="overflow-hidden transition-all duration-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 grid grid-cols-12 items-center gap-4 hover:bg-muted/50 cursor-pointer">
          <div className="col-span-2 bg-white p-2 rounded-lg">
            <QRCodeCanvas
              id={`qr-${qrCode.id}`}
              value={qrValue}
              size={80}
              level="H"
              includeMargin={false}
              className="w-full h-auto"
            />
          </div>
          
          <div className="col-span-8">
            <h3 className="font-semibold">{qrCode.book_title}</h3>
            <p className="text-sm text-muted-foreground">
              {qrCode.total_tips || 0} tips · ${qrCode.total_amount?.toFixed(2) || '0.00'} total
            </p>
          </div>
          
          <div className="col-span-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "transform rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent className="animate-accordion-down">
          <QRCodeCardDetails qrCode={qrCode} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
