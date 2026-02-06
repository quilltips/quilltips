import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivityCardProps {
  authorId: string;
}

export const ActivityCard = ({ authorId }: ActivityCardProps) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-activity', authorId],
    queryFn: async () => {
      // Fetch all data in parallel
      const [
        qrResult,
        tipsResult,
        pageViewsResult,
        arcResult,
        betaResult,
        newsletterResult,
      ] = await Promise.all([
        supabase.from('qr_codes').select('id').eq('author_id', authorId),
        supabase.from('tips').select('id, message').eq('author_id', authorId),
        supabase.from('page_views').select('id').eq('author_id', authorId),
        supabase.from('arc_signups').select('id').eq('author_id', authorId),
        supabase.from('beta_reader_signups').select('id').eq('author_id', authorId),
        supabase.from('author_newsletter_signups').select('id').eq('author_id', authorId),
      ]);

      const totalBooks = qrResult.data?.length || 0;
      const tips = tipsResult.data || [];
      const totalTips = tips.length;
      const totalMessages = tips.filter(t => t.message && t.message.trim().length > 0).length;
      const totalViews = pageViewsResult.data?.length || 0;
      const totalSignups = (arcResult.data?.length || 0) + (betaResult.data?.length || 0) + (newsletterResult.data?.length || 0);

      return { totalBooks, totalViews, totalMessages, totalSignups, totalTips };
    }
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 flex justify-center items-center bg-[#19363C]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('/author/data')}
    >
      <CardContent className="p-6 bg-[#19363C] text-white shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-playfair">Activity</h2>
          <ChevronRight className="h-5 w-5 text-white/60" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          <div className="space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#FFD166]">
              {data?.totalBooks || 0}
            </div>
            <div className="text-xs text-white/80">Books</div>
          </div>

          <div className="space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#FFD166]">
              {data?.totalViews || 0}
            </div>
            <div className="text-xs text-white/80">Views</div>
          </div>

          <div className="space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#FFD166]">
              {data?.totalMessages || 0}
            </div>
            <div className="text-xs text-white/80">Messages</div>
          </div>

          <div className="space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#FFD166]">
              {data?.totalSignups || 0}
            </div>
            <div className="text-xs text-white/80">Signups</div>
          </div>

          <div className="space-y-1 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[#FFD166]">
              {data?.totalTips || 0}
            </div>
            <div className="text-xs text-white/80">Tips</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
