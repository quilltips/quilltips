
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
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-1"
    >
      <MessageCircle className="h-4 w-4 fill-[#19363C]/10 stroke-[#19363C]" />
      <span>{commentCount}</span>
    </Button>
  );
};
