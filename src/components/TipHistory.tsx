import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TipLikeButton } from "./TipLikeButton";
import { TipCommentButton } from "./TipCommentButton";
import { useState } from "react";
import { TipDetailsDialog } from "./TipDetailsDialog";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TipHistoryProps {
  authorId: string;
  qrCodeId?: string;
  limit?: number;
}

interface Tip {
  id: string;
  amount: number;
  message: string;
  created_at: string;
  book_title: string;
  author_id: string;
}

export const TipHistory = ({ authorId, qrCodeId, limit }: TipHistoryProps) => {
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const { toast } = useToast();

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

  const handleDownloadAll = async () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Date', 'Book', 'Amount', 'Message', 'Likes', 'Comments'].join(','),
        ...(tips || []).map(tip => [
          new Date(tip.created_at).toLocaleDateString(),
          `"${(tip.book_title || 'N/A').replace(/"/g, '""')}"`,
          tip.amount,
          `"${(tip.message || '').replace(/"/g, '""')}"`,
          likes?.filter(like => like.tip_id === tip.id).length || 0,
          comments?.filter(comment => comment.tip_id === tip.id).length || 0
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tips_${qrCodeId ? `qr_${qrCodeId}_` : ''}${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your tip data is being downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isLiked = (tipId: string) => {
    return likes?.some(like => like.tip_id === tipId);
  };

  return (
    <Card className="p-6">
      {!limit && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {qrCodeId ? "QR Code Tips" : "Tip History"}
          </h2>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownloadAll}
          >
            <Download className="h-4 w-4" />
            Download {qrCodeId ? "QR Code" : "All"} Tips
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Book</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tips?.map((tip) => (
            <TableRow 
              key={tip.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedTip(tip)}
            >
              <TableCell>
                {new Date(tip.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{tip.book_title || "N/A"}</TableCell>
              <TableCell>${tip.amount}</TableCell>
              <TableCell>{tip.message || "No message"}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4">
                  <TipLikeButton
                    tipId={tip.id}
                    authorId={authorId}
                    isLiked={isLiked(tip.id)}
                    likeCount={likes?.filter(like => like.tip_id === tip.id).length || 0}
                  />
                  <TipCommentButton
                    tipId={tip.id}
                    authorId={authorId}
                    commentCount={comments?.filter(comment => comment.tip_id === tip.id).length || 0}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!tips?.length && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No tips received yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TipDetailsDialog
        isOpen={!!selectedTip}
        onClose={() => setSelectedTip(null)}
        tip={selectedTip}
      />
    </Card>
  );
};