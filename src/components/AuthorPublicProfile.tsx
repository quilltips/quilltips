import { useState } from "react";
import { Linkedin, Twitter, Facebook, Instagram, Music2, ShoppingBag } from "lucide-react";
import { TipForm } from "./TipForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReleaseCountdown } from "@/components/author/ReleaseCountdown";

export interface SocialLink {
  url: string;
  label: string;
}

export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'amazon';

const getPlatformFromUrl = (url: string): SocialPlatform | null => {
  if (!url || typeof url !== 'string') return null;
  const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (normalized.includes('linkedin.com')) return 'linkedin';
  if (normalized.includes('x.com') || normalized.includes('twitter.com')) return 'twitter';
  if (normalized.includes('facebook.com') || normalized.includes('fb.com') || normalized.includes('fb.me')) return 'facebook';
  if (normalized.includes('instagram.com')) return 'instagram';
  if (normalized.includes('tiktok.com')) return 'tiktok';
  if (normalized.includes('amazon.com') || normalized.includes('amazon.')) return 'amazon';
  return null;
};

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

export const getSocialPlatformIcon = (platform: SocialPlatform, className = "h-5 w-5") => {
  switch (platform) {
    case 'linkedin': return <Linkedin className={`${className} text-[#0077B5]`} />;
    case 'twitter': return <Twitter className={`${className} text-[#1DA1F2]`} />;
    case 'facebook': return <Facebook className={`${className} text-[#4267B2]`} />;
    case 'instagram': return <Instagram className={`${className} text-[#E1306C]`} />;
    case 'tiktok': return <Music2 className={`${className} text-foreground`} />;
    case 'amazon': return <ShoppingBag className={`${className} text-[#B86B00]`} />;
    default: return null;
  }
};

export const getValidURL = (url: string): string => {
  if (!url) return '#';
  return url.match(/^https?:\/\//i) ? url : `https://${url}`;
};

/** Returns links that are not recognized social platforms (LinkedIn, X, Facebook, Instagram, TikTok, Amazon). */
export const getOtherLinks = (socialLinks: SocialLink[]): SocialLink[] => {
  if (!Array.isArray(socialLinks)) return [];
  return socialLinks.filter((link) => link && link.url?.trim() && getPlatformFromUrl(link.url) == null);
};

/** Returns links that are recognized social platforms, with platform type. */
export const getSocialIconLinks = (socialLinks: SocialLink[]): { url: string; platform: SocialPlatform }[] => {
  if (!Array.isArray(socialLinks)) return [];
  return socialLinks
    .filter((link) => link && link.url?.trim())
    .map((link) => ({ url: link.url, platform: getPlatformFromUrl(link.url) as SocialPlatform | null }))
    .filter((item): item is { url: string; platform: SocialPlatform } => item.platform != null);
};

/** Row of social platform icon links for use in Links section. */
export const SocialIconLinkRow = ({ links }: { links: { url: string; platform: SocialPlatform }[] }) => (
  <div className="flex flex-wrap justify-start items-center gap-4">
    {links.map((link, index) => (
      <a
        key={index}
        href={getValidURL(link.url)}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity ${
          link.platform === 'amazon' ? '' : 'justify-center w-10 h-10 rounded-full'
        }`}
        aria-label={link.platform}
      >
        {getSocialPlatformIcon(link.platform)}
        {link.platform === 'amazon' && (
          <span className="text-sm font-medium text-[#B86B00]">Amazon</span>
        )}
      </a>
    ))}
  </div>
);

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
            <button className="w-[173px] h-[173px] mb-4 rounded-full overflow-hidden border-2 border-[#f1f1f1] shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:ring-offset-2">
              {imageUrl && imageUrl !== "/placeholder.svg" ? (
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#19363C] text-[#FFD166] text-5xl font-semibold uppercase">
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
          <div className="mt-2 mb-2 max-w-5xl mx-auto text-left px-3">
            <p className="whitespace-pre-line">{bio}</p>
          </div>
        )}
      </div>

      {/* Release Countdown - appears after bio */}
      {showCountdown && (
        <ReleaseCountdown
          releaseDate={releaseDate!}
          bookTitle={releaseTitle!}
        />
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
