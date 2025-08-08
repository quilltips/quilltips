import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AuthorProfile } from "@/types/author";

// Helper function to check if string is a UUID
const isUUID = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const usePublicProfile = (identifier: string | undefined) => {
  return useQuery({
    queryKey: ['author-public-profile', identifier],
    queryFn: async (): Promise<AuthorProfile> => {
      if (!identifier) throw new Error('Author identifier is required');

      try {
        let profileData: any = null;

        if (isUUID(identifier)) {
          // Try UUID lookup using RPC function (public_profiles)
          const { data, error } = await supabase.rpc('get_public_profile_by_id', { 
            profile_id: identifier 
          });

          if (!error && data && Array.isArray(data) && data.length > 0) {
            profileData = data[0];
          }

          // Fallback: if no public profile, read from profiles directly
          if (!profileData) {
            const { data: prof, error: profErr } = await supabase
              .from('profiles')
              .select('id, name, bio, avatar_url, created_at')
              .eq('id', identifier)
              .maybeSingle();
            if (!profErr && prof) profileData = prof;
          }
        } else {
          // Try slug lookup first using RPC function
          const { data: slugData, error: slugError } = await supabase.rpc('get_public_profile_by_slug', { 
            profile_slug: identifier 
          });

          if (!slugError && slugData && Array.isArray(slugData) && slugData.length > 0) {
            profileData = slugData[0];
          }

          // Fallback: fuzzy name match in public_profiles
          if (!profileData) {
            const nameQuery = identifier.replace(/-/g, ' ').trim();
            const { data: fuzzyPublic, error: fuzzyPublicErr } = await supabase
              .from('public_profiles')
              .select('*')
              .ilike('name', `%${nameQuery}%`)
              .limit(1);
            if (!fuzzyPublicErr && fuzzyPublic && fuzzyPublic.length > 0) {
              profileData = fuzzyPublic[0];
            }
          }

          // Fallback: check profiles by slug or fuzzy name
          if (!profileData) {
            const nameQuery = identifier.replace(/-/g, ' ').trim();
            const { data: profList, error: profErr } = await supabase
              .from('profiles')
              .select('id, name, bio, avatar_url, created_at, slug')
              .or(`slug.eq.${identifier},name.ilike.%${nameQuery}%`)
              .limit(1);
            if (!profErr && profList && profList.length > 0) {
              profileData = profList[0];
            }
          }
        }

        if (!profileData) {
          throw new Error('Author not found');
        }
        
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
          role: 'author',
          created_at: profileData.created_at
        };
      } catch (error) {
        console.error('Error fetching author:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};