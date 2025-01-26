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

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: tips, error } = await supabase
        .from('tips')
        .select('*')
        .eq('book_title', qrCode.book_title)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvContent = [
        ['Date', 'Amount', 'Message'].join(','),
        ...(tips || []).map(tip => [
          new Date(tip.created_at).toLocaleDateString(),
          tip.amount,
          `"${(tip.message || '').replace(/"/g, '""')}"` // Escape quotes in messages
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qrCode.book_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tips.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your tip data is being downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "transform rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>
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

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-1">
                <p className="text-sm font-medium">Published by {qrCode.publisher || 'Unknown'}</p>
                {qrCode.isbn && <p className="text-sm text-muted-foreground">ISBN: {qrCode.isbn}</p>}
                {qrCode.release_date && (
                  <p className="text-sm text-muted-foreground">
                    Release Date: {format(new Date(qrCode.release_date), 'PPP')}
                  </p>
                )}
              </div>
              {qrCode.is_paid ? (
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/qr/${qrCode.id}`, '_blank');
                }}>
                  View QR Code
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Payment Pending
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};