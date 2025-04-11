
import { format } from "date-fns";
import { Card } from "../ui/card";
import { BookCoverUpload } from "./BookCoverUpload";
import { useState } from "react";

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
  const [coverImage, setCoverImage] = useState<string | null>(qrCode.cover_image);

  const handleImageUpdate = (newImageUrl: string) => {
    setCoverImage(newImageUrl || null);
  };

  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#19363C]">{qrCode.book_title}</h1>

      <div className="aspect-square relative rounded-xl overflow-hidden border border-muted">
        {coverImage ? (
          <img
            src={coverImage}
            alt={qrCode.book_title}
            className="w-full h-full object-cover"
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
            coverImage={coverImage}
            bookTitle={qrCode.book_title}
            onImageUpdate={handleImageUpdate}
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
