
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe, Twitter, Facebook, Instagram, Share2 } from "lucide-react";
import { TipForm } from "./TipForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export const AuthorPublicProfileView = ({
  name,
  bio,
  imageUrl,
  socialLinks = [],
  authorId
}: AuthorPublicProfileProps) => {
  const [showTipDialog, setShowTipDialog] = useState(false);
  const firstName = getFirstName(name);
  
  return <>
      {/* Author Header Section */}
      <div className="flex flex-col items-center text-center mb-8">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-28 h-28 mb-4 rounded-full overflow-hidden border-2 border-[#f1f1f1] shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:ring-offset-2">
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <div className="aspect-square w-full overflow-hidden rounded-lg">
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>
          </DialogContent>
        </Dialog>
        
        <h1 className="text-2xl font-semibold text-[#2D3748] mb-2">{name}</h1>
        
        {/* Bio Section - Moved up from About section */}
        {bio && (
          <div className="mt-4 mb-6 max-w-md">
            <div className="inline-block bg-[#19363C] text-white py-1 px-4 rounded-full mb-3">
              Bio
            </div>
            <p className="text-[#718096]">{bio}</p>
          </div>
        )}
      </div>

      {/* Links Section - Previously part of About section */}
      {socialLinks.length > 0 && (
        <Card className="mb-8 border border-black shadow-sm rounded-lg overflow-hidden" prominent>
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3748]">Connect with {firstName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.url} 
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
    </>;
};
