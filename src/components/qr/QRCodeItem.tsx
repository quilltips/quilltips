
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { useNavigate } from "react-router-dom";

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
  const [imageError, setImageError] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  // Reset cache buster when cover image changes
  useEffect(() => {
    setCacheBuster(Date.now());
  }, [qrCode.cover_image]);

  const handleClick = () => {
    navigate(`/author/qr/${qrCode.id}`);
  };

  // Add cache-busting parameter to cover image URL
  const getCachedImageUrl = () => {
    if (!qrCode.cover_image) return null;
    
    try {
      const url = new URL(qrCode.cover_image);
      const hasQueryParams = qrCode.cover_image.includes('?');
      const cacheKey = `cache=${cacheBuster}`;
      return `${qrCode.cover_image}${hasQueryParams ? '&' : '?'}${cacheKey}`;
    } catch (e) {
      return qrCode.cover_image;
    }
  };

  return (
    <Card 
      className="overflow-hidden border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-3 flex items-center gap-2">
        <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center overflow-hidden">
          {qrCode.cover_image && !imageError ? (
            <img
              src={getCachedImageUrl()}
              alt={qrCode.book_title}
              className="w-full h-full object-cover rounded-md"
              onError={() => setImageError(true)}
              key={cacheBuster} // Force rerender when cover image changes
            />
          ) : (
            <img
              src="/lovable-uploads/quill_icon.png" 
              alt="Quilltips Logo"
              className="h-6 w-6 object-contain"
            />
          )}
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
