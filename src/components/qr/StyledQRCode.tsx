
import { QRCodeCanvas } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { forwardRef } from "react";

interface StyledQRCodeProps {
  value: string;
  size?: number;
  title?: string;
  showBranding?: boolean;
  className?: string;
  blurred?: boolean;
}

export const StyledQRCode = forwardRef<HTMLDivElement, StyledQRCodeProps>(({
  value,
  size = 120, // Reduced from 180 (approx 60% smaller)
  title,
  showBranding = true,
  className = "",
  blurred = false,
}, ref) => {
  return (
    <Card ref={ref} className={`bg-white p-4 rounded-lg ${className}`}>
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

        {/* Branding text - with smaller font size */}
        {showBranding && (
          <div className="text-center text-xs leading-tight text-muted-foreground">
            <div>Love this book? Tip and</div>
            <div>
              message the author with <span className="font-bold">Quilltips</span>!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

StyledQRCode.displayName = "StyledQRCode";
