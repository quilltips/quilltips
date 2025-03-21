
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTipHistory = (authorId: string, qrCodeId?: string, limit?: number) => {
  const { data: tips, isLoading } = useQuery({
    queryKey: ['tips', authorId, qrCodeId, limit],
    queryFn: async () => {
      let query = supabase
        .from('tips')
        .select('*, profiles!tips_author_id_fkey(name, avatar_url)')
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

      // Map the nested profile data to the tip object
      return data.map(tip => ({
        ...tip,
        reader_name: tip.profiles?.name || "Anonymous Reader",
        reader_avatar_url: tip.profiles?.avatar_url
      }));
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

  return {
    tips: tips || [],
    likes: likes || [],
    comments: comments || [],
    isLoading
  };
};
