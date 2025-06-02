
import { format } from "date-fns";
import { OptimizedImage } from "../ui/optimized-image";

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
      {/* Book cover now displayed first and more prominently */}
      <div className="w-full md:w-1/4 aspect-[2/3] relative rounded-lg overflow-hidden">
        <OptimizedImage
          src={book.cover_image || "/lovable-uploads/logo_nav.png"}
          alt={book.title}
          className="w-full h-full"
          objectFit={book.cover_image ? "cover" : "contain"}
          fallbackSrc="/lovable-uploads/logo_nav.png"
          sizes="(max-width: 768px) 100vw, 200px"
        />
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <p className="text-lg ">
            by {book.author?.name || 'Unknown Author'}
          </p>
        </div>

        {book.author?.bio && (
          <div className="prose prose-sm max-w-none">
            <p className="">{book.author.bio}</p>
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
