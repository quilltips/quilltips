import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Plus, Trash2, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface SocialLink {
  url: string;
  label: string;
}

interface AuthorRegistrationFieldsProps {
  isLoading: boolean;
}

export const AuthorRegistrationFields = ({ isLoading }: AuthorRegistrationFieldsProps) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>
            <Camera className="w-8 h-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            id="avatar-upload"
            disabled={isLoading || isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={isLoading || isUploading}
          >
            {isUploading ? "Uploading..." : "Add a photo"}
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

      <input 
        type="hidden" 
        name="avatarUrl" 
        value={avatarUrl || ''} 
      />
    </div>
  );
};