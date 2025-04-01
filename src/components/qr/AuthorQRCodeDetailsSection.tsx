
import { QRCodeInfoCard } from "@/components/qr/QRCodeInfoCard";
import { QRCodeStatsCard } from "@/components/qr/QRCodeStatsCard";
import { QRCode } from "@/hooks/use-qr-code-details-page";
import { RefObject } from "react";

interface AuthorQRCodeDetailsSectionProps {
  qrCode: QRCode;
  onDownload?: () => void;
  handleDownloadSVG?: () => void;
  handleDownloadPNG?: () => void;
  qrCodeRef?: RefObject<HTMLDivElement>;
}

export const AuthorQRCodeDetailsSection = ({ 
  qrCode, 
  qrCodeRef
}: AuthorQRCodeDetailsSectionProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <QRCodeInfoCard qrCode={qrCode} />
      <QRCodeStatsCard qrCode={qrCode} qrCodeRef={qrCodeRef} />
    </div>
  );
};
