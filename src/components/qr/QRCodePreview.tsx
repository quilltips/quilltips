
import { Loader2 } from "lucide-react";
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
}: QRCodePreviewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[260px]">
      {isGenerating ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white">Generating your QR code...</p>
        </div>
      ) : qrCodePreview ? (
        <div className="flex flex-col items-center gap-6">
          {/* Display QR code with blur effect */}
          <div className="w-full max-w-[180px] mx-auto">
            <StyledQRCode
              value={qrCodePreview}
              size={160}
              showBranding={true}
              blurred={true}
              title="QR Code Preview"
              className="border-2 border-[#FFD166] shadow-lg"
            />
          </div>
          <p className="text-center text-white text-sm">
            Purchase to unlock your QR code and make it available for your readers to scan
          </p>
        </div>
      ) : (
        <p className="text-white">Failed to generate QR code preview</p>
      )}
    </div>
  );
};
