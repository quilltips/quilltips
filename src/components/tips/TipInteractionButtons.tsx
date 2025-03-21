
import { TipLikeButton } from "../TipLikeButton";
import { TipCommentButton } from "../TipCommentButton";

interface TipInteractionButtonsProps {
  tipId: string;
  authorId: string;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
}

export const TipInteractionButtons = ({
  tipId,
  authorId,
  isLiked,
  likeCount,
  commentCount
}: TipInteractionButtonsProps) => {
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <TipLikeButton
        tipId={tipId}
        authorId={authorId}
        isLiked={isLiked}
        likeCount={likeCount}
      />
      <TipCommentButton
        tipId={tipId}
        authorId={authorId}
        commentCount={commentCount}
      />
    </div>
  );
};
