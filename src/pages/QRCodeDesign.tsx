
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQRCodeGeneration } from "@/hooks/use-qr-code-generation";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { Footer } from "@/components/Footer";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import { format } from "date-fns";
import { Book } from "lucide-react";

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

  const formattedReleaseDate = qrCodeData.release_date 
    ? format(new Date(qrCodeData.release_date), "MMMM d, yyyy")
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-playfair font-medium text-[#19363C] mb-6">New QR Code</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-medium mb-6">Create a new QR code</h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {qrCodeData.cover_image ? (
                <img 
                  src={qrCodeData.cover_image} 
                  alt={`Cover for ${qrCodeData.book_title}`}
                  className="w-16 h-24 object-cover rounded" 
                />
              ) : (
                <div className="w-16 h-24 bg-[#FFD166]/20 rounded flex items-center justify-center">
                  <Book className="h-8 w-8 text-[#FFD166]" />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium">{qrCodeData.book_title}</h3>
                <p className="text-gray-600">{qrCodeData.publisher}</p>
                {formattedReleaseDate && (
                  <p className="text-gray-500 text-sm">{formattedReleaseDate}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-[#19363C] rounded-lg p-6 mb-8">
            <QRCodePreview
              isGenerating={isGenerating}
              qrCodePreview={qrCodePreview}
              onCheckout={handleCheckout}
              onCancel={handleCancel}
              isCheckingOut={isCheckingOut}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium mb-4">Checkout</h2>
            <p className="text-gray-600 mb-6">
              After checkout, you can download your QR code from your account at any time.
              Your QR code can be printed on your book cover or inside pages.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-lg">
                <span className="font-medium">Total: </span>
                <span className="font-bold">$9.99</span>
              </div>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || isGenerating}
                  className="px-6 py-3 bg-[#FFD166] text-[#19363C] rounded-lg font-medium hover:bg-[#FFD166]/90 w-full sm:w-auto disabled:opacity-70"
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QRCodeDesign;
