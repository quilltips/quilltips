
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
        <div className="h-24 relative">
          <img
            src={coverImage || "/lovable-uploads/quill_icon.png"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="p-3 space-y-1">
          <div>
            <h3 className="font-semibold text-xs group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
            <p className="text-xs ">
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
            <div className="space-y-0.5 text-xs ">
              {publisher && <p className="truncate text-[10px]">Publisher: {publisher}</p>}
              {isbn && <p className="truncate text-[10px]">ISBN: {isbn}</p>}
              {releaseDate && (
                <p className="truncate text-[10px]">Released: {new Date(releaseDate).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="p-2 flex gap-2">
        <Button 
          onClick={(e) => {
            e.preventDefault();
            setShowTipDialog(true);
          }} 
          className="flex-1 bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C]"
          size="sm"
        >
          <span className="text-xs">Leave a tip</span>
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
