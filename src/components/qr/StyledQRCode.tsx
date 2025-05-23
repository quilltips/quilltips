
import { QRCodeCanvas } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { forwardRef } from "react";
import { Button } from "../ui/button";
import { LockIcon } from "lucide-react";

interface StyledQRCodeProps {
  value: string;
  title?: string;
  showBranding?: boolean;
  className?: string;
  blurred?: boolean;
  isPaid?: boolean;
  variant?: "screen" | "download"; // Differentiate screen vs download
  size?: number; // Size prop to control QR code dimensions
}

export const StyledQRCode = forwardRef<HTMLDivElement, StyledQRCodeProps>(({
  value,
  title,
  showBranding = true,
  className = "",
  blurred = false,
  isPaid = true,
  variant = "screen", // default to screen
  size = 180, // Default size as 180px
}, ref) => {
  const shouldBlur = isPaid === false || blurred;
  const isDownload = variant === "download";
  const isSmall = size <= 100; // Check if we're rendering a small QR code

  // Dynamic sizing based on variant and size
  const cardWidth = isDownload ? 1200 : (isSmall ? size * 1.2 : 240);
  const cardHeight = isDownload ? 1500 : (isSmall ? size * 1.7 : 320);
  const qrSize = isDownload ? 980 : size; // Use the size prop directly
  const cardPaddingX = isDownload ? 8 : (isSmall ? 1 : 3);
  const cardPaddingY = isDownload ? 5 : (isSmall ? 1 : 2);
  const textFontSize = isDownload ? "text-7xl" : isSmall ? "text-[6px]" : "text-sm";
  const brandingMaxWidth = isDownload ? "max-w-[750px]" : isSmall ? "max-w-[80px]" : "max-w-[150px]";
  const qrPadding = isDownload ? 4 : (isSmall ? 0.5 : 2);
  const logoPadding = isDownload ? "p-6" : isSmall ? "p-0.5" : "p-1.5";
  const cardBorderRadius = isDownload ? "64px" : isSmall ? "0.75rem" : "1.5rem";


  return (
    <Card
      ref={ref}
      className={`bg-white flex flex-col items-center justify-start border border-gray ${className}`}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        padding: `${cardPaddingY * 4}px ${cardPaddingX * 4}px`,
        borderRadius: cardBorderRadius,
      }}
    >

      <div className="flex flex-col items-center">
        <div
          className="relative rounded-lg"
          style={{ padding: `${qrPadding * 4}px` }}
        >
          {/* QR Code */}
          <QRCodeCanvas
            value={value}
            size={qrSize}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
            className="mx-auto rounded"
          />

          {/* Logo overlay */}
          {showBranding && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`bg-white rounded-full flex items-center justify-center ${logoPadding}`}
                style={{ width: "20%", height: "20%" }}
              >
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
            <div className="absolute inset-0 bg-white/10 flex flex-col items-center justify-center rounded-lg">
            
                <div className=" backdrop-blur-md bg-white/80  rounded-full">
                <div className="text-center space-y-1">
                  <LockIcon className="mx-auto mt-2 h-4 w-4 text-[#2D3748]"/>
                  <p className={`text-center text-[8px] font-semibold text-black px-3 py-1 ${textFontSize}`}>
                 Purchase to unlock your QR code
                </p>
                </div>
                </div>
              
            </div>
          )}
        </div>

        {/* Branding text - only show for normal sized QR codes */}
        {showBranding && (
          <div className={`font-playfair text-center text-black leading-normal px-1 ${brandingMaxWidth} mt-2 ${textFontSize}`}>
            <div>
              Love this book? Tip & message the author with <span className="font-bold">Quilltips</span>!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});

StyledQRCode.displayName = "StyledQRCode";
