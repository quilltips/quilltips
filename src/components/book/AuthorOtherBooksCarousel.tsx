import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Book {
  id: string;
  book_title: string;
  cover_image?: string;
  slug?: string;
}

interface AuthorOtherBooksCarouselProps {
  books: Book[];
  authorName: string;
  currentBookId: string;
}

export const AuthorOtherBooksCarousel = ({
  books,
  authorName,
  currentBookId,
}: AuthorOtherBooksCarouselProps) => {
  const otherBooks = books?.filter((book) => book.id !== currentBookId) || [];

  if (otherBooks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-playfair text-foreground">
        More by {authorName}
      </h3>
      <Carousel className="w-full">
        <CarouselContent>
          {otherBooks.map((book) => (
            <CarouselItem key={book.id} className="basis-1/3 sm:basis-1/4 md:basis-1/2 lg:basis-1/3">
              <Link
                to={book.slug ? `/book/${book.slug}` : `/qr/${book.id}`}
                className="block space-y-2 group"
              >
                {book.cover_image ? (
                  <OptimizedImage
                    src={book.cover_image}
                    alt={book.book_title}
                    className="w-full max-w-[128px] mx-auto aspect-[2/3] object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-full max-w-[128px] mx-auto aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No cover</span>
                  </div>
                )}
                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 text-center">
                  {book.book_title}
                </h4>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        {otherBooks.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};
