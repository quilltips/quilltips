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
  highRes?: boolean;
}

export const StyledQRCode = forwardRef<HTMLDivElement, StyledQRCodeProps>(({
  value,
  size = 180,
  title,
  showBranding = true,
  className = "",
  blurred = false,
  isPaid = true,
  highRes = false,
}, ref) => {
  const shouldBlur = isPaid === false || blurred;

  if (highRes) {
    return (
      <div ref={ref} style={{ width: 1024, height: 1024, background: "#fff" }}>
        <QRCodeCanvas
          value={value}
          size={1024}
          level="H"
          includeMargin
          bgColor="#ffffff"
          fgColor="#000000"
          style={{ width: "1024px", height: "1024px", display: "block" }}
        />
      </div>
    );
  }

  return (
    <Card
      ref={ref}
      className={`w-[240px] h-[340px] bg-white px-4 py-3 rounded-xl border border-black flex flex-col items-center justify-start ${className}`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative rounded-lg p-2">
          <QRCodeCanvas
            value={value}
            size={size}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
            className="mx-auto rounded"
          />

          {showBranding && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-1.5 w-[18%] h-[18%] flex items-center justify-center">
                <img
                  src="/lovable-uploads/quill_icon.png"
                  alt="Quilltips Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

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

        {showBranding && (
          <div className="font-playfair text-center text-sm leading-normal text-muted-foreground px-1 max-w-[200px]">
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
