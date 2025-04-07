
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CreditCard } from "lucide-react";
import { TipForm } from "./TipForm";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookCardProps {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  coverImage?: string;
  publisher?: string;
  isbn?: string;
  releaseDate?: string;
}

export const BookCard = ({
  id,
  title,
  authorId,
  authorName,
  coverImage,
  publisher,
  isbn,
  releaseDate,
}: BookCardProps) => {
  const [showTipDialog, setShowTipDialog] = useState(false);

  return (
    <Card className="overflow-hidden group cursor-pointer">
      <Link to={`/qr/${id}`} className="block">
        <div className="h-16 relative">
          <img
            src={coverImage || "/lovable-uploads/quill_icon.png"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="p-2 space-y-0.5">
          <div>
            <h3 className="font-medium text-xs group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
            <p className="text-xs text-muted-foreground">
              by{" "}
              <Link 
                to={`/profile/${authorId}`} 
                onClick={(e) => e.stopPropagation()}
                className="hover:underline"
              >
                {authorName}
              </Link>
            </p>
          </div>

          {(publisher || isbn || releaseDate) && (
            <div className="space-y-0.5 text-[10px] text-muted-foreground">
              {publisher && <p className="truncate">Publisher: {publisher}</p>}
              {isbn && <p className="truncate">ISBN: {isbn}</p>}
              {releaseDate && (
                <p className="truncate">Released: {new Date(releaseDate).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="p-1 pt-0">
        <Button 
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation when clicking the button
            setShowTipDialog(true);
          }} 
          className="w-full"
          variant="secondary"
          size="sm"
        >
          <span className="text-xs">Send Tip</span>
          <CreditCard className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a tip for "{title}"</DialogTitle>
          </DialogHeader>
          <TipForm
            authorId={authorId}
            bookTitle={title}
            qrCodeId={id}
            onSuccess={() => setShowTipDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
