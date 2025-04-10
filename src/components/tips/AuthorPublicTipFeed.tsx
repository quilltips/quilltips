
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LoadingSpinner } from "../ui/loading-spinner";
import { TipInteractionButtons } from "./TipInteractionButtons";
import { useState } from "react";
import { TipDetailsDialog } from "../TipDetailsDialog";
import { useAuth } from "../auth/AuthProvider";

interface AuthorPublicTipFeedProps {
  authorId: string;
  limit?: number;
}

interface PublicTip {
  id: string;
  created_at: string;
  message: string | null;
  reader_name: string | null;
  reader_avatar_url: string | null;
  qr_code_id: string | null;
  amount: number;
  book_title?: string | null;
}

export const AuthorPublicTipFeed = ({ authorId, limit = 5 }: AuthorPublicTipFeedProps) => {
  const { user } = useAuth();
  const [selectedTip, setSelectedTip] = useState<PublicTip | null>(null);
  
  const { data: tips, isLoading } = useQuery({
    queryKey: ['author-public-tips', authorId],
    queryFn: async () => {
      // First, get all QR codes for this author
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, book_title')
        .eq('author_id', authorId);
      
      if (qrError) throw qrError;
      if (!qrCodes || qrCodes.length === 0) return [];
      
      const qrCodeIds = qrCodes.map(qr => qr.id);
      const qrCodeTitleMap = qrCodes.reduce((acc, qr) => {
        acc[qr.id] = qr.book_title;
        return acc;
      }, {} as Record<string, string>);
      
      // Then get all public tips for these QR codes
      const { data: tipsData, error: tipsError } = await supabase
        .from('public_tips')
        .select(`
          id,
          created_at,
          message,
          reader_name,
          reader_avatar_url,
          qr_code_id,
          amount
        `)
        .in('qr_code_id', qrCodeIds)
        .order('created_at', { ascending: false })
        .limit(limit || 5);

      if (tipsError) throw tipsError;
      
      // Add book titles to tips
      return (tipsData || []).map(tip => ({
        ...tip,
        book_title: tip.qr_code_id ? qrCodeTitleMap[tip.qr_code_id] : null
      })) as PublicTip[];
    }
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['public-tip-likes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tip_likes')
        .select('*');
        
      if (error) throw error;
      return data || [];
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['public-tip-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tip_comments')
        .select('*');
        
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tips?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No tips yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tips.map((tip) => {
        // Extract first name from reader_name for privacy
        const readerFirstName = tip.reader_name 
          ? tip.reader_name.split(' ')[0] 
          : "Someone";
        
        // Find like and comment counts
        const likeCount = likes.filter(like => like.tip_id === tip.id).length;
        const commentCount = comments.filter(comment => comment.tip_id === tip.id).length;
        
        // Check if current user has liked this tip
        const isLiked = user ? likes.some(like => 
          like.tip_id === tip.id && like.author_id === user.id
        ) : false;
        
        return (
          <div key={tip.id} className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tip.reader_avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="space-y-1">
                  <p className="font-medium">
                    {readerFirstName} sent a tip
                    {tip.book_title ? ` for "${tip.book_title}"!` : "!"}
                  </p>
                  {tip.message && (
                    <p className="text-muted-foreground">"{tip.message}"</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="mt-2">
                  <TipInteractionButtons 
                    tipId={tip.id}
                    authorId={user?.id || authorId}
                    isLiked={isLiked}
                    likeCount={likeCount}
                    commentCount={commentCount}
                    onCommentClick={() => setSelectedTip(tip)}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-border mt-2 pt-2"></div>
          </div>
        );
      })}
      
      {selectedTip && (
        <TipDetailsDialog 
          isOpen={!!selectedTip}
          onClose={() => setSelectedTip(null)}
          tip={selectedTip}
        />
      )}
    </div>
  );
};
