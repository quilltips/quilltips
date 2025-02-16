
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface AuthorQRCodeStatsProps {
  authorId: string;
}

export const AuthorQRCodeStats = ({ authorId }: AuthorQRCodeStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['qr-code-stats', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('total_tips, total_amount, last_tip_date')
        .eq('author_id', authorId);

      if (error) throw error;

      return data.reduce((acc, qr) => ({
        totalTips: acc.totalTips + (qr.total_tips || 0),
        totalAmount: acc.totalAmount + (qr.total_amount || 0),
        lastTipDate: qr.last_tip_date ? 
          (acc.lastTipDate ? 
            (new Date(qr.last_tip_date) > new Date(acc.lastTipDate) ? qr.last_tip_date : acc.lastTipDate)
            : qr.last_tip_date)
          : acc.lastTipDate
      }), {
        totalTips: 0,
        totalAmount: 0,
        lastTipDate: null as string | null
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">Total Tips</div>
        <div className="text-2xl font-bold">
          {stats?.totalTips || 0}
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">Total Value</div>
        <div className="text-2xl font-bold">
          ${stats?.totalAmount.toFixed(2) || '0.00'}
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">Last Tip Received</div>
        <div className="text-2xl font-bold">
          {stats?.lastTipDate ? format(new Date(stats.lastTipDate), 'MMM d, yyyy') : 'No tips yet'}
        </div>
      </div>
    </div>
  );
};
