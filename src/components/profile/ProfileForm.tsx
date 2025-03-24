
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2, Plus, Trash2, PenSquare, Save } from "lucide-react";
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
  onChangeStatus?: (hasChanges: boolean) => void;
}

export const ProfileForm = ({ 
  profileId, 
  initialName, 
  initialBio,
  initialSocialLinks = [],
  onChangeStatus
}: ProfileFormProps) => {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Check for changes whenever form values change
  useEffect(() => {
    const nameChanged = name !== initialName;
    const bioChanged = bio !== initialBio;
    
    // Compare social links (more complex comparison since it's an array of objects)
    const socialLinksChanged = JSON.stringify(socialLinks) !== JSON.stringify(initialSocialLinks);
    
    const newHasChanges = nameChanged || bioChanged || socialLinksChanged;
    setHasChanges(newHasChanges);
    
    // Notify parent component about change status if callback provided
    if (onChangeStatus) {
      onChangeStatus(newHasChanges);
    }
  }, [name, bio, socialLinks, initialName, initialBio, initialSocialLinks, onChangeStatus]);

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
      
      // Update the initialValues to match current values
      // This will cause the useEffect to recalculate hasChanges as false
      // since current values now match initial values
      setHasChanges(false);
      
      // Reset the change state through parent component if callback provided
      if (onChangeStatus) {
        onChangeStatus(false);
      }
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
    <form onSubmit={handleSubmit} className={`space-y-4 ${hasChanges ? 'relative' : ''}`}>
      {hasChanges && (
        <div className="absolute -top-4 right-0 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-md border border-amber-200 flex items-center gap-2 animate-pulse-slow">
          <PenSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Unsaved changes</span>
        </div>
      )}
      
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell readers about yourself"
          rows={4}
          className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
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
                className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
              />
              <Input
                placeholder="URL (e.g., https://your-website.com)"
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
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

      <Button 
        type="submit" 
        disabled={isLoading || !hasChanges}
        className={`${hasChanges ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : hasChanges ? (
          <Save className="mr-2 h-4 w-4" />
        ) : null}
        {hasChanges ? 'Save Changes' : 'Save Changes'}
      </Button>
    </form>
  );
};
