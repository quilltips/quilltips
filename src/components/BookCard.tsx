
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
        <div className="aspect-[2/3] relative">
          <img
            src={coverImage || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground">by {authorName}</p>
          </div>

          {(publisher || isbn || releaseDate) && (
            <div className="space-y-1 text-sm text-muted-foreground">
              {publisher && <p>Publisher: {publisher}</p>}
              {isbn && <p>ISBN: {isbn}</p>}
              {releaseDate && (
                <p>Released: {new Date(releaseDate).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 pt-0">
        <Button 
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation when clicking the button
            setShowTipDialog(true);
          }} 
          className="w-full"
          variant="secondary"
        >
          Send Tip
          <CreditCard className="ml-2 h-4 w-4" />
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
