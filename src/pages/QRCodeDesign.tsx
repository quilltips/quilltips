import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useQRCodeGeneration } from "@/hooks/use-qr-code-generation";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { BookCoverUpload } from "@/components/qr/BookCoverUpload";
import { useState } from "react";

const QRCodeDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qrCodeData = location.state?.qrCodeData;
  const [coverImageUrl, setCoverImageUrl] = useState(qrCodeData?.cover_image || null);

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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Two column layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Book Details in landscape format */}
            <div>
              <Card className="overflow-hidden bg-[#19363C] text-white p-6 rounded-lg">
                <div className="flex flex-col h-full">
                  {/* Top section: title */}
              
                  
                  {/* Main content: landscape layout with QR code + details on left, cover image on right */}
                  <div className="flex flex-row gap-6 flex-grow">
                    {/* Section #1: Left side with QR code and details */}
                    <div className="flex-1 flex flex-col space-y-4">
                    <h2 className="text-2xl font-bold mb-6">{qrCodeData.book_title}</h2>
                      {/* QR code preview at the top */}
                      <div className="mb-2 w-full max-w-[150px]">
                        <QRCodePreview
                          isGenerating={isGenerating}
                          qrCodePreview={qrCodePreview}
                          onCheckout={handleCheckout}
                          onCancel={handleCancel}
                          isCheckingOut={isCheckingOut}
                          showButtons={false}
                          isPaid={isPaid}
                          size="small"
                        />
                      </div>
                      
                      {/* Book details below QR code */}
                      <div className="space-y-2">
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
                    
                    {/* Section #2: Right side with book cover */}
                    <div className="flex-1 flex justify-center items-center">
                      <div className="relative h-full aspect-[2/3] max-w-[200px] bg-transparent rounded overflow-hidden">
                        {coverImageUrl ? (
                          <OptimizedImage
                            src={coverImageUrl}
                            alt={`Cover for ${qrCodeData.book_title}`}
                            className="w-full h-full"
                            objectFit="cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <img
                              src="/lovable-uploads/logo_nav.svg"
                              alt="Quilltips Logo"
                              className="w-12 h-12 object-contain opacity-90"
                            />
                          </div>
                        )}
                        <BookCoverUpload
                          qrCodeId={qrCodeData.id}
                          bookTitle={qrCodeData.book_title}
                          coverImage={coverImageUrl}
                          onUploadSuccess={(url) => {
                            setCoverImageUrl(url);
                            // Update the qrCodeData object to persist
                            qrCodeData.cover_image = url;
                          }}
                          placement="overlay"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Right Column - Checkout Section */}
            <div>
              <Card className="p-6 rounded-lg ">
                <h2 className="text-xl font-bold mb-6 text-[#333333]">Complete Your QR Code Purchase</h2>
                
                <div className="space-y-6">
                 
                  
                  <div className="px-3 py-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium ">QR Code - $35</span>
                      
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-6">
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
                      className="w-full text-gray-500 border border-gray-300 py-3 hover:bg-transparent "
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
