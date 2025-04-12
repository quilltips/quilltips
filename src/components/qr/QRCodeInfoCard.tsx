
import { format } from "date-fns";
import { Card } from "../ui/card";
import { BookCoverUpload } from "./BookCoverUpload";
import { useQRCodeDetailsPage } from "@/hooks/use-qr-code-details-page";
import { useState, useEffect } from "react";

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
  // Get the mutation function from the hook if we're in an editable context
  const { updateCoverImage } = isEditable ? useQRCodeDetailsPage() : { updateCoverImage: undefined };
  const [imageError, setImageError] = useState(false);
  
  // Reset image error state if cover image changes
  useEffect(() => {
    setImageError(false);
  }, [qrCode.cover_image]);

  const handleImageError = () => {
    console.log("Image failed to load:", qrCode.cover_image);
    setImageError(true);
  };

  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#19363C]">{qrCode.book_title}</h1>

      <div className="aspect-square relative rounded-xl overflow-hidden border border-muted">
        {qrCode.cover_image && !imageError ? (
          <img
            src={qrCode.cover_image}
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
