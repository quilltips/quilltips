
import { QRCodeCanvas } from "qrcode.react";
import { Card } from "@/components/ui/card";

interface StyledQRCodeProps {
  value: string;
  size?: number;
  title?: string;
  showBranding?: boolean;
  className?: string;
  blurred?: boolean;
}

export const StyledQRCode = ({
  value,
  size = 180,
  title,
  showBranding = true,
  className = "",
  blurred = false,
}: StyledQRCodeProps) => {
  return (
    <Card className={`bg-white p-4 rounded-lg ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          {/* QR Code */}
          <QRCodeCanvas
            value={value}
            size={size}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
            className="mx-auto rounded"
          />
          
          {/* Logo overlay */}
          {showBranding && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-1 w-[22%] h-[22%] flex items-center justify-center">
                <img 
                  src="/lovable-uploads/quill_icon.png" 
                  alt="Quilltips Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
          
          {/* Blurred overlay for unpurchased QR codes */}
          {blurred && (
            <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center rounded-lg">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex flex-col items-center justify-center rounded-lg">
                <div className="text-xs text-center text-gray-700 font-medium px-2">
                  Purchase to unlock your QR code
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Branding text - split into two lines and increased size by 50% */}
        {showBranding && (
          <div className="text-center text-sm leading-tight text-muted-foreground">
            <div>Like the book?</div>
            <div>
              Tip the author with <span className="font-bold">Quilltips</span>!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
