
import { Card, CardContent, CardHeader } from "../ui/card";
import { QRCodeBookDetails } from "./QRCodeBookDetails";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface QRCodeDetailCardProps {
  qrCode: {
    id: string;
    book_title: string;
    publisher?: string | null;
    isbn?: string | null;
    release_date?: string | null;
    cover_image?: string | null;
    author?: {
      name: string | null;
      bio?: string | null;
      avatar_url?: string | null;
    } | null;
  };
}

export const QRCodeDetailCard = ({ qrCode }: QRCodeDetailCardProps) => {
  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  const bookDetails = {
    title: qrCode.book_title,
    publisher: qrCode.publisher,
    isbn: qrCode.isbn,
    release_date: qrCode.release_date,
    cover_image: qrCode.cover_image,
    author: qrCode.author
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="bg-gray-50">
        <QRCodeBookDetails book={bookDetails} />
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        <QRCodeDisplay 
          value={qrValue}
          className="max-w-[240px] mx-auto" 
        />
      </CardContent>
    </Card>
  );
};
