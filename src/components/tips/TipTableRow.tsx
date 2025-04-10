
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { TipMessagePreview } from "./TipMessagePreview";
import { TipInteractionButtons } from "./TipInteractionButtons";
import { useAuth } from "../auth/AuthProvider";

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
  const { user } = useAuth();
  
  const isLiked = user ? likes?.some(like => 
    like.tip_id === tip.id && like.author_id === user.id
  ) : false;
  
  const likeCount = likes?.filter(like => like.tip_id === tip.id).length || 0;
  const commentCount = comments?.filter(comment => comment.tip_id === tip.id).length || 0;
  
  // Extract first name from reader_name
  const firstName = tip.reader_name ? tip.reader_name.split(' ')[0] : "Anonymous";

  return (
    <div 
      className="group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
      onClick={() => onSelectTip(tip)}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={tip.reader_avatar_url || "/placeholder.svg"} />
          <AvatarFallback>
            {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="space-y-0.5">
            <p className="text-sm">
              <span className="font-medium">{firstName}</span>
              {" sent "}
              <span className="font-medium">${tip.amount}</span>
              {tip.book_title && (
                <> for <span className="italic">{tip.book_title}</span></>
              )}
            </p>
            
            <TipMessagePreview message={tip.message} />
            
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
            </p>
          </div>

          {user && (
            <div onClick={(e) => e.stopPropagation()} className="mt-1">
              <TipInteractionButtons
                tipId={tip.id}
                authorId={user.id}
                isLiked={isLiked}
                likeCount={likeCount}
                commentCount={commentCount}
                onCommentClick={() => onSelectTip(tip)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
