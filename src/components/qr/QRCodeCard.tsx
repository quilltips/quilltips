
// This is a new file, so I'll implement a more compact version of the QRCodeCard
import React from 'react';
import { Book, ChevronRight } from "lucide-react";
import { Card } from "../ui/card";

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
      prominent 
      onClick={onNavigate} 
      className="p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3"
    >
      <div className="w-12 h-16 flex-shrink-0 bg-muted rounded-md overflow-hidden">
        {qrCode.cover_image ? (
          <img
            src={qrCode.cover_image}
            alt={qrCode.book_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Book className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1 text-left">
        <h3 className="font-medium text-[#2D3748] text-sm line-clamp-1">{qrCode.book_title}</h3>
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
