
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

const ensureValidURL = (url: string): string => {
  if (!url) return url;
  
  // If URL already has a protocol, return as is
  if (url.match(/^https?:\/\//i)) return url;
  
  // Add https:// as default protocol
  return `https://${url}`;
};

export function useProfileForm({
  profileId,
  initialName,
  initialBio,
  initialSocialLinks,
  onChangeStatus
}: UseProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // Track the current values that represent "saved" state
  const [savedName, setSavedName] = useState(initialName);
  const [savedBio, setSavedBio] = useState(initialBio);
  const [savedSocialLinks, setSavedSocialLinks] = useState<SocialLink[]>(initialSocialLinks || []);
  const { toast } = useToast();

  useEffect(() => {
    // Compare current values against saved values instead of initial values
    const nameChanged = name !== savedName;
    const bioChanged = bio !== savedBio;
    
    const socialLinksChanged = JSON.stringify(socialLinks) !== JSON.stringify(savedSocialLinks);
    
    const newHasChanges = nameChanged || bioChanged || socialLinksChanged;
    setHasChanges(newHasChanges);
    
    if (onChangeStatus) {
      onChangeStatus(newHasChanges);
    }
  }, [name, bio, socialLinks, savedName, savedBio, savedSocialLinks, onChangeStatus]);

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { url: "", label: "" }]);
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
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
      // Filter out incomplete social links and ensure valid URLs
      const filteredLinks = socialLinks
        .filter(link => link.url.trim() !== '' || link.label.trim() !== '')
        .map(link => ({
          url: ensureValidURL(link.url.trim()),
          label: link.label.trim() || new URL(ensureValidURL(link.url.trim())).hostname.replace(/^www\./, '')
        }));

      const socialLinksJson: Json = filteredLinks;

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
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // After a successful save, update our "saved" state references
      setSavedName(name);
      setSavedBio(bio);
      setSavedSocialLinks(filteredLinks);
      
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
