
import { TableCell, TableRow } from "../ui/table";
import { TipLikeButton } from "../TipLikeButton";
import { TipCommentButton } from "../TipCommentButton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";

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

  return (
    <TableRow 
      key={tip.id}
      className="cursor-pointer hover:bg-muted/50 group"
      onClick={() => onSelectTip(tip)}
    >
      <TableCell className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={tip.reader_avatar_url || "/placeholder.svg"} />
          <AvatarFallback>
            {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {tip.reader_name || "Anonymous Reader"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">${tip.amount}</span>
      </TableCell>
      <TableCell className="max-w-md">
        <p className="text-sm line-clamp-2 group-hover:text-primary/90">
          {tip.message || "No message"}
        </p>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <TipLikeButton
            tipId={tip.id}
            authorId={authorId}
            isLiked={isLiked(tip.id)}
            likeCount={likes?.filter(like => like.tip_id === tip.id).length || 0}
          />
          <TipCommentButton
            tipId={tip.id}
            authorId={authorId}
            commentCount={comments?.filter(comment => comment.tip_id === tip.id).length || 0}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
