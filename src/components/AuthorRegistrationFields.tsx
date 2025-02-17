
import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus, Trash2, Camera, Globe, Twitter, Facebook, Share2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface SocialLink {
  url: string;
  label: string;
}

interface AuthorRegistrationFieldsProps {
  isLoading: boolean;
  onAvatarSelected: (file: File) => void;
}

const identifySocialPlatform = (url: string): string => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('x.com') || urlLower.includes('twitter.com')) return 'Twitter';
  if (urlLower.includes('facebook.com')) return 'Facebook';
  if (urlLower.includes('tiktok.com')) return 'TikTok';
  return 'Website';
};

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'Twitter':
      return <Twitter className="h-4 w-4 text-blue-400" />;
    case 'Facebook':
      return <Facebook className="h-4 w-4 text-blue-600" />;
    case 'TikTok':
      return <Share2 className="h-4 w-4 text-black" />;
    default:
      return <Globe className="h-4 w-4 text-gray-500" />;
  }
};

export const AuthorRegistrationFields = ({ isLoading, onAvatarSelected }: AuthorRegistrationFieldsProps) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');

  const addSocialLink = () => {
    if (!newUrl.trim()) return;
    
    const platform = identifySocialPlatform(newUrl);
    setSocialLinks([...socialLinks, { url: newUrl, label: platform }]);
    setNewUrl('');
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedFileName(file.name);
    onAvatarSelected(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSocialLink();
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarPreview || undefined} />
          <AvatarFallback>
            <Camera className="w-8 h-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2 text-center">
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
            id="avatar-upload"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={isLoading}
            className="hover:bg-[#FFD166]/10 hover:text-[#2D3748] hover:border-[#FFD166]"
          >
            {selectedFileName ? 'Change photo' : 'Add a photo'}
          </Button>
          {selectedFileName && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {selectedFileName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name as it appears on your books"
          required
          className="hover-lift text-left"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Short Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell readers a bit about yourself"
          required
          className="hover-lift text-left min-h-[120px] resize-none"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Social Links</Label>
        <input 
          type="hidden" 
          name="socialLinks" 
          value={JSON.stringify(socialLinks)} 
        />
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter social media or website URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addSocialLink}
            disabled={isLoading || !newUrl.trim()}
            className="shrink-0 bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 mt-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md animate-fadeIn">
              {getSocialIcon(link.label)}
              <span className="flex-1 text-sm truncate">{link.url}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSocialLink(index)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
