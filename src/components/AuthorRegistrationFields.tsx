import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus, Trash2, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface SocialLink {
  url: string;
  label: string;
}

interface AuthorRegistrationFieldsProps {
  isLoading: boolean;
  onAvatarSelected: (file: File) => void;
}

export const AuthorRegistrationFields = ({ isLoading, onAvatarSelected }: AuthorRegistrationFieldsProps) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { url: "", label: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the avatar
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    onAvatarSelected(file);
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
        <div>
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
          >
            Add a photo
          </Button>
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
        
        {socialLinks.map((link, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Label (e.g., Website, Twitter)"
                value={link.label}
                onChange={(e) => updateSocialLink(index, "label", e.target.value)}
                disabled={isLoading}
              />
              <Input
                placeholder="URL (e.g., https://your-website.com)"
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSocialLink(index)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addSocialLink}
          disabled={isLoading}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Social Link
        </Button>
      </div>
    </div>
  );
};