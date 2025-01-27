import { format } from "date-fns";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Download, ChevronDown, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QRCodeCardProps {
  qrCode: any;
  onNavigate: (id: string) => void;
}

export const QRCodeCard = ({ qrCode, onNavigate }: QRCodeCardProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden transition-all duration-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer">
          <div className="flex items-center gap-3">
            <QrCode className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="font-semibold">{qrCode.book_title}</h3>
              <p className="text-sm text-muted-foreground">
                {qrCode.total_tips || 0} tips · ${qrCode.total_amount?.toFixed(2) || '0.00'} total
              </p>
            </div>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="animate-accordion-down">
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Tips</p>
                <p className="font-semibold">{qrCode.total_tips || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-semibold">${qrCode.total_amount?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Tip</p>
                <p className="font-semibold">${qrCode.average_tip?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Tip</p>
                <p className="font-semibold">
                  {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), 'MMM d, yyyy') : 'No tips yet'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              {qrCode.publisher && (
                <p className="text-sm">
                  <span className="font-medium">Publisher:</span> {qrCode.publisher}
                </p>
              )}
              {qrCode.release_date && (
                <p className="text-sm">
                  <span className="font-medium">Release Date:</span> {format(new Date(qrCode.release_date), 'PPP')}
                </p>
              )}
              {qrCode.isbn && (
                <p className="text-sm">
                  <span className="font-medium">ISBN:</span> {qrCode.isbn}
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};