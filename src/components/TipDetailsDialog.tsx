import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { TipInteractionButtons } from './tips/TipInteractionButtons';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface TipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tip: any;
}

export const TipDetailsDialog = ({ isOpen, onClose, tip }: TipDetailsDialogProps) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [readerEmail, setReaderEmail] = useState<string | null>(null);
  
  useEffect(() => {
    if (!tip || !isOpen) return;

    const fetchLikesAndComments = async () => {
      // Fetch likes
      const { data: likesData } = await supabase
        .from('tip_likes')
        .select('*')
        .eq('tip_id', tip.id);
      
      if (likesData) {
        setLikes(likesData);
      }

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('tip_comments')
        .select('*, profiles(name, avatar_url)')
        .eq('tip_id', tip.id);
      
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

    fetchLikesAndComments();

    // Set up real-time subscription for comments
    const commentsSubscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tip_comments',
        filter: `tip_id=eq.${tip.id}`
      }, async (payload) => {
        // Refresh comments when there's a change
        const { data: newComments } = await supabase
          .from('tip_comments')
          .select('*, profiles(name, avatar_url)')
          .eq('tip_id', tip.id);
        
        if (newComments) {
          setComments(newComments);
        }
      })
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [tip, isOpen]);

  if (!tip) return null;

  const isLiked = user ? likes.some(like => 
    like.tip_id === tip.id && like.author_id === user.id
  ) : false;
  
  const likeCount = likes.filter(like => like.tip_id === tip.id).length;
  const commentCount = comments.filter(comment => comment.tip_id === tip.id).length;

  // Extract first name from reader_name
  const firstName = tip.reader_name ? tip.reader_name.split(' ')[0] : "Anonymous";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tip Details</DialogTitle>
          <DialogDescription>
            View details about this tip
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={tip.reader_avatar_url || "/reader-avatar.svg"} alt={firstName} />
              <AvatarFallback>
                {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className="font-medium">{tip.reader_name || "Anonymous Reader"}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">${tip.amount}</span>
            </div>
            
            {tip.book_title && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Book:</span>
                <span className="font-medium italic">{tip.book_title}</span>
              </div>
            )}
            
            {tip.message && (
              <div className="mt-4">
                <p className="text-muted-foreground mb-1">Message:</p>
                <div className="bg-muted p-3 rounded-md">
                  <p>{tip.message}</p>
                </div>
              </div>
            )}
          </div>
          
          {user && (
            <div className="pt-2">
              <TipInteractionButtons
                tipId={tip.id}
                authorId={user.id}
                authorName={user.user_metadata?.name || user.email || ""}
                isLiked={isLiked}
                likeCount={likeCount}
                commentCount={commentCount}
                readerEmail={readerEmail}
                bookTitle={tip.book_title}
                tipMessage={tip.message}
                tipAmount={tip.amount}
              />
            </div>
          )}

          {/* Display comments */}
          {comments.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium">Comments ({commentCount})</h3>
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {comment.profiles?.name || "Author"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
