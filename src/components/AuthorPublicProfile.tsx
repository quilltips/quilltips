import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe, Twitter, Facebook, Instagram, Share2 } from "lucide-react";
import { TipForm } from "./TipForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  joinedDate?: string;
}

const getFirstName = (fullName: string): string => {
  return fullName.split(' ')[0] || fullName;
};

const getSocialIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('twitter')) return <Twitter className="h-5 w-5 text-[#1DA1F2]" />;
  if (lowerLabel.includes('facebook')) return <Facebook className="h-5 w-5 text-[#4267B2]" />;
  if (lowerLabel.includes('instagram')) return <Instagram className="h-5 w-5 text-[#E1306C]" />;
  if (lowerLabel.includes('tiktok')) return <Share2 className="h-5 w-5 text-black" />;
  return <Globe className="h-5 w-5 text-gray-500" />;
};

const getValidURL = (url: string): string => {
  if (!url) return '#';
  return url.match(/^https?:\/\//i) ? url : `https://${url}`;
};

export const AuthorPublicProfileView = ({
  name,
  bio,
  imageUrl,
  socialLinks = [],
  authorId,
  joinedDate
}: AuthorPublicProfileProps) => {
  const [showTipDialog, setShowTipDialog] = useState(false);
  const firstName = getFirstName(name);
  
  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8">
      {/* Author Header Section */}
      <div className="flex flex-col items-center text-center">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-28 h-28 mb-4 rounded-full overflow-hidden border-2 border-[#f1f1f1] shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:ring-offset-2">
              {imageUrl && imageUrl !== "/placeholder.svg" ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#19363C] text-[#FFD166] text-4xl font-semibold uppercase">
                  {firstName.charAt(0)}
                </div>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            {imageUrl && imageUrl !== "/placeholder.svg" ? (
              <div className="aspect-square w-full overflow-hidden rounded-lg">
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square w-full flex items-center justify-center rounded-lg bg-[#19363C] text-white text-6xl font-semibold uppercase">
                {firstName.charAt(0)}
              </div>
            )}
          </DialogContent>
        </Dialog>
  
        <h1 className="text-3xl font-semibold text-[#2D3748] mb-3">{name}</h1>
  
        {joinedDate && (
          <p className="text-sm text-[#718096] mb-6">
            joined in {joinedDate}
          </p>
        )}
  
        {bio && (
          <div className="mt-2 mb-6 max-w-5xl mx-auto text-left px-3">
            <p className=" whitespace-pre-line">{bio}</p>
          </div>
        )}
      </div>
  
      {/* Links Section */}
      {socialLinks.length > 0 && (
        <Card className="mb-8 border border-[#19363C]/50 shadow-sm rounded-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3748]">Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={getValidURL(link.url)}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-[#718096] hover:text-[#2D3748] transition-colors group"
                >
                  {getSocialIcon(link.label)}
                  <span className="group-hover:underline">{link.url}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
  
      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a tip to {name}</DialogTitle>
          </DialogHeader>
          <TipForm authorId={authorId} onSuccess={() => setShowTipDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
  
};
