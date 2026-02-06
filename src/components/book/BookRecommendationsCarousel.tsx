import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Recommendation {
  id: string;
  recommended_book_title: string;
  recommended_book_author: string;
  recommended_book_cover_url?: string;
  recommended_qr_code_id?: string;
  recommended_book_slug?: string;
  buy_link?: string;
}

interface BookRecommendationsCarouselProps {
  recommendations: Recommendation[];
  authorName: string;
}

export const BookRecommendationsCarousel = ({
  recommendations,
  authorName,
}: BookRecommendationsCarouselProps) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const firstName = authorName.split(' ')[0];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-playfair text-foreground">
        {firstName}'s Bookshelf
      </h3>
      <Carousel className="w-full px-10">
        <CarouselContent>
          {recommendations.map((rec) => {
            const linkTo = rec.recommended_book_slug
              ? `/book/${rec.recommended_book_slug}`
              : rec.recommended_qr_code_id
                ? `/qr/${rec.recommended_qr_code_id}`
                : null;

            const content = (
              <div className="space-y-2">
                {rec.recommended_book_cover_url ? (
                  <OptimizedImage
                    src={rec.recommended_book_cover_url}
                    alt={rec.recommended_book_title}
                    className="w-full max-w-[128px] mx-auto aspect-[2/3] object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full max-w-[128px] mx-auto aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs">No cover</span>
                  </div>
                )}
                <h4 className="font-semibold text-sm text-foreground line-clamp-2 text-center">
                  {rec.recommended_book_title}
                </h4>
                {rec.recommended_book_author && (
                  <p className="text-xs text-center">
                    {rec.recommended_book_author}
                  </p>
                )}
              </div>
            );

            return (
              <CarouselItem key={rec.id} className="basis-1/3 sm:basis-1/4 md:basis-1/2 lg:basis-1/3">
                {linkTo ? (
                  <Link to={linkTo} className="block group hover:opacity-90 transition-opacity">
                    {content}
                  </Link>
                ) : (
                  <div>{content}</div>
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {recommendations.length > 1 && (
          <>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </>
        )}
      </Carousel>
    </div>
  );
};
