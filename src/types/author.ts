
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
  // Landing page settings (from public_profiles)
  next_release_date?: string | null;
  next_release_title?: string | null;
  arc_signup_enabled?: boolean;
  arc_signup_description?: string | null;
  beta_reader_enabled?: boolean;
  beta_reader_description?: string | null;
  newsletter_enabled?: boolean;
  newsletter_description?: string | null;
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
