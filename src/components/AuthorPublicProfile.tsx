import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ExternalLink, DollarSign, Globe, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { TipForm } from "./TipForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SocialLink {
  url: string;
  label: string;
}

interface AuthorPublicProfileProps {
  name: string;
  bio: string;
  imageUrl: string;
  socialLinks?: SocialLink[];
  authorId: string;
}

const getSocialIcon = (label: string) => {
  const label_lower = label.toLowerCase();
  if (label_lower.includes('twitter')) return Twitter;
  if (label_lower.includes('instagram')) return Instagram;
  if (label_lower.includes('linkedin')) return Linkedin;
  if (label_lower.includes('github')) return Github;
  return Globe;
};

export const AuthorPublicProfileView = ({ 
  name, 
  bio, 
  imageUrl, 
  socialLinks = [],
  authorId,
}: AuthorPublicProfileProps) => {
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
            
            <div className="flex flex-wrap items-center gap-4">
              {socialLinks.map((link, index) => {
                const IconComponent = getSocialIcon(link.label);
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={link.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
              
              <Button 
                onClick={() => setShowTipDialog(true)}
                className="hover-lift ml-auto"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Tip Author
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a tip to {name}</DialogTitle>
          </DialogHeader>
          <TipForm 
            authorId={authorId} 
            onSuccess={() => setShowTipDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};