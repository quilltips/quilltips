import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TipDetailsDialog } from "./TipDetailsDialog";
import { TipTable } from "./tips/TipTable";
import { TipDownloadButton } from "./tips/TipDownloadButton";

interface TipHistoryProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
  isDashboard?: boolean;
  authorName?: string;
}

export const TipHistory = ({ 
  authorId, 
  qrCodeId, 
  limit, 
  isDashboard, 
  authorName 
}: TipHistoryProps) => {
  const [selectedTip, setSelectedTip] = useState<any | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data: tips, isLoading } = useQuery({
    queryKey: ['tips', authorId, qrCodeId, limit],
    queryFn: async () => {
      let query = supabase
        .from('tips')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

      if (qrCodeId) {
        query = query.eq('qr_code_id', qrCodeId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: likes } = useQuery({
    queryKey: ['tip_likes', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tip_likes')
        .select('*')
        .eq('author_id', authorId);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: comments } = useQuery({
    queryKey: ['tip_comments', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tip_comments')
        .select('*')
        .eq('author_id', authorId);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      {!limit && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {isDashboard 
                ? (qrCodeId ? "QR Code Tips" : "Recent Tips")
                : `${authorName}'s Activity`}
            </h2>
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