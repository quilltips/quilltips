
import React from 'react';
import { Download } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface QRCodeDownloadOptionsProps {
  onDownloadSVG: () => void;
  onDownloadPNG: () => void;
  className?: string;
  disabled?: boolean;
}

export const QRCodeDownloadOptions = ({
  onDownloadSVG,
  onDownloadPNG,
  className,
  disabled = false
}: QRCodeDownloadOptionsProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className={`flex-grow ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#FFD166] hover:bg-[#FFD166]/90'} text-[#2D3748]`}
            disabled={disabled}
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
          <DropdownMenuItem onClick={onDownloadSVG}>
            <div className="flex flex-col">
              <span className="font-medium">SVG Format</span>
              <span className="text-xs text-muted-foreground">Best for print & scalable graphics</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownloadPNG}>
            <div className="flex flex-col">
              <span className="font-medium">PNG Format</span>
              <span className="text-xs text-muted-foreground">Compatible with most applications</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
