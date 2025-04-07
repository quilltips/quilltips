
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

interface PublicTipHistoryProps {
  qrCodeId: string;
}

// Define a type for the public tip data
interface PublicTip {
  id: string;
  created_at: string;
  message: string | null;
  amount: number;
  reader_name: string | null;
  reader_avatar_url: string | null;
  is_private: boolean;
}

export const PublicTipHistory = ({ qrCodeId }: PublicTipHistoryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: tips, isLoading } = useQuery({
    queryKey: ['public-tips', qrCodeId],
    queryFn: async () => {
      // Cast the response type to handle the type issue with the new table
      const { data, error } = await supabase
        .from('public_tips')
        .select(`
          id,
          created_at,
          message,
          amount,
          reader_name,
          reader_avatar_url,
          is_private
        `)
        .eq('qr_code_id', qrCodeId)
        .eq('is_private', false) // Only show non-private tips
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PublicTip[];
    }
  });

  const { data: likes, refetch: refetchLikes } = useQuery({
    queryKey: ['public-tip-likes', qrCodeId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('tip_likes')
          .select('*')
          .in('tip_id', tips?.map(tip => tip.id) || []);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching likes:', error);
        return [];
      }
    },
    enabled: !!tips?.length,
    initialData: []
  });

  const handleLike = async (tipId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to like tips",
        variant: "destructive"
      });
      return;
    }

    try {
      const isLiked = likes?.some(like => like.tip_id === tipId && like.author_id === user.id);

      if (isLiked) {
        // Unlike
        await supabase
          .from('tip_likes')
          .delete()
          .eq('tip_id', tipId)
          .eq('author_id', user.id);
      } else {
        // Like
        await supabase
          .from('tip_likes')
          .insert({
            tip_id: tipId,
            author_id: user.id
          });
      }
      refetchLikes();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to process your action",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin w-6 h-6 border-2 border-primary rounded-full border-t-transparent" />
      </div>
    );
  }

  if (!tips?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No tips yet. Be the first to leave a tip!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tips.map((tip) => {
        const tipLikes = likes?.filter(like => like.tip_id === tip.id) || [];
        const isLiked = user ? tipLikes.some(like => like.author_id === user.id) : false;
        
        return (
          <div key={tip.id} className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={tip.reader_avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {(tip.reader_name || "Anonymous").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium">
                      {tip.reader_name || "Anonymous Reader"} sent a tip
                    </p>
                  </div>
                  {tip.message && (
                    <p className="text-muted-foreground">"{tip.message}"</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(tip.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-4 mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 h-8 px-2"
                    onClick={() => handleLike(tip.id)}
                  >
                    <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                    <span className="text-xs">{tipLikes.length || ''}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 h-8 px-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="border-t border-border mt-2 pt-2"></div>
          </div>
        )
      })}
    </div>
  );
};
