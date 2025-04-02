
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
  onCheckout,
  onCancel,
  isCheckingOut
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
          <div className="flex gap-4 w-full">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 w-1/2"
            >
              Cancel
            </button>
            <button
              onClick={onCheckout}
              disabled={isCheckingOut}
              className="px-6 py-3 bg-[#FFD166] text-[#19363C] rounded-lg font-medium hover:bg-[#FFD166]/90 w-1/2 disabled:opacity-70"
            >
              {isCheckingOut ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white">Failed to generate QR code preview</p>
      )}
    </div>
  );
};
