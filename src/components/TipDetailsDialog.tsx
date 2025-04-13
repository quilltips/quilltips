
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { TipCommentForm } from "./tips/TipCommentForm";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "./ui/separator";
import { MessageCircle } from "lucide-react";
import { useAuth } from "./auth/AuthProvider";
import { Button } from "./ui/button";

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
    reader_name?: string | null;
    reader_avatar_url?: string | null;
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

  if (!tip) return null;

  const commentCount = comments.length;
  const readerFirstName = tip.reader_name?.split(' ')[0] || 'Anonymous';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tip Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={tip.reader_avatar_url || "/reader-avatar.svg"} alt={readerFirstName} />
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
              {readerFirstName} sent a tip
              {tip.book_title ? ` for "${tip.book_title}"!` : "!"}
            </div>
            
            {tip.message && (
              <p className="text-muted-foreground">"{tip.message}"</p>
            )}
            
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4 fill-[#19363C]/10 stroke-[#19363C]" />
                <span>{commentCount}</span>
              </Button>
            </div>
          </Card>
          
          {comments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
              
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(comment.profiles as any)?.avatar_url || "/reader-avatar.svg"} alt={(comment.profiles as any)?.name || "Anonymous"} />
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
