import { format } from "date-fns";
import { Card } from "../ui/card";
import { BookCoverUpload } from "./BookCoverUpload";
import { useQRCodeDetailsPage } from "@/hooks/use-qr-code-details-page";
import { useState, useEffect, useRef } from "react";

interface QRCodeInfoCardProps {
  qrCode: {
    id: string;
    book_title: string;
    publisher: string | null;
    release_date: string | null;
    isbn: string | null;
    cover_image: string | null;
    author_id?: string;
  };
  isEditable?: boolean;
}

export const QRCodeInfoCard = ({ qrCode, isEditable = false }: QRCodeInfoCardProps) => {
  const { updateCoverImage, imageRefreshKey, refreshImage } = isEditable ? useQRCodeDetailsPage() : { 
    updateCoverImage: undefined, 
    imageRefreshKey: Date.now(),
    refreshImage: () => {}
  };
  
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Reset image error state whenever cover image URL changes or refresh key changes
  useEffect(() => {
    if (qrCode.cover_image) {
      console.log("QRCodeInfoCard: Cover image URL changed or refresh triggered:", qrCode.cover_image);
      setImageError(false);
    }
  }, [qrCode.cover_image, imageRefreshKey]);

  const handleImageError = () => {
    console.log("QRCodeInfoCard: Image failed to load:", qrCode.cover_image);
    setImageError(true);
  };

  // Prevent browser caching of images by adding timestamp parameter
  const getCoverImageWithCache = () => {
    if (!qrCode.cover_image) return null;
    
    try {
      // Parse the URL to check if it's valid
      const url = new URL(qrCode.cover_image);
      
      // Add a cache-busting parameter to the URL using imageRefreshKey for maximum effectiveness
      const hasQueryParams = qrCode.cover_image.includes('?');
      const cacheKey = `cache=${imageRefreshKey}`;
      const imageUrl = `${qrCode.cover_image}${hasQueryParams ? '&' : '?'}${cacheKey}`;
      
      console.log("QRCodeInfoCard: Using cache-busted image URL:", imageUrl);
      return imageUrl;
    } catch (e) {
      console.error("QRCodeInfoCard: Invalid cover image URL:", qrCode.cover_image, e);
      return qrCode.cover_image;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#19363C]">{qrCode.book_title}</h1>

      <div className="aspect-square relative rounded-xl overflow-hidden border border-muted">
        {qrCode.cover_image && !imageError ? (
          <img
            ref={imgRef}
            key={imageRefreshKey} // Force rerender when refreshKey changes
            src={getCoverImageWithCache()}
            alt={qrCode.book_title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-transparent">
            <img 
              src="/lovable-uploads/quill_icon.png"
              alt="Quilltips Logo"
              className="w-24 h-24 object-contain opacity-60"
            />
          </div>
        )}
        
        {isEditable && qrCode.id && (
          <BookCoverUpload 
            qrCodeId={qrCode.id}
            coverImage={qrCode.cover_image}
            bookTitle={qrCode.book_title}
            updateCoverImage={updateCoverImage}
          />
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p><span className="font-medium">Publisher:</span> {qrCode.publisher || 'Not specified'}</p>
        <p><span className="font-medium">Release Date:</span> {qrCode.release_date ? format(new Date(qrCode.release_date), 'PP') : 'Not specified'}</p>
        <p><span className="font-medium">ISBN:</span> {qrCode.isbn || 'Not specified'}</p>
      </div>
    </Card>
  );
};
