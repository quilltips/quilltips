
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { TipDetailsDialog } from "../TipDetailsDialog";
import { useAuth } from "../auth/AuthProvider";
import { LoadingSpinner } from "../ui/loading-spinner";
import { PublicTipCommentButton } from "./PublicTipCommentButton";
import { TipReaderAvatar } from "./TipReaderAvatar";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

interface PublicTipHistoryProps {
  qrCodeId: string;
}

interface PublicTip {
  id: string;
  created_at: string;
  message: string | null;
  amount: number;
  reader_name: string | null;
  reader_avatar_url: string | null;
  book_title?: string | null;
}

export const PublicTipHistory = ({ qrCodeId }: PublicTipHistoryProps) => {
  const { user } = useAuth();
  const [selectedTip, setSelectedTip] = useState<(PublicTip & { author_id: string; book_title: string }) | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const { data: book } = useQuery({
    queryKey: ['qr-book-title', qrCodeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('book_title, author_id')
        .eq('id', qrCodeId)
        .single();
        
      if (error) throw error;
      return data;
    }
  });
  
  const { data: tips, isLoading } = useQuery({
    queryKey: ['public-tips', qrCodeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_tips')
        .select(`
          id,
          created_at,
          message,
          amount,
          reader_name,
          reader_avatar_url
        `)
        .eq('qr_code_id', qrCodeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(tip => ({
        ...tip,
        book_title: book?.book_title
      })) as PublicTip[];
    },
    enabled: !!book
  });
  
  const { data: allComments = [] } = useQuery({
    queryKey: ['all-public-tip-comments'],
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
        <p className="text-muted-foreground">
          No fanmail yet. Be the first to send a message!
        </p>
      </div>
    );
  }

  const displayedTips = showAll ? tips : tips.slice(0, 5);

  return (
    <div className="space-y-6">
      {displayedTips.map((tip) => {
        const readerFirstName = tip.reader_name 
          ? tip.reader_name.split(' ')[0] 
          : "Someone";
        
        const commentCount = allComments.filter(comment => comment.tip_id === tip.id).length;
        
        return (
          <div key={tip.id} className="space-y-4">
            <div className="flex items-start gap-3">
              <TipReaderAvatar readerName={tip.reader_name} />
              <div className="flex-1">
                <div className="space-y-1">
                  <p className="font-medium">
                    {readerFirstName} sent fanmail!
                  </p>
                  {tip.message && (
                    <p className="">"{tip.message}"</p>
                  )}
                  <p className="text-sm ">
                    {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                  </p>
                </div>
                
                <div className="mt-2">
                  <PublicTipCommentButton 
                    commentCount={commentCount}
                    onClick={() => setSelectedTip({
                      ...tip,
                      author_id: book?.author_id || '',
                      book_title: tip.book_title || "Unknown book"
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-border mt-2 pt-2"></div>
          </div>
        );
      })}
      
      {tips.length > 5 && (
        <Button 
          variant="ghost" 
          onClick={() => setShowAll(!showAll)} 
          className="w-full text-[#718096] hover:text-[#2D3748] hover:bg-gray-100"
        >
          <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show Less' : `Show ${tips.length - 5} More`}
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
