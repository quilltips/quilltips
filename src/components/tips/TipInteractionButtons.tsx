
import { TipLikeButton } from "../TipLikeButton";
import { TipCommentButton } from "../TipCommentButton";
import { PublicTipCommentButton } from "./PublicTipCommentButton";

interface TipInteractionButtonsProps {
  tipId: string;
  authorId: string;
  authorName: string;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  readerEmail?: string | null;
  bookTitle?: string;
  tipMessage?: string;
  tipAmount?: number;
  onCommentClick?: () => void;
}

export const TipInteractionButtons = ({
  tipId,
  authorId,
  authorName,
  isLiked,
  likeCount,
  commentCount,
  readerEmail,
  bookTitle,
  tipMessage,
  tipAmount,
  onCommentClick
}: TipInteractionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <TipLikeButton
        tipId={tipId}
        authorId={authorId}
        authorName={authorName}
        initialLiked={isLiked}
        likesCount={likeCount}
        readerEmail={readerEmail}
        bookTitle={bookTitle}
        tipMessage={tipMessage}
        tipAmount={tipAmount}
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
          authorName={authorName}
          initialCount={commentCount}
          readerEmail={readerEmail}
          bookTitle={bookTitle}
          tipMessage={tipMessage}
          tipAmount={tipAmount}
        />
      )}
    </div>
  );
};
