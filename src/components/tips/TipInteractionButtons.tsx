
import { TipLikeButton } from "../TipLikeButton";
import { TipCommentButton } from "../TipCommentButton";
import { PublicTipCommentButton } from "./PublicTipCommentButton";

interface TipInteractionButtonsProps {
  tipId: string;
  authorId: string;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onCommentClick?: () => void;
}

export const TipInteractionButtons = ({
  tipId,
  authorId,
  isLiked,
  likeCount,
  commentCount,
  onCommentClick
}: TipInteractionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <TipLikeButton
        tipId={tipId}
        authorId={authorId}
        authorName="" // Adding required prop
        initialLiked={isLiked}
        likesCount={likeCount}
      />
      {onCommentClick ? (
        <PublicTipCommentButton 
          commentCount={commentCount}
          onClick={onCommentClick}
        />
      ) : (
        <TipCommentButton
          tipId={tipId}
          authorId={authorId}
          authorName="" // Adding required prop
          initialCount={commentCount}
        />
      )}
    </div>
  );
};
