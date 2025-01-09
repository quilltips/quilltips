import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TipCommentButtonProps {
  tipId: string;
  authorId: string;
  commentCount: number;
}

export const TipCommentButton = ({ tipId, authorId, commentCount }: TipCommentButtonProps) => {
  const queryClient = useQueryClient();

  const handleComment = async () => {
    try {
      const content = prompt("Enter your comment:");
      if (!content) return;

      const { error } = await supabase
        .from('tip_comments')
        .insert({ tip_id: tipId, author_id: authorId, content });

      if (error) {
        console.error("Error commenting on tip:", error);
        return;
      }

      // Invalidate and refetch the comments query to update the UI
      queryClient.invalidateQueries({ queryKey: ['tip_comments', authorId] });
    } catch (error) {
      console.error("Error handling comment:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleComment}
      className="flex items-center gap-1"
    >
      <MessageCircle className="h-4 w-4" />
      <span>{commentCount}</span>
    </Button>
  );
};