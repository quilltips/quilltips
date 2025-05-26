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
    if (isLoading || liked) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('tip_likes')
        .insert([{ author_id: authorId, tip_id: tipId }]);

      if (error) throw error;
      
      setLiked(true);
      setCount(prev => prev + 1);
      
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
      className={`group flex items-center gap-1 border-none bg-transparent text-[#19363C] transition-all ${
        liked ? 'bg-transparent cursor-default border-none hover:shadow-none' : 'hover:bg-[#333333]/30  hover:shadow-none '
      } ${className}`}
      onClick={handleLike}
      disabled={isLoading || liked}
      
    >
      <ThumbsUp 
        size={16}
        className={`transition-all stroke-[#333333] ${
          liked ? 'border-[#333333] stroke-[#333333]' : ' '
        }`}
        strokeWidth={liked ? 3 : 1}
      />
      <span className="text-sm font-medium">{count}</span>
    </Button>
  );
};
