
import { format } from "date-fns";
import { Card } from "../ui/card";
import { Book } from "lucide-react";

interface QRCodeInfoCardProps {
  qrCode: {
    book_title: string;
    publisher: string | null;
    release_date: string | null;
    isbn: string | null;
    cover_image: string | null;
  };
}

export const QRCodeInfoCard = ({ qrCode }: QRCodeInfoCardProps) => {
  return (
    <Card className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{qrCode.book_title}</h1>
      
      <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
        {qrCode.cover_image ? (
          <img
            src={qrCode.cover_image}
            alt={qrCode.book_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Publisher:</span> {qrCode.publisher || 'Not specified'}</p>
        <p><span className="font-medium">Release Date:</span> {qrCode.release_date ? format(new Date(qrCode.release_date), 'PP') : 'Not specified'}</p>
        <p><span className="font-medium">ISBN:</span> {qrCode.isbn || 'Not specified'}</p>
      </div>
    </Card>
  );
};
