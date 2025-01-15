import { format } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Download, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QRCodeCardProps {
  qrCode: any;
  onNavigate: (id: string) => void;
}

export const QRCodeCard = ({ qrCode, onNavigate }: QRCodeCardProps) => {
  const { toast } = useToast();

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
    <Card 
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onNavigate(qrCode.id)}
    >
      <CardHeader>
        <div className="flex items-center gap-2 text-left">
          <QrCode className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-left">{qrCode.book_title}</CardTitle>
            <CardDescription className="text-left">
              QR Code Details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Tips</p>
              <p className="text-lg font-semibold">{qrCode.total_tips || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-lg font-semibold">${qrCode.total_amount?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Tip</p>
              <p className="text-lg font-semibold">${qrCode.average_tip?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Tip</p>
              <p className="text-lg font-semibold">
                {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), 'MMM d, yyyy') : 'No tips yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1 text-left">
              <p className="font-medium">Published by {qrCode.publisher || 'Unknown'}</p>
              {qrCode.isbn && <p className="text-sm text-muted-foreground">ISBN: {qrCode.isbn}</p>}
              {qrCode.release_date && (
                <p className="text-sm text-muted-foreground">
                  Release Date: {format(new Date(qrCode.release_date), 'PPP')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download Tips Data
              </Button>
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
        </div>
      </CardContent>
    </Card>
  );
};