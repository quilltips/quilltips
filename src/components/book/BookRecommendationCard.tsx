import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface BookRecommendationCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  buyLink?: string;
  recommendation?: string;
}

export const BookRecommendationCard = ({
  title,
  author,
  coverUrl,
  buyLink,
  recommendation,
}: BookRecommendationCardProps) => {
  return (
    <div className="bg-card rounded-lg p-4 space-y-3 border">
      <div className="flex gap-4">
        {coverUrl ? (
          <OptimizedImage
            src={coverUrl}
            alt={title}
            className="w-20 h-28 object-cover rounded"
          />
        ) : (
          <div className="w-20 h-28 bg-muted rounded flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No cover</span>
          </div>
        )}
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-foreground line-clamp-2">{title}</h4>
          <p className="text-sm text-muted-foreground">by {author}</p>
        </div>
      </div>
      
      {recommendation && (
        <p className="text-sm text-muted-foreground italic">"{recommendation}"</p>
      )}
      
      {buyLink && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open(buyLink, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Get this book
        </Button>
      )}
    </div>
  );
};
