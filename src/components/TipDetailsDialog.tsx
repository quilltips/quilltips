
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { TipCommentForm } from "./tips/TipCommentForm";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "./ui/separator";
import { TipInteractionButtons } from "./tips/TipInteractionButtons";
import { useAuth } from "./auth/AuthProvider";

interface TipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tip: {
    id: string;
    amount: number;
    message: string | null;
    created_at: string;
    book_title: string | null;
    author_id: string;
    reader_name?: string;
    reader_avatar_url?: string;
  } | null;
}

export const TipDetailsDialog = ({ isOpen, onClose, tip }: TipDetailsDialogProps) => {
  const { user } = useAuth();
  
  // Fetch tip comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['tip_comments', tip?.id],
    queryFn: async () => {
      if (!tip?.id) return [];
      const { data, error } = await supabase
        .from('tip_comments')
        .select('*, profiles(name, avatar_url)')
        .eq('tip_id', tip.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tip?.id,
  });

  // Fetch likes for this tip
  const { data: likes = [] } = useQuery({
    queryKey: ['tip_likes', tip?.id],
    queryFn: async () => {
      if (!tip?.id) return [];
      const { data, error } = await supabase
        .from('tip_likes')
        .select('*')
        .eq('tip_id', tip.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tip?.id,
  });

  // Check if the current user has liked this tip
  const isLiked = user ? likes.some(like => like.author_id === user.id) : false;
  const likeCount = likes.length;
  const commentCount = comments.length;

  if (!tip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tip Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={tip.reader_avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{tip.reader_name || 'Anonymous Reader'}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <Card className="p-4 space-y-4">
            <div className="text-lg font-semibold">
              {(tip.reader_name?.split(' ')[0] || 'Anonymous')} sent a tip
              {tip.book_title ? ` for "${tip.book_title}"!` : "!"}
            </div>
            
            {tip.message && (
              <p className="text-muted-foreground">"{tip.message}"</p>
            )}
            
            <div className="pt-2">
              <TipInteractionButtons
                tipId={tip.id}
                authorId={user?.id || tip.author_id}
                isLiked={isLiked}
                likeCount={likeCount}
                commentCount={commentCount}
              />
            </div>
          </Card>
          
          {comments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
              
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(comment.profiles as any)?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {((comment.profiles as any)?.name || "A").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="font-medium">{(comment.profiles as any)?.name || "Anonymous"}</div>
                        <p>{comment.content}</p>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {user && (
            <>
              <Separator />
              <TipCommentForm 
                tipId={tip.id} 
                authorId={user.id} 
                onCommentAdded={() => refetchComments()}
              />
            </>
          )}
          
          {!user && comments.length === 0 && (
            <p className="text-center text-muted-foreground text-sm">
              Sign in to leave a comment
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
