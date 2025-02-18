
import { LoadingSpinner } from "../ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuthorStatsProps {
  authorId: string;
}

export const AuthorStats = ({ authorId }: AuthorStatsProps) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['author-stats', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('total_tips, total_amount')
        .eq('author_id', authorId);

      if (error) throw error;
      
      return data.reduce((acc, qr) => ({
        totalTips: acc.totalTips + (qr.total_tips || 0),
        totalAmount: acc.totalAmount + (qr.total_amount || 0)
      }), { totalTips: 0, totalAmount: 0 });
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Failed to load stats</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">Total Tips</div>
        <div className="text-2xl font-bold">{stats?.totalTips || 0}</div>
      </div>
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">Total Value</div>
        <div className="text-2xl font-bold">${stats?.totalAmount.toFixed(2) || '0.00'}</div>
      </div>
    </div>
  );
};
