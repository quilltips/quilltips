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

interface TipHistoryProps {
  authorId: string;
}

interface Tip {
  id: string;
  amount: number;
  message: string;
  created_at: string;
  book_title: string;
  author_id: string;
}

export const TipHistory = ({ authorId }: TipHistoryProps) => {
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  const { data: tips, isLoading } = useQuery({
    queryKey: ['tips', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

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
    return <div>Loading tips...</div>;
  }

  const isLiked = (tipId: string) => {
    return likes?.some(like => like.tip_id === tipId);
  };

  return (
    <Card className="p-6">
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