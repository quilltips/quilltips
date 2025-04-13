
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTipHistory = (authorId: string, qrCodeId?: string, limit?: number) => {
  const { data: tips, isLoading: tipsLoading } = useQuery({
    queryKey: ['tip-history', authorId, qrCodeId, limit],
    queryFn: async () => {
      let query = supabase
        .from('tips')
        .select(`
          *,
          qr_code:qr_code_id(book_title)
        `)
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

  const { data: likes, isLoading: likesLoading } = useQuery({
    queryKey: ['tip-likes', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tip_likes')
        .select('*')
        .eq('author_id', authorId);
        
      if (error) throw error;
      return data || [];
    }
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['tip-comments', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tip_comments')
        .select('*')
        .eq('author_id', authorId);
        
      if (error) throw error;
      return data || [];
    }
  });

  return {
    tips,
    likes,
    comments,
    isLoading: tipsLoading || likesLoading || commentsLoading
  };
};
