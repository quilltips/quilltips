
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type TipCommentButtonProps = {
  tipId: string;
  authorId: string;
  authorName: string;
  initialCount: number;
  className?: string;
  bookTitle?: string;
  readerEmail?: string;
  tipMessage?: string;
  tipAmount?: number;
};

export const TipCommentButton = ({
  tipId,
  authorId,
  authorName,
  initialCount = 0,
  className = '',
  bookTitle,
  readerEmail,
  tipMessage,
  tipAmount
}: TipCommentButtonProps) => {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [count, setCount] = useState(initialCount);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!comment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tip_comments')
        .insert([{
          author_id: authorId,
          tip_id: tipId,
          content: comment.trim()
        }]);

      if (error) throw error;

      // Success
      setCount(prev => prev + 1);
      setComment('');
      setOpen(false);
      
      // Send notification to reader if we have their email
      if (readerEmail) {
        try {
          await supabase.functions.invoke('send-reader-notification', {
            body: {
              type: 'tip_commented',
              readerEmail,
              data: {
                tipId,
                authorName,
                bookTitle,
                amount: tipAmount,
                message: tipMessage,
                commentContent: comment.trim()
              }
            }
          });
          console.log('Reader notification sent successfully');
        } catch (notifyError) {
          console.error('Failed to send reader notification:', notifyError);
          // Continue with the UI update even if notification fails
        }
      }

      toast({
        title: "Comment Posted",
        description: "Your comment has been successfully posted",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "There was an error posting your comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-1 ${className}`}
        onClick={() => setOpen(true)}
      >
        <MessageSquare size={16} />
        <span>{count}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a comment</DialogTitle>
            <DialogDescription>
              Your comment will be visible to the reader who left this tip.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your comment..."
              className="min-h-[100px]"
              aria-label="Comment text"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!comment.trim() || isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
