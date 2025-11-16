import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleBookDescriptionProps {
  description: string;
  maxLines?: number;
}

export const CollapsibleBookDescription = ({
  description,
  maxLines = 3,
}: CollapsibleBookDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div
        className={`whitespace-pre-wrap ${
          !isExpanded ? "line-clamp-3" : ""
        }`}
      >
        {description}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-primary hover:text-primary/80"
      >
        {isExpanded ? (
          <>
            Read less <ChevronUp className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            Read more <ChevronDown className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};
