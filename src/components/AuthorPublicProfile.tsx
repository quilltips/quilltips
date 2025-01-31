import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CreditCard, Globe, Twitter, Facebook, Share2 } from "lucide-react";
import { TipForm } from "./TipForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  switch (label) {
    case 'Twitter':
      return <Twitter className="h-5 w-5 text-blue-400" />;
    case 'Facebook':
      return <Facebook className="h-5 w-5 text-blue-600" />;
    case 'TikTok':
      return <Share2 className="h-5 w-5 text-black" />;
    default:
      return <Globe className="h-5 w-5 text-gray-500" />;
  }
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
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FEC6A1] shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FEC6A1] focus:ring-offset-2">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-[#2D3748]">{name}</h2>
            <p className="text-[#4A5568] max-w-lg mx-auto leading-relaxed">{bio}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[#2D3748] hover:text-[#4A5568] transition-colors group"
              >
                {getSocialIcon(link.label)}
                <span className="group-hover:underline">{link.label}</span>
              </a>
            ))}
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