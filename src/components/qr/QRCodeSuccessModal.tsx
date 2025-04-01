import React, { useRef } from 'react';
import { Download, Share2, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { StyledQRCode } from './StyledQRCode';
import { toPng, toSvg } from 'html-to-image';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface QRCodeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: {
    id: string;
    book_title: string;
    author_id: string;
    cover_image?: string | null;
  } | null;
}

export const QRCodeSuccessModal = ({ 
  isOpen, 
  onClose, 
  qrCode 
}: QRCodeSuccessModalProps) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  if (!qrCode) return null;

  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  const handleDownload = async () => {
    if (!qrCodeRef.current) return;

    try {
      try {
        const svgDataUrl = await toSvg(qrCodeRef.current, { 
          cacheBust: true,
          backgroundColor: null,
          style: {
            borderRadius: '8px',
          }
        });
        
        const link = document.createElement('a');
        link.href = svgDataUrl;
        link.download = `quilltips-qr-${qrCode.book_title || 'download'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (svgError) {
        console.warn('SVG generation failed, falling back to PNG:', svgError);
      }

      const pngDataUrl = await toPng(qrCodeRef.current, { 
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: null,
        style: {
          borderRadius: '8px',
        }
      });
      
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = `quilltips-qr-${qrCode.book_title || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code for ${qrCode.book_title}`,
          text: 'Check out my QR code on Quilltips!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold text-[#403E43]">
              Your Quilltips Jar is ready
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
          
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-8">
                <img 
                  src="/lovable-uploads/quill_icon.png" 
                  alt="Quill Icon" 
                  className="h-10 w-10"
                />
                <div className="text-2xl text-[#403E43]">+</div>
                <img 
                  src="/lovable-uploads/book_icon.png" 
                  alt="Book Icon" 
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-medium">QR Code</h2>
                <p className="text-sm text-muted-foreground">
                  {qrCode.book_title}
                </p>
              </div>

              <div>
                <StyledQRCode
                  ref={qrCodeRef}
                  value={qrValue}
                  size={200}
                  showBranding={true}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button 
                    className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Info className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>SVG is best for print. This file format keeps your QR code crisp at any size, with transparent corners and smooth edges. Perfect for adding to your book cover or promotional materials.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share QR Code
                </Button>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Does your publisher need access to info about this book in Quilltips?{' '}
                <button className="text-[#9b87f5] hover:underline">
                  Send an invite
                </button>{' '}
                to your publisher to claim this book.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
