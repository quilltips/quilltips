
import { TipTableRow } from "./TipTableRow";
import { Button } from "../ui/button";

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
  limit
}: TipTableProps) => {
  const displayTips = showAll ? tips : tips.slice(0, limit || tips.length);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
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

      {limit && tips.length > limit && !showAll && (
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowAll?.(true)}
          >
            Show all tips
          </Button>
        </div>
      )}
    </div>
  );
};
