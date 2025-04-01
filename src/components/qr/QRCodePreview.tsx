
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
}

export const QRCodePreview = ({
  isGenerating,
  qrCodePreview,
  onCheckout,
  onCancel,
  isCheckingOut,
}: QRCodePreviewProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Generating your QR code...</p>
          </div>
        ) : qrCodePreview ? (
          <div className="flex flex-col items-center gap-6">
            {/* Reduced size by ~50% */}
            <div className="w-full max-w-[150px] mx-auto">
              <StyledQRCode
                value={qrCodePreview}
                size={130}
                showBranding={true}
                blurred={true}
                title="QR Code Preview"
              />
            </div>
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
                  'Purchase QR Code ($9.99)'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Failed to generate QR code preview</p>
        )}
      </CardContent>
    </Card>
  );
};
