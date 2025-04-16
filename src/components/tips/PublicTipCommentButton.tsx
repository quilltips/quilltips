import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";

interface PublicTipCommentButtonProps {
  commentCount: number;
  onClick?: () => void;
}

export const PublicTipCommentButton = ({ 
  commentCount, 
  onClick 
}: PublicTipCommentButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const iconClass = commentCount > 0
    ? "stroke-[#19363C] fill-[#19363C]/80"
    : "stroke-[#19363C] fill-none";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-1"
    >
      <MessageCircle className={`h-4 w-4 ${iconClass}`} />
      <span>{commentCount}</span>
    </Button>
  );
};
