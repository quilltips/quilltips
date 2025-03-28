
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

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
  if (!qrCode) return null;

  // Updated to point to the public QR code details page
  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-code-${qrCode.book_title || 'download'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  src="/lovable-uploads/83411729-97e1-4de9-be52-826dd90f3de3.png" 
                  alt="Book Icon" 
                  className="h-16 w-16 object-contain"
                />
                <div className="text-2xl text-[#403E43]">+</div>
                <img 
                  src="/lovable-uploads/08b0ecf8-9c64-4916-8f42-0182064f90b1.png" 
                  alt="Quill Icon" 
                  className="h-16 w-16"
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

              <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center">
                <QRCodeCanvas
                  id="qr-canvas"
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
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
