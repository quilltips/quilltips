
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Book, ChevronDown } from "lucide-react";
import { QRCodeCardDetails } from "./QRCodeCardDetails";
import { useState } from "react";

interface QRCodeCardProps {
  qrCode: {
    id: string;
    book_title: string;
    cover_image?: string | null;
    publisher?: string | null;
    release_date?: string | null;
    isbn?: string | null;
    total_tips?: number;
    total_amount?: number;
    average_tip?: number;
    last_tip_date?: string | null;
  };
  onNavigate: () => void;
}

export const QRCodeCard = ({ qrCode, onNavigate }: QRCodeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        <div 
          className="w-16 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden cursor-pointer"
          onClick={onNavigate}
        >
          {qrCode.cover_image ? (
            <img
              src={qrCode.cover_image}
              alt={qrCode.book_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Book className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 
            className="text-lg font-semibold leading-tight mb-1 hover:text-[#9b87f5] cursor-pointer"
            onClick={onNavigate}
          >
            {qrCode.book_title}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Tips</p>
              <p className="font-semibold">{qrCode.total_tips || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="font-semibold">${qrCode.total_amount?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {isExpanded && <QRCodeCardDetails qrCode={qrCode} />}
    </Card>
  );
};
