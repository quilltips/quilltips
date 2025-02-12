import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { QrCode } from "lucide-react";
import { TipHistory } from "@/components/TipHistory";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { QRCodePublisherInvite } from "@/components/qr/QRCodePublisherInvite";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPublisherInvite, setShowPublisherInvite] = useState(false);

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

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully!",
      });
      setShowPublisherInvite(true);
    }
  }, [searchParams, toast]);

  const handleDownload = async () => {
    if (qrCode?.framed_qr_code_image_url) {
      const response = await fetch(qrCode.framed_qr_code_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrCode.book_title}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

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

  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={qrCode.cover_image || "/placeholder.svg"}
                    alt={qrCode.book_title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-left">{qrCode.book_title}</CardTitle>
                  <p className="text-sm text-muted-foreground">QR Code Details</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg cursor-pointer" onClick={handleDownload}>
                {qrCode.framed_qr_code_image_url ? (
                  <img
                    src={qrCode.framed_qr_code_image_url}
                    alt="Framed QR Code"
                    className="w-[100px] h-[100px] object-contain"
                  />
                ) : (
                  <QRCodeCanvas
                    id={`qr-${qrCode.id}`}
                    value={qrValue}
                    size={100}
                    level="H"
                    includeMargin={false}
                  />
                )}
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
                <p className="font-medium">Book Details</p>
                {qrCode.publisher && (
                  <p className="text-sm text-muted-foreground">
                    Publisher: {qrCode.publisher}
                  </p>
                )}
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
          <TipHistory 
            authorId={qrCode.author_id} 
            qrCodeId={qrCode.id}
            authorName={`${qrCode.book_title}'s`}
          />
        </div>

        <QRCodePublisherInvite
          isOpen={showPublisherInvite}
          onClose={() => setShowPublisherInvite(false)}
          bookTitle={qrCode.book_title}
        />
      </main>
    </div>
  );
};

export default QRCodeDetails;
