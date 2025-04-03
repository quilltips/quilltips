
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
          
          <div className="text-center">
            <Button
              onClick={onDownload}
              variant="outline"
              className="bg-transparent border border-white text-white hover:bg-white/10 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download data to see more reader information
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
