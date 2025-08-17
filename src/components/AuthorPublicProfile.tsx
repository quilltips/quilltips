
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Globe, Twitter, Facebook, Instagram, Share2 } from "lucide-react";
import { TipForm } from "./TipForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReleaseCountdown } from "@/components/author/ReleaseCountdown";

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
  releaseDate?: string | null;
  releaseTitle?: string | null;
  countdownEnabled?: boolean;
}

const getFirstName = (fullName: string): string => {
  return fullName.split(' ')[0] || fullName;
};

const getSocialIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  const iconClass = "h-4 w-4 flex-shrink-0 flex items-center justify-center";
  
  if (lowerLabel.includes('twitter')) return <Twitter className={`${iconClass} text-[#1DA1F2]`} />;
  if (lowerLabel.includes('facebook')) return <Facebook className={`${iconClass} text-[#4267B2]`} />;
  if (lowerLabel.includes('instagram')) return <Instagram className={`${iconClass} text-[#E1306C]`} />;
  if (lowerLabel.includes('tiktok')) return <Share2 className={`${iconClass} text-black`} />;
  if (lowerLabel.includes('linkedin')) return <Globe className={`${iconClass} text-[#0077B5]`} />;
  if (lowerLabel.includes('youtube')) return <Globe className={`${iconClass} text-[#FF0000]`} />;
  return <Globe className={`${iconClass} text-gray-500`} />;
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
  joinedDate,
  releaseDate,
  releaseTitle,
  countdownEnabled = true
}: AuthorPublicProfileProps) => {
  const [showTipDialog, setShowTipDialog] = useState(false);
  const firstName = getFirstName(name);
  
  // Show countdown if enabled, we have release date and title, and date is in the future
  const showCountdown = countdownEnabled && 
                       releaseDate && 
                       releaseTitle && 
                       new Date(releaseDate) > new Date();
  
  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8">
      {/* Author Header Section */}
      <div className="flex flex-col items-center text-center">
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-48 h-48 mb-4 rounded-full overflow-hidden border-2 border-[#f1f1f1] shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:ring-offset-2">
              {imageUrl && imageUrl !== "/placeholder.svg" ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#19363C] text-[#FFD166] text-6xl font-semibold uppercase">
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

      {/* Release Countdown - appears after bio, before links */}
      {showCountdown && (
        <ReleaseCountdown 
          releaseDate={releaseDate!}
          bookTitle={releaseTitle!}
        />
      )}
  
      {/* Links Section */}
      {socialLinks.length > 0 && (
        <Card className="mb-8 border border-[#19363C]/50 shadow-sm rounded-xl overflow-hidden bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold text-[#333333] flex items-center gap-2">
             
              Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={getValidURL(link.url)}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200 flex-shrink-0">
                    <div className="flex items-center justify-center w-full h-full">
                      {getSocialIcon(link.label)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 truncate leading-relaxed py-0.5">
                    {link.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                  </span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
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
