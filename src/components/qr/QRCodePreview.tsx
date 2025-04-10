
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StyledQRCode } from "./StyledQRCode";

interface QRCodePreviewProps {
  isGenerating: boolean;
  qrCodePreview: string | null;
  onCheckout: () => void;
  onCancel: () => void;
  isCheckingOut: boolean;
  showButtons?: boolean;
  isPaid?: boolean;
}

export const QRCodePreview = ({
  isGenerating,
  qrCodePreview,
  onCheckout,
  onCancel,
  isCheckingOut,
  showButtons = true,
  isPaid = false,
}: QRCodePreviewProps) => {
  return (
    <Card className={`overflow-hidden ${!showButtons ? 'bg-transparent border-0 shadow-none' : ''}`}>
      <CardContent className={`p-6 flex flex-col items-center justify-center min-h-[200px] ${!showButtons ? 'p-0' : ''}`}>
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className={showButtons ? 'text-gray-700' : 'text-white'}>Generating your QR code...</p>
          </div>
        ) : qrCodePreview ? (
          <div className="flex flex-col items-center gap-6">
            {/* QR Code Preview - using the same size as the download version */}
            <div className="w-full max-w-[240px] mx-auto">
              <StyledQRCode
                value={qrCodePreview}
                size={180}
                showBranding={true}
                blurred={!isPaid}
                isPaid={isPaid}
                title="QR Code Preview"
                className={!showButtons ? 'border-white' : ''}
              />
            </div>
            
            {/* Buttons - only show if showButtons is true */}
            {showButtons && (
              <div className="flex w-full flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onCancel}
                  size="lg"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={onCheckout}
                  size="lg"
                  className="w-full"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Purchase QR Code ($35.00)'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className={showButtons ? 'text-muted-foreground' : 'text-white/80'}>Failed to generate QR code preview</p>
        )}
      </CardContent>
    </Card>
  );
};
