
import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

interface QRCodeHeaderProps {
  coverImage: string | null;
  bookTitle: string;
}

export const QRCodeHeader = ({ coverImage, bookTitle }: QRCodeHeaderProps) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state if cover image changes
  useEffect(() => {
    setImageError(false);
  }, [coverImage]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="w-32 h-44 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
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
        <p className="text-gray-500">Your QR code is being generated</p>
      </div>
    </div>
  );
};
