
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TipTable } from "./TipTable";
import { TipDetailsDialog } from "../TipDetailsDialog";
import { Card } from "../ui/card";
import { TipDownloadButton } from "./TipDownloadButton";

interface TipHistoryContainerProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
  isDashboard?: boolean;
  authorName?: string;
  showHeader?: boolean;
}

export const TipHistoryContainer = ({
  authorId,
  qrCodeId,
  limit,
  isDashboard,
  authorName,
  showHeader = true
}: TipHistoryContainerProps) => {
  const [selectedTip, setSelectedTip] = useState<any | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const {
    data: tips,
    isLoading
  } = useQuery({
    queryKey: ['tips', authorId, qrCodeId, limit],
    queryFn: async () => {
      let query = supabase.from('tips').select('*, profiles!tips_author_id_fkey(name, avatar_url)').eq('author_id', authorId).order('created_at', {
        ascending: false
      });
      if (qrCodeId) {
        query = query.eq('qr_code_id', qrCodeId);
      }
      if (limit) {
        query = query.limit(limit);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;

      // Map the nested profile data to the tip object
      return data.map(tip => ({
        ...tip,
        reader_name: tip.profiles?.name || "Anonymous Reader",
        reader_avatar_url: tip.profiles?.avatar_url
      }));
    }
  });
  
  const {
    data: likes
  } = useQuery({
    queryKey: ['tip_likes', authorId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('tip_likes').select('*').eq('author_id', authorId);
      if (error) throw error;
      return data || [];
    }
  });
  
  const {
    data: comments
  } = useQuery({
    queryKey: ['tip_comments', authorId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('tip_comments').select('*').eq('author_id', authorId);
      if (error) throw error;
      return data || [];
    }
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const title = isDashboard 
    ? qrCodeId 
      ? "QR Code Tips" 
      : "Recent Tips" 
    : `${authorName}'s Activity`;
  
  return (
    <Card className="p-6 px-[25px] rounded-sm">
      {showHeader && !limit && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            {isDashboard && (
              <TipDownloadButton 
                tips={tips || []} 
                likes={likes || []} 
                comments={comments || []} 
                qrCodeId={qrCodeId} 
              />
            )}
          </div>
        </div>
      )}

      <TipTable 
        tips={tips || []} 
        authorId={authorId} 
        likes={likes || []} 
        comments={comments || []} 
        showAll={showAll} 
        setShowAll={setShowAll} 
        onSelectTip={setSelectedTip} 
        limit={limit} 
      />

      <TipDetailsDialog 
        isOpen={!!selectedTip} 
        onClose={() => setSelectedTip(null)} 
        tip={selectedTip} 
      />
    </Card>
  );
};
