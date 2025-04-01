
import { QRCodeInfoCard } from "@/components/qr/QRCodeInfoCard";
import { QRCodeStatsCard } from "@/components/qr/QRCodeStatsCard";
import { QRCode } from "@/hooks/use-qr-code-details-page";
import { RefObject } from "react";

interface AuthorQRCodeDetailsSectionProps {
  qrCode: QRCode;
  onDownload: () => void;
  qrCodeRef?: RefObject<HTMLDivElement>;
}

export const AuthorQRCodeDetailsSection = ({ 
  qrCode, 
  onDownload,
  qrCodeRef
}: AuthorQRCodeDetailsSectionProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <QRCodeInfoCard qrCode={qrCode} />
      <QRCodeStatsCard qrCode={qrCode} onDownload={onDownload} qrCodeRef={qrCodeRef} />
    </div>
  );
};
