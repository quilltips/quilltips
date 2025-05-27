
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface TipStatsProps {
  totalAmount: number;
  averageTip: number;
  totalTips: number;
}

export const TipStats = ({ totalAmount, averageTip, totalTips }: TipStatsProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6 bg-[#19363C] text-white min-h-[200px] flex flex-col">
        <div className="flex-1 space-y-6">
          <h2 className="text-xl md:text-2xl font-playfair text-center">Tips received</h2>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#FFD166]">
                {totalTips}
              </div>
              <div className="text-xs md:text-sm font-normal text-white mt-1">Total Tips</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#FFD166]">
                ${totalAmount.toFixed(2)}
              </div>
              <div className="text-xs md:text-sm font-normal text-white mt-1">Total Amount</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-[#FFD166]">
              ${averageTip.toFixed(2)}
            </div>
            <div className="text-xs md:text-sm font-normal text-white mt-1">Average Tip</div>
          </div>
          
          <p className="text-xs md:text-sm text-white/80 text-center leading-relaxed">
            Total tips and earnings from your readers
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
