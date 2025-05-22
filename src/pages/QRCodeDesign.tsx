
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQRCodeGeneration } from "@/hooks/use-qr-code-generation";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

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

  // Check if QR code is paid for
  const isPaid = qrCodeData?.is_paid === true;

  // Format release date if available
  const formattedReleaseDate = qrCodeData.release_date 
    ? format(new Date(qrCodeData.release_date), 'MMMM d, yyyy')
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#19363C]">New QR Code</h1>
        
        <div className="max-w-5xl mx-auto">
          {/* Two column layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Book Details */}
            <div>
              <Card className="overflow-hidden bg-[#19363C] text-white p-6 rounded-lg">
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-6">Book Details</h2>
                  
                  <div className="flex gap-6">
                    {/* Book cover image */}
                    <div className="w-[100px] aspect-[2/3] bg-gray-200 rounded overflow-hidden">
                      {qrCodeData.cover_image ? (
                        <img
                          src={qrCodeData.cover_image}
                          alt={`Cover for ${qrCodeData.book_title}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <img
                            src="/lovable-uploads/quill_icon.png"
                            alt="Quilltips Logo"
                            className="w-12 h-12 object-contain opacity-90"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Book details */}
                    <div className="space-y-2">
                      <h3 className="font-bold">Book Details</h3>
                      
                      {qrCodeData.publisher && (
                        <p className="text-sm">
                          <span className="font-medium">Publisher:</span> {qrCodeData.publisher}
                        </p>
                      )}
                      
                      {formattedReleaseDate && (
                        <p className="text-sm">
                          <span className="font-medium">Release Date:</span> {formattedReleaseDate}
                        </p>
                      )}
                      
                      {qrCodeData.isbn && (
                        <p className="text-sm">
                          <span className="font-medium">ISBN:</span> {qrCodeData.isbn}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* QR code preview */}
                <div className="mt-6 flex justify-center">
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
              </Card>
            </div>
            
            {/* Right Column - Checkout Section */}
            <div>
              <Card className="p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6 text-[#19363C]">Complete Your QR Code Purchase</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3 text-[#19363C]">What you're getting:</h3>
                    <ul className="space-y-2 text-gray-700">
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
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">QR Code</span>
                      <span className="font-bold">$35.00</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">$35.00</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] py-3"
                      disabled={isCheckingOut}
                      variant="default"
                    >
                      {isCheckingOut ? "Processing..." : "Checkout with Stripe ($35.00)"}
                    </Button>
                    
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="w-full text-gray-700 border border-gray-300 py-3"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center text-gray-500">
                    Secure checkout powered by Stripe. Your information is protected.
                  </p>
                  
                  <p className="text-sm text-center mt-4">
                    After checkout, you can download your QR code from your account at any time.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeDesign;
