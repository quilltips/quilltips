
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
    <QRCodeStatsCard qrCode={qrCode} qrCodeRef={qrCodeRef} />
  );
};
