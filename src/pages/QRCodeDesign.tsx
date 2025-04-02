
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQRCodeGeneration } from "@/hooks/use-qr-code-generation";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { QRCodeHeader } from "@/components/qr/QRCodeHeader";
import { QRCodePreview } from "@/components/qr/QRCodePreview";

const QRCodeDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qrCodeData = location.state?.qrCodeData;

  const { isGenerating, qrCodePreview } = useQRCodeGeneration({
    qrCodeData
  });

  const { isCheckingOut, handleCheckout } = useQRCheckout({
    qrCodeId: qrCodeData?.id,
    bookTitle: qrCodeData?.book_title,
    onSuccess: (qrCodeId) => {
      // Navigate to the QRCodeSummary page instead of the dashboard
      navigate(`/qr-summary?qr_code=${qrCodeId}`);
    }
  });

  const handleCancel = () => {
    navigate('/author/dashboard');
  };

  if (!qrCodeData?.id) {
    navigate('/author/create-qr');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <QRCodeHeader
            coverImage={qrCodeData.cover_image}
            bookTitle={qrCodeData.book_title}
          />
          <QRCodePreview
            isGenerating={isGenerating}
            qrCodePreview={qrCodePreview}
            onCheckout={handleCheckout}
            onCancel={handleCancel}
            isCheckingOut={isCheckingOut}
          />
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;
