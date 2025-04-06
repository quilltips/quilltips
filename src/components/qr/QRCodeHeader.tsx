
import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { format } from "date-fns";

interface QRCodeHeaderProps {
  coverImage: string | null;
  bookTitle: string;
  publisher?: string | null;
  releaseDate?: string | null;
}

export const QRCodeHeader = ({ coverImage, bookTitle, publisher, releaseDate }: QRCodeHeaderProps) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state if cover image changes
  useEffect(() => {
    setImageError(false);
  }, [coverImage]);

  // Format the release date if it exists
  const formattedDate = releaseDate 
    ? format(new Date(releaseDate), "MMMM d, yyyy")
    : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="w-32 h-44 flex items-center justify-center bg-gray-100 rounded overflow-hidden shadow-md">
        {coverImage && !imageError ? (
          <img
            src={coverImage}
            alt={`Cover for ${bookTitle}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4">
            <ImageOff className="h-8 w-8 mb-2" />
            <p className="text-xs text-center">Cover image unavailable</p>
          </div>
        )}
      </div>
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{bookTitle}</h1>
        
        {/* Publisher and release date information */}
        {(publisher || formattedDate) && (
          <div className="text-gray-600 mb-2">
            {publisher && <span>{publisher}</span>}
            {publisher && formattedDate && <span className="mx-2">•</span>}
            {formattedDate && <span>{formattedDate}</span>}
          </div>
        )}
        
        <p className="text-gray-500">Create a QR code for readers to tip and message you</p>
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-[#FFD166]/20 text-[#FFD166] text-sm">
          <span className="mr-1 h-2 w-2 rounded-full bg-[#FFD166]"></span>
          QR Code Ready for Purchase
        </div>
      </div>
    </div>
  );
};
