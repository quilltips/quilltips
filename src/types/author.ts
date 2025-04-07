
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
  created_at?: string; // Added the created_at field as optional
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
  let socialLinks: SocialLink[] = [];
  
  if (Array.isArray(profile.social_links)) {
    socialLinks = ((profile.social_links as unknown) as DatabaseSocialLink[]).map(link => ({
      url: link.url || '',
      label: link.label || link.platform || 'Link'
    }));
  }
  
  return {
    ...profile,
    social_links: socialLinks.length > 0 ? socialLinks : null
  };
};
