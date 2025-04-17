
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../ui/optimized-image";

interface QRCodeItemProps {
  qrCode: {
    id: string;
    book_title: string;
    cover_image?: string | null;
    publisher?: string | null;
    release_date?: string | null;
    isbn?: string | null;
  };
}

export const QRCodeItem = ({ qrCode }: QRCodeItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/author/qr/${qrCode.id}`);
  };

  return (
    <Card 
      className="overflow-hidden border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-3 flex items-center gap-2">
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
          
          {(qrCode.publisher || qrCode.isbn) && (
            <div className="mt-0.5 text-xs text-[#718096]">
              {qrCode.publisher && (
                <p className="truncate">Publisher: {qrCode.publisher}</p>
              )}
              {qrCode.isbn && (
                <p className="truncate">ISBN: {qrCode.isbn}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
