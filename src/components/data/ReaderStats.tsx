
import { Card, CardContent } from "@/components/ui/card";

interface ReaderInfo {
  name: string;
  email: string;
  value: number;
}

interface ReaderStatsProps {
  readerInfo: ReaderInfo[];
  onDownload: () => void;
}

export const ReaderStats = ({ readerInfo }: ReaderStatsProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 bg-[#19363C] text-white">
        <div className="space-y-6">
          <h2 className="text-2xl font-playfair">Your readers</h2>
          
          {readerInfo.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {readerInfo.map((reader, index) => (
                <div key={index} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="font-medium">{reader.name || "Anonymous"}</div>
                  <div className="text-sm text-white/70">{reader.email || "No email"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/70 py-8">
              No reader data available yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
