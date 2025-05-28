
import { QRCodesList } from "./qr/QRCodesList";

interface AuthorQRCodesProps {
  authorId: string;
  authorName: string;
  showTipButtons?: boolean;
  onTipClick?: (qrCode: { id: string; bookTitle: string }) => void;
}

export const AuthorQRCodes = ({ 
  authorId, 
  authorName, 
  showTipButtons = false, 
  onTipClick 
}: AuthorQRCodesProps) => {
  return (
    <QRCodesList 
      authorId={authorId} 
      showTipButtons={showTipButtons}
      onTipClick={onTipClick}
    />
  );
};
