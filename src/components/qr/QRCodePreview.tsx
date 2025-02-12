
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeCanvas } from "qrcode.react";

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
            <div className="max-w-[300px] w-full p-4 bg-white rounded-lg">
              <QRCodeCanvas
                value={qrCodePreview}
                size={300}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#000000"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Preview URL: {qrCodePreview}</p>
            </div>
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
