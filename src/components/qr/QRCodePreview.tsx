
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodePreviewProps {
  isGenerating: boolean;
  qrCodePreview: string | null;
  onCheckout: () => void;
  isCheckingOut: boolean;
}

export const QRCodePreview = ({
  isGenerating,
  qrCodePreview,
  onCheckout,
  isCheckingOut,
}: QRCodePreviewProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Generating your QR code...</p>
          </div>
        ) : qrCodePreview ? (
          <div className="flex flex-col items-center gap-6">
            <img
              src={qrCodePreview}
              alt="QR Code Preview"
              className="max-w-[300px] w-full"
            />
            <Button 
              onClick={onCheckout}
              size="lg"
              className="w-full md:w-auto"
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
        ) : (
          <p className="text-muted-foreground">Failed to generate QR code preview</p>
        )}
      </CardContent>
    </Card>
  );
};
