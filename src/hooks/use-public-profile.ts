
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AuthorProfile } from "@/types/author";

interface PublicProfileData {
  id: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  social_links: any | null;
  created_at?: string;
}

// Define types for RPC function responses
interface RPCResponse<T> {
  data: T | null;
  error: Error | null;
}

export const usePublicProfile = (id: string | undefined) => {
  return useQuery({
    queryKey: ['author-public-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('Author identifier is required');

      try {
        // First try UUID lookup in public profiles using RPC function
        if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          // Using type assertion to bypass strict type checking for RPC parameters
          const { data, error: uuidError } = await (supabase.rpc as any)(
            'get_public_profile_by_id', 
            { profile_id: id }
          ) as RPCResponse<PublicProfileData[]>;

          if (!uuidError && data && Array.isArray(data) && data.length > 0) {
            const profileData = data[0] as PublicProfileData;
            
            // Transform social links if needed and return
            return {
              id: profileData.id,
              name: profileData.name || 'Anonymous Author',
              bio: profileData.bio,
              avatar_url: profileData.avatar_url,
              social_links: Array.isArray(profileData.social_links) 
                ? profileData.social_links.map((link: any) => ({
                    url: String(link.url || ''),
                    label: String(link.label || 'Link')
                  }))
                : null,
              role: 'author' // Adding role to match existing interface
            } as AuthorProfile;
          }
        }

        // Then try name lookup using RPC function
        // Using type assertion to bypass strict type checking for RPC parameters
        const { data, error: nameError } = await (supabase.rpc as any)(
          'get_public_profile_by_name', 
          { profile_name: id.replace(/-/g, ' ') }
        ) as RPCResponse<PublicProfileData[]>;

        if (nameError) throw nameError;
        if (!data || !Array.isArray(data) || data.length === 0) throw new Error('Author not found');

        const profileData = data[0] as PublicProfileData;
        
        // Transform the data to match our expected format
        return {
          id: profileData.id,
          name: profileData.name || 'Anonymous Author',
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          social_links: Array.isArray(profileData.social_links) 
            ? profileData.social_links.map((link: any) => ({
                url: String(link.url || ''),
                label: String(link.label || 'Link')
              }))
            : null,
          role: 'author' // Adding role to match existing interface
        } as AuthorProfile;
      } catch (error) {
        console.error('Error fetching author:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
