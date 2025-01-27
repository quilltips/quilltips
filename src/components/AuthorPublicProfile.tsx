import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CreditCard, Globe, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { TipForm } from "./TipForm";
import { format } from "date-fns";
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
      <div className="max-w-2xl mx-auto animate-enter">
        <div className="flex flex-col items-center text-center space-y-6 bg-[#FEF7CD]/30 rounded-3xl p-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FEC6A1] shadow-lg">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-[#2D3748]">{name}</h2>
            <p className="text-[#4A5568] max-w-lg mx-auto leading-relaxed">{bio}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {socialLinks.map((link, index) => {
              const IconComponent = getSocialIcon(link.label);
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-[#2D3748] hover:text-[#4A5568] transition-colors"
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          <Button 
            onClick={() => setShowTipDialog(true)}
            className="hover-lift bg-[#2D3748] text-white hover:bg-[#4A5568] transition-colors"
          >
            Tip Author
            <CreditCard className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

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