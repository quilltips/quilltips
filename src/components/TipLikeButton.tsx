
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TipLikeButtonProps = {
  tipId: string;
  authorId: string;
  authorName: string;
  initialLiked: boolean;
  likesCount: number;
  className?: string;
  bookTitle?: string;
  readerEmail?: string;
  tipAmount?: number;
  tipMessage?: string;
};

export const TipLikeButton = ({ 
  tipId, 
  authorId,
  authorName,
  initialLiked = false, 
  likesCount = 0,
  className = '',
  bookTitle,
  readerEmail,
  tipAmount,
  tipMessage
}: TipLikeButtonProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likesCount);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (liked) {
        // Remove like
        const { error } = await supabase
          .from('tip_likes')
          .delete()
          .match({ author_id: authorId, tip_id: tipId });

        if (error) throw error;
        
        setLiked(false);
        setCount(prev => Math.max(0, prev - 1));
        
      } else {
        // Add like
        const { error } = await supabase
          .from('tip_likes')
          .insert([{ author_id: authorId, tip_id: tipId }]);

        if (error) throw error;
        
        setLiked(true);
        setCount(prev => prev + 1);
        
        // Send notification to reader if we have their email
        if (readerEmail) {
          try {
            await supabase.functions.invoke('send-reader-notification', {
              body: {
                type: 'tip_liked',
                readerEmail,
                data: {
                  tipId,
                  authorName,
                  bookTitle,
                  amount: tipAmount,
                  message: tipMessage
                }
              }
            });
            console.log('Reader notification sent successfully');
          } catch (notifyError) {
            console.error('Failed to send reader notification:', notifyError);
            // Continue with the UI update even if notification fails
          }
        }
      }
    } catch (error: any) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "There was a problem updating your like",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      className={`flex items-center gap-1 ${className} ${liked ? 'bg-green-50 border-green-200 text-green-600' : ''}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <ThumbsUp size={16} className={liked ? 'text-green-600' : ''} />
      <span>{count}</span>
    </Button>
  );
};
