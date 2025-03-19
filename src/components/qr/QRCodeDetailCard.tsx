
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "../ui/card";
import { QRCodeCanvas } from "qrcode.react";

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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/6 aspect-[2/3] relative rounded-lg overflow-hidden">
            <img
              src={qrCode.cover_image || "/placeholder.svg"}
              alt={qrCode.book_title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{qrCode.book_title}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                by {qrCode.author?.name || 'Unknown Author'}
              </p>
            </div>

            {qrCode.author?.bio && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{qrCode.author.bio}</p>
              </div>
            )}

            <div className="space-y-2">
              {qrCode.publisher && (
                <p className="text-sm">
                  <span className="font-medium">Publisher:</span> {qrCode.publisher}
                </p>
              )}
              {qrCode.isbn && (
                <p className="text-sm">
                  <span className="font-medium">ISBN:</span> {qrCode.isbn}
                </p>
              )}
              {qrCode.release_date && (
                <p className="text-sm">
                  <span className="font-medium">Release Date:</span>{' '}
                  {format(new Date(qrCode.release_date), 'PPP')}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <QRCodeCanvas
            value={qrValue}
            size={180}
            level="H"
            includeMargin
            className="mx-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
};
