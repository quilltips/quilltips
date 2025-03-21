
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
}

export const QRCodeDisplay = ({ value }: QRCodeDisplayProps) => {
  return (
    <div className="mb-4">
      <QRCodeCanvas
        value={value}
        size={180}
        level="H"
        includeMargin
        className="mx-auto"
      />
    </div>
  );
};
