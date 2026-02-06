
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface PageViewStatsProps {
  totalBookViews: number;
  totalProfileViews: number;
  last30DaysViews: number;
}

export const PageViewStats = ({ totalBookViews, totalProfileViews, last30DaysViews }: PageViewStatsProps) => {
  const totalViews = totalBookViews + totalProfileViews;

  return (
    <Card className="overflow-hidden bg-[#19363C]">
      <CardContent className="p-6 text-white">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">Page Views</h2>

          <div className="flex justify-center gap-8 w-full">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-[#FFD166]">{totalViews}</div>
              <div className="text-sm text-white/80 mt-1">Total views</div>
            </div>
            <div className="flex items-center">
              <div className="bg-transparent rounded-full p-4">
                <Eye className="h-12 w-12 text-[#FFD166]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-[#FFD166]">{totalBookViews}</div>
              <div className="text-xs text-white/80">Book pages</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[#FFD166]">{totalProfileViews}</div>
              <div className="text-xs text-white/80">Profile views</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[#FFD166]">{last30DaysViews}</div>
              <div className="text-xs text-white/80">Last 30 days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
