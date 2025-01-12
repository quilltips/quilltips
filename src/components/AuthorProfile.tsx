import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink, DollarSign } from "lucide-react";
import { TipForm } from "./TipForm";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthorProfileProps {
  name: string;
  bio: string;
  imageUrl: string;
  socialLink?: string;
  authorId?: string;
}

export const AuthorProfile = ({ name, bio, imageUrl, socialLink, authorId }: AuthorProfileProps) => {
  const [showTipDialog, setShowTipDialog] = useState(false);

  return (
    <>
      <Card className="glass-card p-6 max-w-2xl mx-auto animate-enter">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 mx-auto md:mx-0 rounded-full overflow-hidden border-2 border-border">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">{name}</h2>
              <p className="text-muted-foreground mt-2">{bio}</p>
            </div>
            
            <div className="flex gap-3">
              {socialLink && (
                <a
                  href={socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="outline" className="hover-lift">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </a>
              )}
              
              {authorId && (
                <Button 
                  onClick={() => setShowTipDialog(true)}
                  className="hover-lift"
                >
                  Tip Author
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a tip to {name}</DialogTitle>
          </DialogHeader>
          {authorId && (
            <TipForm 
              authorId={authorId} 
              onSuccess={() => setShowTipDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};