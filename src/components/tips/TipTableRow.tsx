import { TableCell, TableRow } from "../ui/table";
import { TipLikeButton } from "../TipLikeButton";
import { TipCommentButton } from "../TipCommentButton";

interface TipTableRowProps {
  tip: {
    id: string;
    created_at: string;
    book_title: string;
    amount: number;
    message: string;
    author_id: string;
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
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSelectTip(tip)}
    >
      <TableCell>
        {new Date(tip.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>{tip.book_title || "N/A"}</TableCell>
      <TableCell>${tip.amount}</TableCell>
      <TableCell>{tip.message || "No message"}</TableCell>
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