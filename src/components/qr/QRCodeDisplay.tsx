
import { StyledQRCode } from "./StyledQRCode";

interface QRCodeDisplayProps {
  value: string;
  className?: string;
}

export const QRCodeDisplay = ({ value, className }: QRCodeDisplayProps) => {
  return (
    <div className={`mb-4 ${className || ""}`}>
      <StyledQRCode 
        value={value}
        size={180}
        showBranding={true}
      />
    </div>
  );
};
