import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleBookDescriptionProps {
  description: string;
  maxLines?: number;
}

export const CollapsibleBookDescription = ({
  description,
  maxLines = 6,
}: CollapsibleBookDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        setIsTruncated(element.scrollHeight > element.clientHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [description]);

  return (
    <div className="space-y-3">
      <div
        ref={contentRef}
        className={`whitespace-pre-wrap ${
          !isExpanded ? "line-clamp-6" : ""
        }`}
      >
        {description}
      </div>
      {isTruncated && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary/80 -mt-1"
        >
          {isExpanded ? (
            <>
              Read less <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};
