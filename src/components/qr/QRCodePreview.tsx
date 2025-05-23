
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
  size?: "small" | "normal";
}

export const QRCodePreview = ({
  isGenerating,
  qrCodePreview,
  onCheckout,
  onCancel,
  isCheckingOut,
  showButtons = true,
  isPaid = false,
  size = "normal",
}: QRCodePreviewProps) => {
  // Determine QR code size based on the size prop
  const qrCodeSize = size === "small" ? 80 : 180;
  const isSmall = size === "small";

  return (
    <Card className={`overflow-hidden ${!showButtons ? 'bg-transparent border-0 shadow-none' : ''}`}>
      <CardContent className={`flex flex-col items-center justify-center ${!showButtons ? 'p-0' : 'p-6'} ${isSmall ? 'min-h-0' : 'min-h-[200px]'}`}>
        {isGenerating ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className={`animate-spin text-primary ${isSmall ? 'h-4 w-4' : 'h-8 w-8'}`} />
            <p className={`${showButtons ? 'text-gray-700' : 'text-white'} ${isSmall ? 'text-xs' : ''}`}>
              {isSmall ? 'Loading...' : 'Generating your QR code...'}
            </p>
          </div>
        ) : qrCodePreview ? (
          <div className="flex flex-col items-center">
            {/* QR Code Preview with dynamic size */}
            <div className={`${isSmall ? 'w-full max-w-[100px]' : 'w-full max-w-[240px]'}`}>
              <StyledQRCode
                value={qrCodePreview}
                size={qrCodeSize}
                blurred={!isPaid}
                isPaid={isPaid}
                title="QR Code Preview"
                className={!showButtons ? 'border-white' : ''}
              />
            </div>
            
            {/* Buttons - only show if showButtons is true */}
            {showButtons && (
              <div className="flex w-full flex-col sm:flex-row gap-4 mt-6">
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
          <p className={`${showButtons ? 'text-muted-foreground' : 'text-white/80'} ${isSmall ? 'text-xs' : ''}`}>
            Failed to generate QR code preview
          </p>
        )}
      </CardContent>
    </Card>
  );
};
