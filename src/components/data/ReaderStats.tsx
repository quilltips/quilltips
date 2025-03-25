
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface ReaderLocation {
  name: string;
  value: number;
  percentage: number;
}

interface ReaderStatsProps {
  readerLocations: ReaderLocation[];
}

export const ReaderStats = ({ readerLocations }: ReaderStatsProps) => {
  const COLORS = ['#FFD166', '#FFA94D', '#FF719A', '#5271FF', '#64F4AC'];
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 bg-[#19363C] text-white">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">Your readers</h2>
          
          {readerLocations.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={readerLocations}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={70}
                      fill="#8884d8"
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {readerLocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2 mt-4 md:mt-0">
                {readerLocations.map((location, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <div>{location.name}</div>
                    <div>{location.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/70 py-8">
              No reader location data available yet
            </div>
          )}
          
          <div className="text-center text-sm">
            <button className="text-white hover:text-[#FFD166] transition-colors underline">
              Download data to see more reader information.
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
