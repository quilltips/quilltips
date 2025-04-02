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
  });

  const handleCancel = () => {
    navigate('/author/dashboard');
  };

  if (!qrCodeData?.id) {
    navigate('/author/create-qr');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <QRCodeHeader
            coverImage={qrCodeData.cover_image}
            bookTitle={qrCodeData.book_title}
          />
          
          {/* Banner Section */}
          <div className="bg-[#1E40AF] text-white rounded-lg p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">Enable Readers to Tip You</h2>
                <p className="mb-4">
                  Once purchased, your custom QR code can be printed inside your books, 
                  on bookmarks, or promotional materials.
                </p>
                <p>
                  Every scan lets readers send tips and messages directly to you.
                </p>
              </div>
              
              <div className="w-full max-w-[180px] mx-auto">
                <QRCodePreview
                  isGenerating={isGenerating}
                  qrCodePreview={qrCodePreview}
                  onCheckout={handleCheckout}
                  onCancel={handleCancel}
                  isCheckingOut={isCheckingOut}
                  showButtons={false}
                />
              </div>
            </div>
          </div>
          
          {/* Checkout Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your QR Code Purchase</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-lg font-medium mb-4">What you're getting:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Custom QR code for "{qrCodeData.book_title}"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Unlimited scans and tips from readers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Downloadable in multiple formats (PNG, SVG)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Reader analytics and message history</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col">
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">QR Code</span>
                    <span className="font-bold">$9.99</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    One-time purchase for this book. No subscription or recurring charges.
                  </p>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">$9.99</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCheckout}
                    className="px-6 py-3 bg-[#9b87f5] text-white rounded-md font-medium hover:bg-[#8b77e5] transition-colors flex-1 flex justify-center items-center"
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Checkout with Stripe'
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Secure checkout powered by Stripe. Your information is protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;
