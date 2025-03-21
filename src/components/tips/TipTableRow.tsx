
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { TipMessagePreview } from "./TipMessagePreview";
import { TipInteractionButtons } from "./TipInteractionButtons";

interface TipTableRowProps {
  tip: {
    id: string;
    created_at: string;
    book_title: string;
    amount: number;
    message: string;
    author_id: string;
    reader_name?: string;
    reader_avatar_url?: string;
  };
  authorId: string;
  likes?: any[];
  comments?: any[];
  onSelectTip: (tip: any) => void;
}

export const TipTableRow = ({ 
  tip, 
  authorId, 
  likes, 
  comments,
  onSelectTip 
}: TipTableRowProps) => {
  const isLiked = (tipId: string) => {
    return likes?.some(like => like.tip_id === tipId);
  };
  
  const likeCount = likes?.filter(like => like.tip_id === tip.id).length || 0;
  const commentCount = comments?.filter(comment => comment.tip_id === tip.id).length || 0;

  return (
    <div 
      className="group cursor-pointer hover:bg-muted/50 p-4 rounded-lg transition-colors"
      onClick={() => onSelectTip(tip)}
    >
      <div className="flex gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={tip.reader_avatar_url || "/placeholder.svg"} />
          <AvatarFallback>
            {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <p className="text-base">
              <span className="font-medium">{tip.reader_name || "Anonymous Reader"}</span>
              {" sent "}
              <span className="font-medium">${tip.amount}</span>
            </p>
            
            <TipMessagePreview message={tip.message} />
            
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
            </p>
          </div>

          <TipInteractionButtons
            tipId={tip.id}
            authorId={authorId}
            isLiked={isLiked(tip.id)}
            likeCount={likeCount}
            commentCount={commentCount}
          />
        </div>
      </div>
    </div>
  );
};
