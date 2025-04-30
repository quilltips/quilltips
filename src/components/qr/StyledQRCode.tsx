import { QRCodeCanvas } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { forwardRef } from "react";

interface StyledQRCodeProps {
  value: string;
  title?: string;
  showBranding?: boolean;
  className?: string;
  blurred?: boolean;
  isPaid?: boolean;
  variant?: "screen" | "download"; // NEW: differentiate screen vs download
}

export const StyledQRCode = forwardRef<HTMLDivElement, StyledQRCodeProps>(({
  value,
  title,
  showBranding = true,
  className = "",
  blurred = false,
  isPaid = true,
  variant = "screen", // default to screen
}, ref) => {
  const shouldBlur = isPaid === false || blurred;
  const isDownload = variant === "download";

  // Dynamic sizing based on variant
  const cardWidth = isDownload ? 1200 : 240;
  const cardHeight = isDownload ? 1500 : 320;
  const qrSize = isDownload ? 980 : 180;
  const cardPaddingX = isDownload ? 8 : 3;
  const cardPaddingY = isDownload ? 5 : 2;
  const textFontSize = isDownload ? "text-7xl" : "text-sm";
  const brandingMaxWidth = isDownload ? "max-w-[750px]" : "max-w-[150px]";
  const qrPadding = isDownload ? 4 : 2;
  const logoPadding = isDownload ? "p-6" : "p-1.5";
  const cardBorderRadius = isDownload ? "64px" : "1.5rem"; // 1.5rem ~ rounded-3xl


  return (
    <Card
      ref={ref}
      className={`bg-white flex flex-col items-center justify-start border border-gray ${className}`}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        padding: `${cardPaddingY * 4}px ${cardPaddingX * 4}px`,
        borderRadius: cardBorderRadius, // 🔥 manual dynamic rounding
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
            <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center rounded-lg">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 flex flex-col items-center justify-center rounded-lg">
                <div className={`text-center text-gray-700 font-medium px-2 ${textFontSize}`}>
                  Purchase to unlock your QR code
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Branding text */}
        {showBranding && (
          <div className={`font-playfair text-center leading-normal text-muted-foreground px-1 ${brandingMaxWidth} mt-2 ${textFontSize}`}>
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
