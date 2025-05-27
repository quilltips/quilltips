
import { Card, CardContent } from "@/components/ui/card";

interface TipStatsProps {
  totalAmount: number;
  averageTip: number;
  totalTips: number;
}

export const TipStats = ({ totalAmount, averageTip, totalTips }: TipStatsProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 bg-[#19363C] text-white">
        <div className="space-y-6 md:min-h-[165px]">
          <h2 className="text-2xl font-playfair">Tips</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#FFD166]">
                ${totalAmount.toFixed(0)}
              </div>
              <div className="text-xs text-white/80">
                Dollars received
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#FFD166]">
                ${averageTip.toFixed(0)}
              </div>
              <div className="text-xs text-white/80">
                Average tip
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#FFD166]">
                {totalTips}
              </div>
              <div className="text-xs text-white/80">
                Tips
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
