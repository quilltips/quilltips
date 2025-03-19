
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { TipHistory } from "@/components/TipHistory";
import { TipDownloadButton } from "@/components/tips/TipDownloadButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QRCodeInfoCard } from "@/components/qr/QRCodeInfoCard";
import { QRCodeStatsCard } from "@/components/qr/QRCodeStatsCard";

// Define explicit database types
type QRCode = {
  id: string;
  author_id: string;
  book_title: string;
  publisher: string | null;
  release_date: string | null;
  isbn: string | null;
  cover_image: string | null;
  total_tips: number | null;
  total_amount: number | null;
  average_tip: number | null;
  last_tip_date: string | null;
};

const AuthorQRCodeDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: qrCode, isLoading: qrLoading } = useQuery({
    queryKey: ['qr-code', id],
    queryFn: async () => {
      if (!id) throw new Error('QR code ID is required');
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id, author_id, book_title, publisher, release_date, isbn, cover_image, total_tips, total_amount, average_tip, last_tip_date')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as QRCode;
    }
  });

  const { data: tipData } = useQuery({
    queryKey: ['qr-tips', id],
    queryFn: async () => {
      if (!id) return { tips: [], likes: [], comments: [] };

      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('id, amount, message, created_at, author_id, qr_code_id')
        .eq('qr_code_id', id);
      if (tipsError) throw tipsError;

      const { data: likes, error: likesError } = await supabase
        .from('tip_likes')
        .select('id, tip_id, author_id, created_at')
        .eq('tip_id', id);
      if (likesError) throw likesError;

      const { data: comments, error: commentsError } = await supabase
        .from('tip_comments')
        .select('id, tip_id, author_id, content, created_at')
        .eq('tip_id', id);
      if (commentsError) throw commentsError;

      return {
        tips: tips || [],
        likes: likes || [],
        comments: comments || []
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
            <QRCodeInfoCard qrCode={qrCode} />
            <QRCodeStatsCard qrCode={qrCode} onDownload={handleDownloadQR} />
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
