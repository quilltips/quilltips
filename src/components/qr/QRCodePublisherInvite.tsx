import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QRCodePublisherInviteProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
}

export const QRCodePublisherInvite = ({
  isOpen,
  onClose,
  bookTitle,
}: QRCodePublisherInviteProps) => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendInvite = async () => {
    setIsSending(true);
    try {
      // TODO: Implement publisher invite functionality
      toast({
        title: "Invite Sent",
        description: "Your publisher has been notified about this QR code.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send publisher invite",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Publisher</DialogTitle>
          <DialogDescription>
            Does your publisher need access to info about this book in Quilltips?
            Send an invite to your publisher to claim this book.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Button
            onClick={handleSendInvite}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? "Sending..." : "Send Invite"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Not ready? Don't worry, you can do this at any time from the saved QR
            code.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};