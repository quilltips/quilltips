import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQRCodeGeneration } from "@/hooks/use-qr-code-generation";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  const isPaid = qrCodeData?.is_paid === true;

  const formattedReleaseDate = qrCodeData.release_date 
    ? format(new Date(qrCodeData.release_date), 'MMMM d, yyyy')
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col items-center justify-center">
            <div className="w-[150px] h-[180px] bg-transparent rounded-md flex items-center justify-center overflow-hidden">
              {qrCodeData.cover_image ? (
                <img
                  src={qrCodeData.cover_image}
                  alt={`Cover for ${qrCodeData.book_title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/lovable-uploads/2be90d2b-bfb0-47d4-9715-bff8d737048d.png"
                  alt="Quilltips Logo"
                  className="w-20 h-20 object-contain opacity-90"
                />
              )}
            </div>
          </div>
          
          <div className="bg-[#FFD166] text-black rounded-lg p-8 shadow-lg">
            <div className="flex flex-col justify-center items-center text-center min-h-[100px]">
              <h2 className="text-2xl font-normal">
                Success! Your QR code for "
                <span className="font-bold text-[#19363C] underline underline-offset-4 decoration-2">
                  {qrCodeData.book_title}
                </span>
                " is ready for download
              </h2>
            </div>
          </div>
          
          <div className="bg-[#19363C] text-white rounded-lg p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 md:pl-4">
                <h2 className="text-2xl font-bold mb-6">Book Details</h2>
                <div className="space-y-4 text-lg">
                  {qrCodeData.publisher && (
                    <p className="flex items-baseline">
                      <span className="font-medium mr-2 min-w-[120px]">Publisher:</span>
                      <span>{qrCodeData.publisher}</span>
                    </p>
                  )}
                  {formattedReleaseDate && (
                    <p className="flex items-baseline">
                      <span className="font-medium mr-2 min-w-[120px]">Release Date:</span>
                      <span>{formattedReleaseDate}</span>
                    </p>
                  )}
                  {qrCodeData.isbn && (
                    <p className="flex items-baseline">
                      <span className="font-medium mr-2 min-w-[120px]">ISBN:</span>
                      <span>{qrCodeData.isbn}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="w-full max-w-[240px] mx-auto">
                <QRCodePreview
                  isGenerating={isGenerating}
                  qrCodePreview={qrCodePreview}
                  onCheckout={handleCheckout}
                  onCancel={handleCancel}
                  isCheckingOut={isCheckingOut}
                  showButtons={false}
                  isPaid={isPaid}
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your QR Code Purchase</h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-lg font-medium mb-4">What you're getting:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#FFD166] mr-2">✓</span>
                    <span>Custom QR code for "{qrCodeData.book_title}"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD166] mr-2">✓</span>
                    <span>Unlimited scans and tips from readers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD166] mr-2">✓</span>
                    <span>Downloadable in multiple formats (PNG, SVG)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FFD166] mr-2">✓</span>
                    <span>Reader analytics and message history</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col">
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">QR Code</span>
                    <span className="font-bold">$35.00</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    One-time purchase for this book. No subscription or recurring charges.
                  </p>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">$35.00</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCheckout}
                    className="px-6 py-3 bg-[#FFD166] text-[#19363C] rounded-md font-medium hover:bg-[#FFD166]/90 transition-colors flex-1 flex justify-center items-center"
                    disabled={isCheckingOut}
                    variant="default"
                  >
                    {isCheckingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#19363C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Checkout with Stripe ($35.00)'
                    )}
                  </Button>
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
