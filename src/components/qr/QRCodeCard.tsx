
import React from 'react';
import { Book } from "lucide-react";
import { Card } from "../ui/card";
import { OptimizedImage } from "../ui/optimized-image";

interface QRCodeCardProps {
  qrCode: {
    id: string;
    book_title: string;
    cover_image?: string;
    total_tips?: number;
    total_amount?: number;
  };
  onNavigate: () => void;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ qrCode, onNavigate }) => {
  return (
    <Card 
      onClick={onNavigate} 
      className="p-3 cursor-pointer hover:bg-[white]/70 transition-colors flex flex-col items-center gap-2 border min-w-[120px] max-w-[140px] flex-shrink-0"
    >
      <div className="w-16 h-20 flex-shrink-0 rounded-md overflow-hidden">
        {qrCode.cover_image ? (
          <OptimizedImage
            src={qrCode.cover_image}
            alt={qrCode.book_title}
            className="w-full h-full"
            objectFit="cover"
            fallbackSrc="/lovable-uploads/book_icon.png"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="h-8 w-8 text-[#333333]" />
          </div>
        )}
      </div>
      
      <div className="text-center w-full">
        <h3 className="font-medium text-[#333333] text-xs line-clamp-2 leading-tight">{qrCode.book_title}</h3>
        <p className="text-[10px] text-[#718096] mt-1">
          {qrCode.total_tips || 0} tips
        </p>
      </div>
    </Card>
  );
};
