
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface TipLikeButtonProps {
  tipId: string;
  authorId: string;
  isLiked: boolean;
  likeCount: number;
}

export const TipLikeButton = ({ tipId, authorId, isLiked: initialIsLiked, likeCount: initialLikeCount }: TipLikeButtonProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [localIsLiked, setLocalIsLiked] = useState(initialIsLiked);
  const [localLikeCount, setLocalLikeCount] = useState(initialLikeCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle local state immediately for better UX
    const newLikedState = !localIsLiked;
    setLocalIsLiked(newLikedState);
    setLocalLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    try {
      if (localIsLiked) {
        // Unlike: Remove the existing like
        const { error: deleteError } = await supabase
          .from('tip_likes')
          .delete()
          .eq('tip_id', tipId)
          .eq('author_id', authorId);

        if (deleteError) {
          throw deleteError;
        }
      } else {
        // Like: Add new like
        const { error: insertError } = await supabase
          .from('tip_likes')
          .insert({ tip_id: tipId, author_id: authorId });

        if (insertError) {
          throw insertError;
        }
      }

      // Invalidate and refetch the likes queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['tip_likes'] });
      queryClient.invalidateQueries({ queryKey: ['public-tip-likes'] });
    } catch (error) {
      // Revert local state on error
      setLocalIsLiked(!newLikedState);
      setLocalLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
      
      console.error("Error handling like:", error);
      toast({
        title: "Action failed",
        description: "There was an error processing your like",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className="flex items-center gap-1"
    >
      <Heart className={`h-4 w-4 ${localIsLiked ? "fill-[#19363C]" : ""}`} />
      <span>{localLikeCount}</span>
    </Button>
  );
};
