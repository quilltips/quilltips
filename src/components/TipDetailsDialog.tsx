
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';

interface TipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tip: any;
}

export const TipDetailsDialog = ({ isOpen, onClose, tip }: TipDetailsDialogProps) => {
  const { user } = useAuth();
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

      // Fetch reader email
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

    // Set up real-time subscription for comments
    const commentsSubscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tip_comments',
        filter: `tip_id=eq.${tip.id}`
      }, async () => {
        // Refresh comments when there's a change
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
      const { error } = await supabase
        .from('tip_comments')
        .insert([{
          author_id: user.id,
          tip_id: tip.id,
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment('');
      
      // Send notification to reader if we have their email
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
                commentContent: newComment.trim()
              }
            }
          });
        } catch (notifyError) {
          console.error('Failed to send reader notification:', notifyError);
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tip) return null;

  // Extract first name from reader_name
  const firstName = tip.reader_name ? tip.reader_name.split(' ')[0] : "Anonymous";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair">Tip Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Header with reader info */}
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={tip.reader_avatar_url || "/reader-avatar.svg"} alt={firstName} />
              <AvatarFallback>
                {(tip.reader_name || "A").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className="font-medium text-lg">{tip.reader_name || "Anonymous Reader"}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {/* Tip details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-accent/10 px-4 py-3 rounded-md">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium text-lg">${tip.amount}</span>
            </div>
            
            {tip.book_title && (
              <div className="flex justify-between items-center bg-accent/10 px-4 py-3 rounded-md">
                <span className="text-muted-foreground">Book</span>
                <span className="font-medium italic">{tip.book_title}</span>
              </div>
            )}
            
            {tip.message && (
              <div className="bg-accent/10 px-4 py-3 rounded-md">
                <p className="text-muted-foreground mb-2">Message</p>
                <p className="font-medium">{tip.message}</p>
              </div>
            )}
          </div>
          
          {/* Comments section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Comments ({comments.length})</h3>
            </div>

            {user && (
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="self-end"
                >
                  Post
                </Button>
              </div>
            )}

            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        {(comment.profiles?.name || "A").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {comment.profiles?.name || "Author"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm pl-10">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
