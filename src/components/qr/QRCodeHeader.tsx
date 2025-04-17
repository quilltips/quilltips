
import { format } from "date-fns";
import { OptimizedImage } from "../ui/optimized-image";

interface QRCodeHeaderProps {
  coverImage: string | null;
  bookTitle: string;
  publisher?: string | null;
  releaseDate?: string | null;
}

export const QRCodeHeader = ({ coverImage, bookTitle, publisher, releaseDate }: QRCodeHeaderProps) => {
  // Format the release date if it exists
  const formattedDate = releaseDate 
    ? format(new Date(releaseDate), "MMMM d, yyyy")
    : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="w-32 h-44 flex items-center justify-center rounded overflow-hidden shadow-md">
        <OptimizedImage
          src={coverImage || "/lovable-uploads/quill_icon.png"}
          alt={`Cover for ${bookTitle}`}
          className="w-full h-full"
          objectFit={coverImage ? "cover" : "contain"}
          fallbackSrc="/lovable-uploads/quill_icon.png"
          sizes="128px"
        />
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
      </div>
    </div>
  );
};
