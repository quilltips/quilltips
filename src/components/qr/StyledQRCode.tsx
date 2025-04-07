
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
  isPaid?: boolean;
}

export const StyledQRCode = forwardRef<HTMLDivElement, StyledQRCodeProps>(({
  value,
  size = 160,
  title,
  showBranding = true,
  className = "",
  blurred = false,
  isPaid = true,
}, ref) => {
  const shouldBlur = isPaid === false || blurred;
  
  return (
    <Card 
      ref={ref} 
      prominent 
      className={`bg-white p-4 rounded-lg border-black border ${className}`}
    >
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
          {shouldBlur && (
            <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center rounded-lg">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex flex-col items-center justify-center rounded-lg">
                <div className="text-sm text-center text-gray-700 font-medium px-2">
                  Purchase to unlock your QR code
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Branding text - adjust width to fit on 3 lines or less */}
        {showBranding && (
          <div className="text-center text-xs leading-tight text-muted-foreground max-w-[160px]">
            <div>Love this book? Tip and message</div>
            <div>the author with <span className="font-bold">Quilltips</span>!</div>
          </div>
        )}
      </div>
    </Card>
  );
});

StyledQRCode.displayName = "StyledQRCode";
