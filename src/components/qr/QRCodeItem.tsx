
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../ui/optimized-image";
import { Button } from "../ui/button";

interface QRCodeItemProps {
  qrCode: {
    id: string;
    book_title: string;
    cover_image?: string | null;
    publisher?: string | null;
    release_date?: string | null;
    isbn?: string | null;
  };
  showTipButton?: boolean;
  onTipClick?: (qrCode: { id: string; bookTitle: string }) => void;
}

export const QRCodeItem = ({ qrCode, showTipButton = false, onTipClick }: QRCodeItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/author/qr/${qrCode.id}`);
  };

  const handleTipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTipClick) {
      onTipClick({ id: qrCode.id, bookTitle: qrCode.book_title });
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:bg-white/70 transition-all cursor-pointer mb-3"
      onClick={handleClick}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center overflow-hidden">
          <OptimizedImage
            src={qrCode.cover_image || "/lovable-uploads/quill_icon.png"}
            alt={qrCode.book_title}
            className="w-full h-full rounded-md"
            objectFit={qrCode.cover_image ? "cover" : "contain"}
            fallbackSrc="/lovable-uploads/quill_icon.png"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#2D3748] text-base truncate">
            {qrCode.book_title}
          </h3>
          
          {qrCode.publisher && (
            <div className="mt-0.5 text-xs text-[#718096]">
              <p className="truncate">Publisher: {qrCode.publisher}</p>
            </div>
          )}
        </div>

        {showTipButton && (
          <Button
            onClick={handleTipClick}
            className="bg-[#FFD166] hover:bg-[#ffd166] text-[#19363C] font-medium text-sm px-4 py-2"
            size="sm"
          >
            Tip the author
          </Button>
        )}
      </div>
    </Card>
  );
};
