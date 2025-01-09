import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TipLikeButtonProps {
  tipId: string;
  authorId: string;
  isLiked: boolean;
  likeCount: number;
}

export const TipLikeButton = ({ tipId, authorId, isLiked, likeCount }: TipLikeButtonProps) => {
  const queryClient = useQueryClient();

  const handleLike = async () => {
    try {
      // First, check if the user has already liked this tip
      const { data: existingLike, error: checkError } = await supabase
        .from('tip_likes')
        .select('*')
        .eq('tip_id', tipId)
        .eq('author_id', authorId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking like:", checkError);
        return;
      }

      if (existingLike) {
        // Unlike: Remove the existing like
        const { error: deleteError } = await supabase
          .from('tip_likes')
          .delete()
          .eq('tip_id', tipId)
          .eq('author_id', authorId);

        if (deleteError) {
          console.error("Error unliking tip:", deleteError);
          return;
        }
      } else {
        // Like: Add new like
        const { error: insertError } = await supabase
          .from('tip_likes')
          .insert({ tip_id: tipId, author_id: authorId });

        if (insertError) {
          console.error("Error liking tip:", insertError);
          return;
        }
      }

      // Invalidate and refetch the likes query to update the UI
      queryClient.invalidateQueries({ queryKey: ['tip_likes', authorId] });
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "ghost"}
      size="sm"
      onClick={handleLike}
      className="flex items-center gap-1"
    >
      <Heart className="h-4 w-4" />
      <span>{likeCount}</span>
    </Button>
  );
};