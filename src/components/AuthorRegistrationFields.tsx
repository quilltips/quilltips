import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Plus, Trash2, Camera, Globe, Twitter, Facebook, Share2, HelpCircle, X, Edit } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
  url: string;
  label: string;
}

interface AuthorRegistrationFieldsProps {
  isLoading: boolean;
  onAvatarSelected: (file: File | null) => void;
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

const truncateFilename = (filename: string, maxLength: number = 25): string => {
  if (!filename || filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop() || '';
  const nameWithoutExt = filename.substring(0, filename.length - extension.length - 1);
  
  const truncatedName = nameWithoutExt.substring(0, maxLength - 3 - extension.length);
  return `${truncatedName}...${extension}`;
};

export const AuthorRegistrationFields = ({ isLoading, onAvatarSelected }: AuthorRegistrationFieldsProps) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bioValue, setBioValue] = useState("");
  const { toast } = useToast();

  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const addSocialLink = () => {
    if (!newUrl.trim()) return;
    
    const platform = identifySocialPlatform(newUrl);
    setSocialLinks([...socialLinks, { url: newUrl, label: platform }]);
    setNewUrl('');
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const validateImageFile = (file: File): boolean => {
    setError(null);

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}. Please upload a JPG, PNG, GIF, WebP or SVG image.`);
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, WebP or SVG image",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 5MB.`);
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedFileName(file.name);
    setSelectedFile(file);
    onAvatarSelected(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setSelectedFileName(null);
    setSelectedFile(null);
    onAvatarSelected(null);
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditAvatar = () => {
    document.getElementById('avatar-upload')?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSocialLink();
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 1000);
    setBioValue(val);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col items-center space-y-4">
        <label htmlFor="avatar-upload" className="flex flex-col items-center gap-2 cursor-pointer group">
          <div className="relative">
            <Avatar className="w-24 h-24 transition">
              <AvatarImage src={avatarPreview || undefined} alt="Profile picture" className="object-cover" />
              <AvatarFallback>
                <Camera className="w-8 h-8 text-[#2D3748]" />
              </AvatarFallback>
            </Avatar>
            {avatarPreview && (
              <div className="absolute -top-2 -right-2 flex gap-1">
                <Button type="button" variant="destructive" size="icon" className="h-6 w-6 rounded-full" onClick={handleRemoveAvatar} disabled={isLoading}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <span className="text-sm text-[#2D3748] group-hover:underline flex items-center justify-center gap-1">
            {avatarPreview ? (
              <><Edit className="h-3.5 w-3.5" /> Change photo</>
            ) : (
              <>Add a photo</>
            )}
          </span>
        </label>

        <Input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" id="avatar-upload" disabled={isLoading} />

        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="name">Enter your full name</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  We need your full name for verification purposes.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="name"
          name="name"
          placeholder="Your name as it appears on your books"
          required
          className="text-left"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Enter your bio (optional)</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell readers a bit about yourself"
          className=" text-left min-h-[120px] resize-none border border-[#333333]"
          disabled={isLoading}
          value={bioValue}
          onChange={handleBioChange}
          maxLength={1000}
        />
        <div className="text-xs text-right text-muted-foreground">
          {bioValue.length}/1000
        </div>
      </div>

      <div className="space-y-2">
        <Label>Enter your website or social media links (optional)</Label>
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
            className="shrink-0 bg-transparent border border-[#333333] hover:bg-[#FFD166]/80 text-[#33333] px-3 py-2 flex items-center justify-center hover:shadow-none"
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
                onClick={() => removeSocialLink(index)}
                disabled={isLoading}
                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-100 rounded-md"
                variant="ghost"
                size="icon"
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
