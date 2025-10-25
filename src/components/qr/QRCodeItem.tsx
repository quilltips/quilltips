
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../ui/optimized-image";
import { ChevronRight } from "lucide-react";
import { getAuthorBookUrl } from "@/lib/url-utils";

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
    navigate(getAuthorBookUrl(qrCode));
  };

  return (
    <Card 
      className="overflow-hidden hover:bg-white/70 transition-all cursor-pointer mb-3"
      onClick={handleClick}
    >
      <div className="p-4 flex items-center gap-3 border-b">
        <div className="flex-shrink-0 w-14 h-18 rounded-md flex items-center justify-center overflow-hidden">
          <OptimizedImage
            src={qrCode.cover_image || "/lovable-uploads/logo_nav.svg"}
            alt={qrCode.book_title}
            className="w-full h-full rounded-md"
            objectFit={qrCode.cover_image ? "cover" : "contain"}
            fallbackSrc="/lovable-uploads/logo_nav.svg"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#333333] text-base truncate">
            {qrCode.book_title}
          </h3>
          
          {qrCode.publisher && (
            <div className="mt-0.5 text-xs text-[#718096]">
              <p className="truncate">Publisher: {qrCode.publisher}</p>
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-[#718096]" />
      </div>
    </Card>
  );
};
