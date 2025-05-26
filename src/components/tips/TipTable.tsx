
import { TipTableRow } from "./TipTableRow";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

interface TipTableProps {
  tips: any[];
  authorId: string;
  likes?: any[];
  comments?: any[];
  showAll?: boolean;
  setShowAll?: (show: boolean) => void;
  onSelectTip: (tip: any) => void;
  limit?: number;
}

export const TipTable = ({
  tips,
  authorId,
  likes,
  comments,
  showAll,
  setShowAll,
  onSelectTip,
  limit = 5
}: TipTableProps) => {
  const displayTips = showAll ? tips : tips.slice(0, limit);

  return (
    <div className="space-y-4">
      <div className="space-y-5">
        {displayTips.map((tip) => (
          <TipTableRow
            key={tip.id}
            tip={tip}
            authorId={authorId}
            likes={likes}
            comments={comments}
            onSelectTip={onSelectTip}
          />
        ))}
      </div>

      {tips.length > limit && (
        <Button 
          variant="ghost" 
          onClick={() => setShowAll?.(!showAll)}
          className="w-full text-[#718096] hover:text-[#2D3748] hover:bg-gray-100 py-1 h-auto text-xs"
        >
          <ChevronDown className={`mr-1 h-3 w-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show Less' : `Show ${tips.length - limit} More`}
        </Button>
      )}
    
    </div>
    
  );
};
