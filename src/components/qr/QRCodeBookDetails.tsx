
import { format } from "date-fns";

interface QRCodeBookDetailsProps {
  book: {
    title: string;
    publisher?: string | null;
    isbn?: string | null;
    release_date?: string | null;
    cover_image?: string | null;
    author?: {
      name: string | null;
      bio?: string | null;
    } | null;
  };
}

export const QRCodeBookDetails = ({ book }: QRCodeBookDetailsProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/6 aspect-[2/3] relative rounded-lg overflow-hidden">
        <img
          src={book.cover_image || "/lovable-uploads/quill_icon.png"}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{book.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            by {book.author?.name || 'Unknown Author'}
          </p>
        </div>

        {book.author?.bio && (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">{book.author.bio}</p>
          </div>
        )}

        <div className="space-y-2">
          {book.publisher && (
            <p className="text-sm">
              <span className="font-medium">Publisher:</span> {book.publisher}
            </p>
          )}
          {book.isbn && (
            <p className="text-sm">
              <span className="font-medium">ISBN:</span> {book.isbn}
            </p>
          )}
          {book.release_date && (
            <p className="text-sm">
              <span className="font-medium">Release Date:</span>{' '}
              {format(new Date(book.release_date), 'PPP')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
