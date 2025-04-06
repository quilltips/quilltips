
import React from 'react';
import { Download, Info } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
  const tooltipContent = disabled
    ? "Purchase this QR code to enable downloads"
    : "SVG is perfect for print and keeps your QR code crisp at any size. PNG works well for digital use and is widely compatible.";
    
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
        <DropdownMenuContent align="end" className="w-56">
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Info className="h-5 w-5 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
