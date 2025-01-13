import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { QrCode } from "lucide-react";
import { TipHistory } from "@/components/TipHistory";

const QRCodeDetails = () => {
  const { id } = useParams();

  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['qr-code', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div>Loading...</div>
        </main>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div>QR Code not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle className="text-left">{qrCode.book_title}</CardTitle>
                <p className="text-sm text-muted-foreground">QR Code Details</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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

              <div className="p-4 border rounded-lg space-y-2">
                <p className="font-medium">Published by {qrCode.publisher || 'Unknown'}</p>
                {qrCode.isbn && <p className="text-sm text-muted-foreground">ISBN: {qrCode.isbn}</p>}
                {qrCode.release_date && (
                  <p className="text-sm text-muted-foreground">
                    Release Date: {format(new Date(qrCode.release_date), 'PPP')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Tip History</h2>
          <TipHistory authorId={qrCode.author_id} qrCodeId={qrCode.id} />
        </div>
      </main>
    </div>
  );
};

export default QRCodeDetails;