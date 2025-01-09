import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TipHistoryProps {
  authorId: string;
}

interface Tip {
  id: string;
  amount: number;
  message: string;
  created_at: string;
  book_title: string;
}

interface TipLike {
  tip_id: string;
  author_id: string;
}

interface TipComment {
  tip_id: string;
  content: string;
}

export const TipHistory = ({ authorId }: TipHistoryProps) => {
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

  const handleLike = async (tipId: string) => {
    const { error } = await supabase
      .from('tip_likes')
      .insert({ tip_id: tipId, author_id: authorId });

    if (error) {
      console.error("Error liking tip:", error);
    }
  };

  const handleComment = async (tipId: string, content: string) => {
    const { error } = await supabase
      .from('tip_comments')
      .insert({ tip_id: tipId, author_id: authorId, content });

    if (error) {
      console.error("Error commenting on tip:", error);
    }
  };

  if (isLoading) {
    return <div>Loading tips...</div>;
  }

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
            <TableRow key={tip.id}>
              <TableCell>
                {new Date(tip.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{tip.book_title || "N/A"}</TableCell>
              <TableCell>${tip.amount}</TableCell>
              <TableCell>{tip.message || "No message"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(tip.id)}
                    className="flex items-center gap-1"
                  >
                    <Heart className="h-4 w-4" />
                    <span>
                      {likes?.filter(like => like.tip_id === tip.id).length || 0}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const content = prompt("Enter your comment:");
                      if (content) handleComment(tip.id, content);
                    }}
                    className="flex items-center gap-1"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {comments?.filter(comment => comment.tip_id === tip.id).length || 0}
                    </span>
                  </Button>
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
    </Card>
  );
};