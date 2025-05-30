
import React from 'react';
import { Book, ChevronRight } from "lucide-react";
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
      className="p-4 cursor-pointer hover:bg-[white]/70 transition-colors flex items-center gap-4 border-b"
    >
      <div className="w-12 h-16 flex-shrink-0 rounded-md overflow-hidden">
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
      
      <div className="flex-1 text-left">
        <h3 className="font-medium text-[#333333] text-md line-clamp-1">{qrCode.book_title}</h3>
        <div className="flex gap-4 mt-1">
          <p className="text-xs text-[#718096]">
            <span className="font-medium">{qrCode.total_tips || 0}</span> tips
          </p>
          <p className="text-xs text-[#718096]">
            <span className="font-medium">${(qrCode.total_amount || 0).toFixed(2)}</span> total
          </p>
        </div>
      </div>
      
      <ChevronRight className="h-4 w-4 text-[#718096]" />
    </Card>
  );
};
