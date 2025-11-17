
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Loader2, DollarSign, Calendar } from "lucide-react";

interface TipStatsCardProps {
  authorId: string;
}

export const TipStatsCard = ({ authorId }: TipStatsCardProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['author-tip-stats', authorId],
    queryFn: async () => {
      // Fetch tips data for statistics
      const { data: tips, error } = await supabase
        .from('tips')
        .select('amount, created_at')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Calculate statistics
      const totalTips = tips.length;
      const totalAmount = tips.reduce((sum, tip) => sum + (tip.amount || 0), 0);
      const averageTip = totalTips > 0 ? totalAmount / totalTips : 0;
      const lastTipDate = tips.length > 0 ? tips[0].created_at : null;
      
      return {
        totalTips,
        totalAmount,
        averageTip,
        lastTipDate
      };
    }
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden h-full">
        <CardContent className="p-6 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin " />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-6 bg-[#19363C] text-white h-full">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">Activity</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#FFD166]">
                ${data?.totalAmount.toFixed(0) || '0'}
              </div>
              <div className="text-xs text-white/80">
                Tips received
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#FFD166]">
                ${data?.averageTip.toFixed(0) || '0'}
              </div>
              <div className="text-xs text-white/80">
                Average tip
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#FFD166]">
                {data?.lastTipDate ? (
                  formatDistanceToNow(new Date(data.lastTipDate), { addSuffix: true })
                ) : (
                  'No tips yet'
                )}
              </div>
              <div className="text-xs text-white/80">
                Last tip
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
