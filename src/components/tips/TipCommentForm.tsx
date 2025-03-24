
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface TipCommentFormProps {
  tipId: string;
  authorId: string;
  onCommentAdded?: () => void;
}

export const TipCommentForm = ({ tipId, authorId, onCommentAdded }: TipCommentFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('tip_comments')
        .insert({ tip_id: tipId, author_id: authorId, content });

      if (error) {
        throw error;
      }

      // Success
      setContent("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tip_comments', authorId] });
      queryClient.invalidateQueries({ queryKey: ['tip_comments', tipId] });
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Comment failed",
        description: "There was an error posting your comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full resize-none border-[#E2E8F0] focus:border-[#CBD5E0]"
        rows={2}
      />
      <div className="flex justify-end mt-2">
        <Button 
          type="submit" 
          disabled={!content.trim() || isSubmitting}
          className="bg-[#F6E05E] text-[#744210] hover:bg-[#F6D349]"
        >
          {isSubmitting ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
};
