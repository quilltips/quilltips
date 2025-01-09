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
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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
    try {
      // First, check if the user has already liked this tip
      const { data: existingLike, error: checkError } = await supabase
        .from('tip_likes')
        .select('*')
        .eq('tip_id', tipId)
        .eq('author_id', authorId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking like:", checkError);
        return;
      }

      if (existingLike) {
        // Unlike: Remove the existing like
        const { error: deleteError } = await supabase
          .from('tip_likes')
          .delete()
          .eq('tip_id', tipId)
          .eq('author_id', authorId);

        if (deleteError) {
          console.error("Error unliking tip:", deleteError);
          return;
        }
      } else {
        // Like: Add new like
        const { error: insertError } = await supabase
          .from('tip_likes')
          .insert({ tip_id: tipId, author_id: authorId });

        if (insertError) {
          console.error("Error liking tip:", insertError);
          return;
        }
      }

      // Invalidate and refetch the likes query to update the UI
      queryClient.invalidateQueries({ queryKey: ['tip_likes', authorId] });
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleComment = async (tipId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('tip_comments')
        .insert({ tip_id: tipId, author_id: authorId, content });

      if (error) {
        console.error("Error commenting on tip:", error);
        return;
      }

      // Invalidate and refetch the comments query to update the UI
      queryClient.invalidateQueries({ queryKey: ['tip_comments', authorId] });
    } catch (error) {
      console.error("Error handling comment:", error);
    }
  };

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
                    variant={isLiked(tip.id) ? "default" : "ghost"}
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