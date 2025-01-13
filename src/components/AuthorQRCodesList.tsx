import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { format } from "date-fns";
import { Download, Loader2, Plus, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthorQRCodeStats } from "./AuthorQRCodeStats";
import { useToast } from "@/hooks/use-toast";

interface AuthorQRCodesListProps {
  authorId: string;
}

export const AuthorQRCodesList = ({ authorId }: AuthorQRCodesListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['qr-codes', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('author_id', authorId)
        .order('book_title', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const handleDownload = async (qrCode: any) => {
    try {
      // Fetch tips for this QR code
      const { data: tips, error } = await supabase
        .from('tips')
        .select('*')
        .eq('book_title', qrCode.book_title)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create CSV content
      const csvContent = [
        ['Date', 'Amount', 'Message'].join(','),
        ...(tips || []).map(tip => [
          new Date(tip.created_at).toLocaleDateString(),
          tip.amount,
          `"${(tip.message || '').replace(/"/g, '""')}"` // Escape quotes in messages
        ].join(','))
      ].join('\n');

      // Create and download the file
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuthorQRCodeStats authorId={authorId} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your QR Codes</h2>
        <Button onClick={() => navigate('/author/create-qr')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New QR Code
        </Button>
      </div>

      {!qrCodes || qrCodes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You haven't created any QR codes yet. Click the button above to create your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        qrCodes.map((qr) => (
          <Card key={qr.id}>
            <CardHeader>
              <div className="flex items-center gap-2 text-left">
                <QrCode className="h-6 w-6 text-muted-foreground" />
                <div>
                  <CardTitle className="text-left">{qr.book_title}</CardTitle>
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
                    <p className="text-lg font-semibold">{qr.total_tips || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-lg font-semibold">${qr.total_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Tip</p>
                    <p className="text-lg font-semibold">${qr.average_tip?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Tip</p>
                    <p className="text-lg font-semibold">
                      {qr.last_tip_date ? format(new Date(qr.last_tip_date), 'MMM d, yyyy') : 'No tips yet'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1 text-left">
                    <p className="font-medium">Published by {qr.publisher || 'Unknown'}</p>
                    {qr.isbn && <p className="text-sm text-muted-foreground">ISBN: {qr.isbn}</p>}
                    {qr.release_date && (
                      <p className="text-sm text-muted-foreground">
                        Release Date: {format(new Date(qr.release_date), 'PPP')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleDownload(qr)}
                    >
                      <Download className="h-4 w-4" />
                      Download Tips Data
                    </Button>
                    {qr.is_paid ? (
                      <Button variant="outline" onClick={() => window.open(`/qr/${qr.id}`, '_blank')}>
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
        ))
      )}
    </div>
  );
};