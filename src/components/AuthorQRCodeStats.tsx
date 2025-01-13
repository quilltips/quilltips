import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
        .select('total_tips, total_amount, average_tip, last_tip_date')
        .eq('author_id', authorId);

      if (error) throw error;

      // Calculate totals across all QR codes
      return data.reduce((acc, qr) => ({
        totalTips: acc.totalTips + (qr.total_tips || 0),
        totalAmount: acc.totalAmount + (qr.total_amount || 0),
        averageTip: acc.totalTips > 0 ? acc.totalAmount / acc.totalTips : 0,
        lastTipDate: qr.last_tip_date ? 
          (acc.lastTipDate ? 
            (new Date(qr.last_tip_date) > new Date(acc.lastTipDate) ? qr.last_tip_date : acc.lastTipDate)
            : qr.last_tip_date)
          : acc.lastTipDate
      }), {
        totalTips: 0,
        totalAmount: 0,
        averageTip: 0,
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalTips || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats?.totalAmount.toFixed(2) || '0.00'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats?.averageTip.toFixed(2) || '0.00'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Last Tip Received</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.lastTipDate ? format(new Date(stats.lastTipDate), 'MMM d, yyyy') : 'No tips yet'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};