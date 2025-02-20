
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Book } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
import { TipHistory } from "@/components/TipHistory";
import { TipDownloadButton } from "@/components/tips/TipDownloadButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Simplified types without deep nesting
type QRCodeData = {
  id: string;
  author_id: string;
  book_title: string;
  publisher?: string;
  release_date?: string;
  isbn?: string;
  cover_image?: string;
  total_tips?: number;
  total_amount?: number;
  average_tip?: number;
  last_tip_date?: string;
};

type TipData = {
  id: string;
  amount: number;
  message?: string;
  created_at: string;
  author_id: string;
  qr_code_id?: string;
};

type Interaction = {
  id: string;
  tip_id: string;
};

const AuthorQRCodeDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: qrCode, isLoading: qrLoading } = useQuery({
    queryKey: ['qr-code', id],
    queryFn: async () => {
      if (!id) throw new Error('QR code ID is required');
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select()
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as QRCodeData;
    }
  });

  const { data: tipData } = useQuery({
    queryKey: ['qr-tips', id],
    queryFn: async () => {
      if (!id) return { tips: [], likes: [], comments: [] };

      const [tips, likes, comments] = await Promise.all([
        supabase.from('tips').select().eq('qr_code_id', id),
        supabase.from('tip_likes').select().eq('qr_code_id', id),
        supabase.from('tip_comments').select().eq('qr_code_id', id)
      ]);

      return {
        tips: (tips.data || []) as TipData[],
        likes: (likes.data || []) as Interaction[],
        comments: (comments.data || []) as Interaction[]
      };
    },
    enabled: !!id
  });

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${qrCode?.book_title || 'download'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (qrLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!qrCode) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-24">
          <h1 className="text-2xl font-bold text-red-500">QR Code not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link 
            to="/author/dashboard" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 space-y-6">
              <h1 className="text-2xl font-bold">{qrCode.book_title}</h1>
              
              <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                {qrCode.cover_image ? (
                  <img
                    src={qrCode.cover_image}
                    alt={qrCode.book_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Book className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Publisher:</span> {qrCode.publisher || 'Not specified'}</p>
                <p><span className="font-medium">Release Date:</span> {qrCode.release_date ? format(new Date(qrCode.release_date), 'PP') : 'Not specified'}</p>
                <p><span className="font-medium">ISBN:</span> {qrCode.isbn || 'Not specified'}</p>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">QR Code</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center">
                  <QRCodeCanvas
                    id="qr-canvas"
                    value={`${window.location.origin}/qr/${qrCode.id}`}
                    size={200}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <Button 
                  onClick={handleDownloadQR}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Tips</p>
                    <p className="text-2xl font-bold">{qrCode.total_tips || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">${qrCode.total_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Tip</p>
                    <p className="text-2xl font-bold">${qrCode.average_tip?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Tip</p>
                    <p className="text-2xl font-bold">
                      {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), 'MMM d') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Tip History</h2>
              {tipData && <TipDownloadButton 
                tips={tipData.tips} 
                likes={tipData.likes} 
                comments={tipData.comments}
                qrCodeId={id}
              />}
            </div>
            <TipHistory authorId={qrCode.author_id} qrCodeId={id} isDashboard={true} />
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthorQRCodeDetails;
