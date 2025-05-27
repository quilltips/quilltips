
import { Card, CardContent } from "@/components/ui/card";
import { Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReaderInfo {
  name: string;
  email: string;
  value: number;
}

interface ReaderStatsProps {
  readerInfo: ReaderInfo[];
  onDownload: () => void;
}

export const ReaderStats = ({ readerInfo, onDownload }: ReaderStatsProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6 bg-[#19363C] text-white min-h-[200px] flex flex-col">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-playfair text-left">Top Readers</h2>
            <Button
              onClick={onDownload}
              className="flex items-center gap-2 text-xs font-medium text-[#333333] hover:underline bg-transparent hover:bg-transparent border-none shadow-none p-0"
            >
              Download
              <div className="bg-[#FFD166] hover:bg-transparent rounded-lg p-1">
                <Download className="h-3 w-3 text-white" />
              </div>
            </Button>
          </div>
          
          <div className="flex-1">
            {readerInfo.length > 0 ? (
              <ScrollArea className="h-[120px]">
                <div className="space-y-3">
                  {readerInfo.slice(0, 3).map((reader, index) => (
                    <div key={`${reader.email}-${index}`} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFD166] text-[#19363C] text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium truncate max-w-[120px] md:max-w-[150px]">
                          {reader.name}
                        </span>
                      </div>
                      <span className="text-[#FFD166] font-bold text-sm">
                        {reader.value} tips
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <Users className="h-8 w-8 text-[#FFD166] mb-2" />
                <p className="text-sm text-white/70">No readers yet</p>
              </div>
            )}
          </div>
          
          <p className="text-xs md:text-sm text-white/80 text-center leading-relaxed">
            Your most engaged readers by tip frequency
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
