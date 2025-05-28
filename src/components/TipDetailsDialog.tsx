
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { TipReaderAvatar } from './tips/TipReaderAvatar';
import { AuthorCommentAvatar } from './tips/AuthorCommentAvatar';
import { TipMessagePreview } from './tips/TipMessagePreview';

interface TipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tip: any;
}

export const TipDetailsDialog = ({ isOpen, onClose, tip }: TipDetailsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readerEmail, setReaderEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!tip || !isOpen) return;

    const fetchComments = async () => {
      const { data: commentsData } = await supabase
        .from('tip_comments')
        .select('*, profiles(name, avatar_url)')
        .eq('tip_id', tip.id)
        .order('created_at', { ascending: false });

      if (commentsData) {
        setComments(commentsData);
      }

      const { data: tipData } = await supabase
        .from('tips')
        .select('reader_email')
        .eq('id', tip.id)
        .single();

      if (tipData) {
        setReaderEmail(tipData.reader_email);
      }
    };

    fetchComments();

    const commentsSubscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tip_comments',
        filter: `tip_id=eq.${tip.id}`
      }, async () => {
        const { data: newComments } = await supabase
          .from('tip_comments')
          .select('*, profiles(name, avatar_url)')
          .eq('tip_id', tip.id)
          .order('created_at', { ascending: false });

        if (newComments) {
          setComments(newComments);
        }
      })
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [tip, isOpen]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const trimmed = newComment.trim();

      const { error } = await supabase
        .from('tip_comments')
        .insert([{
          author_id: user.id,
          tip_id: tip.id,
          content: trimmed
        }]);

      if (error) throw error;

      setComments(prev => [
        {
          id: Math.random().toString(),
          created_at: new Date().toISOString(),
          content: trimmed,
          author_id: user.id,
          profiles: {
            name: user.user_metadata?.name || user.email || "You",
            avatar_url: user.user_metadata?.avatar_url || null,
          }
        },
        ...prev
      ]);

      setNewComment('');

      toast({
        title: "Comment posted!",
        description: "Your reply has been sent to the reader.",
      });

      if (readerEmail) {
        try {
          await supabase.functions.invoke('send-reader-notification', {
            body: {
              type: 'tip_commented',
              readerEmail,
              data: {
                tipId: tip.id,
                authorName: user.user_metadata?.name || user.email || "",
                bookTitle: tip.book_title,
                amount: tip.amount,
                message: tip.message,
                commentContent: trimmed
              }
            }
          });
        } catch (notifyError) {
          console.error('Failed to send reader notification:', notifyError);
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "There was a problem posting your comment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tip) return null;

  const firstName = tip.reader_name ? tip.reader_name.split(' ')[0] : "Anonymous";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg font-playfair">Tip Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-4rem)]">
          <div className="p-6 space-y-8">
            {/* Tip content that matches TipTableRow */}
            <div className="flex gap-3 font-bold">
              <TipReaderAvatar readerName={tip.reader_name} className="h-8 w-8" />

              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <p className="text-md">
                    <span className="">{firstName}</span>
                    {" sent "}
                    <span className="">${tip.amount}</span>
                    {tip.book_title && (
                      <> for <span className="italic">{tip.book_title}</span></>
                    )}
                  </p>
                  
                  <div className="flex justify-between items-start gap-2">
                    <TipMessagePreview message={tip.message} />
                    <p className="text-sm font-medium flex-shrink-0">
                      {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-2 "></div>

            {/* Comments section with improved spacing */}
            <div className="space-y-6">
              {user && (
                <div className="space-y-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full text-sm min-h-[80px]"
                  />
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
                  >
                    Post Comment
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-medium text-sm">Comments ({comments.length})</h3>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <AuthorCommentAvatar 
                        authorName={comment.profiles?.name} 
                        avatarUrl={comment.profiles?.avatar_url}
                        className="h-7 w-7" 
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {comment.profiles?.name || "Author"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm pl-10 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
