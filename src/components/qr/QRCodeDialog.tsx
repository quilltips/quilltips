
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TipForm } from "../TipForm";

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQRCode: {
    id: string;
    bookTitle: string;
  } | null;
  authorId: string;
  authorName?: string;
}

export const QRCodeDialog = ({ isOpen, onClose, selectedQRCode, authorId, authorName }: QRCodeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Send a tip for "{selectedQRCode?.bookTitle}"
          </DialogTitle>
        </DialogHeader>
        {selectedQRCode && (
          <TipForm 
            authorId={authorId}
            authorName={authorName}
            bookTitle={selectedQRCode.bookTitle}
            qrCodeId={selectedQRCode.id}
            onSuccess={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
