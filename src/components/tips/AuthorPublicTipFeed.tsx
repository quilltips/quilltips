
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useState } from "react";
import { TipDetailsDialog } from "../TipDetailsDialog";
import { useAuth } from "../auth/AuthProvider";
import { PublicTipCommentButton } from "./PublicTipCommentButton";
import { TipReaderAvatar } from "./TipReaderAvatar";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

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
  const [selectedTip, setSelectedTip] = useState<(PublicTip & { author_id: string; book_title: string }) | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data: tips, isLoading } = useQuery({
    queryKey: ['author-public-tips', authorId],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (tipsError) throw tipsError;

      return (tipsData || []).map(tip => ({
        ...tip,
        book_title: tip.qr_code_id ? qrCodeTitleMap[tip.qr_code_id] : null
      })) as PublicTip[];
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['public-tip-comments', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tip_comments')
        .select('*, profiles(name, avatar_url)');

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
        <p className="text-muted-foreground">No tips yet.</p>
      </div>
    );
  }

  const displayedTips = showAll ? tips : tips.slice(0, limit);

  return (
    <div className="space-y-5">
      {displayedTips.map((tip) => {
        const readerFirstName = tip.reader_name
          ? tip.reader_name.split(' ')[0]
          : "Someone";

        const commentCount = comments.filter(comment => comment.tip_id === tip.id).length;

        return (
          <div key={tip.id} className="space-y-1">
            <div className="flex items-start gap-3 pb-1">
              <TipReaderAvatar readerName={tip.reader_name} />
              <div className="flex-1 space-y-1">
                <div>
                  <p className="font-medium text-sm leading-snug">
                    {readerFirstName} sent a tip for
                    {tip.book_title ? ` "${tip.book_title}"` : " a book"}
                  </p>
                  {tip.message && (
                    <p className="text-sm leading-tight">"{tip.message}"</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <PublicTipCommentButton
                    commentCount={commentCount}
                    onClick={() =>
                      setSelectedTip({
                        ...tip,
                        author_id: authorId,
                        book_title: tip.book_title || "Unknown book",
                      })
                    }
                  />
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-3"></div>
          </div>
        );
      })}

      {tips.length > limit && (
        <Button 
          variant="ghost" 
          onClick={() => setShowAll(!showAll)} 
          className="w-full text-[#718096] hover:text-[#2D3748] hover:bg-gray-100"
        >
          <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show Less' : `Show ${tips.length - limit} More`}
        </Button>
      )}

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
