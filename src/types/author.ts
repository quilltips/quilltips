
import { Json } from "@/integrations/supabase/types";

export interface SocialLink {
  url: string;
  label: string;
}

export interface DatabaseSocialLink {
  url: string;
  platform?: string;
  label?: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: SocialLink[] | null;
  role: string;
}

export interface DatabaseProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: Json;
  role: string;
}

export const transformSocialLinks = (profile: DatabaseProfile): AuthorProfile => {
  const socialLinks = profile.social_links as DatabaseSocialLink[] | null;
  
  return {
    ...profile,
    social_links: Array.isArray(socialLinks) 
      ? socialLinks.map(link => ({
          url: link.url,
          label: link.label || link.platform || 'Link'
        }))
      : []
  };
};
