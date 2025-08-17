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
          // Try UUID lookup from public_profiles with all fields
          const { data, error } = await supabase
            .from('public_profiles')
            .select('*')
            .eq('id', identifier)
            .maybeSingle();

          if (!error && data) {
            profileData = data;
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
          // Try slug lookup first from public_profiles
          const { data: slugData, error: slugError } = await supabase
            .from('public_profiles')
            .select('*')
            .eq('slug', identifier)
            .maybeSingle();

          if (!slugError && slugData) {
            profileData = slugData;
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
          created_at: profileData.created_at,
          // Include landing page settings
          next_release_date: profileData.next_release_date,
          next_release_title: profileData.next_release_title,
          countdown_enabled: profileData.countdown_enabled,
          arc_signup_enabled: profileData.arc_signup_enabled,
          arc_signup_description: profileData.arc_signup_description,
          beta_reader_enabled: profileData.beta_reader_enabled,
          beta_reader_description: profileData.beta_reader_description,
          newsletter_enabled: profileData.newsletter_enabled,
          newsletter_description: profileData.newsletter_description
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