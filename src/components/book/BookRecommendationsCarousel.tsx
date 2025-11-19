import { ExternalLink } from "lucide-react";

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

  const firstName = authorName.split(' ')[0];

  return (
    <div className="space-y-4 pt-2 pb-8">
      <h3 className="text-xl font-playfair text-foreground">
        {firstName} also recommends these books!
      </h3>
      <ul className="space-y-2 list-disc list-inside">
        {recommendations.map((rec) => (
          <li key={rec.id} className="text-foreground">
            {rec.buy_link ? (
              <a
                href={rec.buy_link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-1"
              >
                {rec.recommended_book_title}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span>{rec.recommended_book_title}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
