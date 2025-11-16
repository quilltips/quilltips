import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BookRecommendationCard } from "./BookRecommendationCard";

interface Recommendation {
  id: string;
  recommended_book_title: string;
  recommended_book_author: string;
  recommended_book_cover_url?: string;
  buy_link?: string;
  recommendation_text?: string;
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

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-playfair text-foreground">
        {authorName} Recommends
      </h3>
      <Carousel className="w-full">
        <CarouselContent>
          {recommendations.map((rec) => (
            <CarouselItem key={rec.id} className="md:basis-1/2 lg:basis-1/3">
              <BookRecommendationCard
                title={rec.recommended_book_title}
                author={rec.recommended_book_author}
                coverUrl={rec.recommended_book_cover_url || undefined}
                buyLink={rec.buy_link || undefined}
                recommendation={rec.recommendation_text || undefined}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {recommendations.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};
