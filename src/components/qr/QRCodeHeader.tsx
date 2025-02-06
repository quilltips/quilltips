
import { Book } from "lucide-react";

interface QRCodeHeaderProps {
  coverImage?: string | null;
  bookTitle: string;
}

export const QRCodeHeader = ({ coverImage, bookTitle }: QRCodeHeaderProps) => {
  return (
    <div className="flex items-start gap-6">
      <div className="w-32 h-44 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
        {coverImage ? (
          <img
            src={coverImage}
            alt={bookTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Book className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold">{bookTitle}</h1>
        <p className="text-muted-foreground">Your QR code is being generated</p>
      </div>
    </div>
  );
};
