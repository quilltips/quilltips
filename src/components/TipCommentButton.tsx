
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface TipCommentButtonProps {
  tipId: string;
  authorId: string;
  commentCount: number;
  onClick?: () => void;
}

export const TipCommentButton = ({ 
  tipId, 
  authorId, 
  commentCount, 
  onClick 
}: TipCommentButtonProps) => {
  const queryClient = useQueryClient();

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
