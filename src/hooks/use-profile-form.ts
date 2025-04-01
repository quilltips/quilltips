
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface SocialLink {
  url: string;
  label: string;
}

interface UseProfileFormProps {
  profileId: string;
  initialName: string;
  initialBio: string;
  initialSocialLinks: SocialLink[];
  onChangeStatus?: (hasChanges: boolean) => void;
}

export function useProfileForm({
  profileId,
  initialName,
  initialBio,
  initialSocialLinks,
  onChangeStatus
}: UseProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const nameChanged = name !== initialName;
    const bioChanged = bio !== initialBio;
    
    const socialLinksChanged = JSON.stringify(socialLinks) !== JSON.stringify(initialSocialLinks);
    
    const newHasChanges = nameChanged || bioChanged || socialLinksChanged;
    setHasChanges(newHasChanges);
    
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
      const socialLinksJson: Json = socialLinks.map(link => ({
        url: link.url,
        label: link.label
      }));

      // Update the main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name, 
          bio,
          social_links: socialLinksJson
        })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // Update the public profile directly
      const { error: publicProfileError } = await supabase
        .from('public_profiles')
        .update({ 
          name, 
          bio, 
          social_links: socialLinksJson 
        })
        .eq('id', profileId);

      if (publicProfileError) {
        console.warn("Failed to update public profile:", publicProfileError);
        // Don't throw here as the main profile was updated successfully
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setHasChanges(false);
      
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

  return {
    name,
    setName,
    bio,
    setBio,
    socialLinks,
    setSocialLinks,
    isLoading,
    hasChanges,
    addSocialLink,
    removeSocialLink,
    updateSocialLink,
    handleSubmit
  };
}
