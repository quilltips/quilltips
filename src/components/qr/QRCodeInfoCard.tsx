
import { format } from "date-fns";
import { Card } from "../ui/card";
import { BookCoverUpload } from "./BookCoverUpload";
import { useQRCodeDetailsPage } from "@/hooks/use-qr-code-details-page";
import { useState, useEffect } from "react";
import { OptimizedImage } from "../ui/optimized-image";

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
    imageRefreshKey: 0,
    refreshImage: () => {}
  };

  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#19363C]">{qrCode.book_title}</h1>

      <div className="aspect-square relative rounded-xl overflow-hidden border border-muted">
        <OptimizedImage
          key={imageRefreshKey} // Force rerender when refreshKey changes
          src={qrCode.cover_image || "/lovable-uploads/quill_icon.png"}
          alt={qrCode.book_title}
          className="w-full h-full"
          objectFit={qrCode.cover_image ? "cover" : "contain"}
          fallbackSrc="/lovable-uploads/quill_icon.png"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        
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
