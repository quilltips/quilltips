
import { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { syncProfileToPublic } from "@/types/public-profile";

interface SocialLink {
  url: string;
  label: string;
}

interface ProfileFormProps {
  profileId: string;
  initialName: string;
  initialBio: string;
  initialSocialLinks?: SocialLink[];
}

export const ProfileForm = ({ 
  profileId, 
  initialName, 
  initialBio,
  initialSocialLinks = []
}: ProfileFormProps) => {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert socialLinks to a format that matches the Json type
      const socialLinksJson: Json = socialLinks.map(link => ({
        url: link.url,
        label: link.label
      }));

      const { error } = await supabase
        .from('profiles')
        .update({ 
          name, 
          bio,
          social_links: socialLinksJson
        })
        .eq('id', profileId);

      if (error) throw error;

      // Sync profile changes to public profile
      const syncResult = await syncProfileToPublic(profileId);
      if (!syncResult.success) {
        console.warn("Profile updated but public profile sync failed:", syncResult.error);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell readers about yourself"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Social Links</Label>
        {socialLinks.map((link, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Label (e.g., Website, Twitter)"
                value={link.label}
                onChange={(e) => updateSocialLink(index, "label", e.target.value)}
              />
              <Input
                placeholder="URL (e.g., https://your-website.com)"
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSocialLink(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addSocialLink}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Social Link
        </Button>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
};
