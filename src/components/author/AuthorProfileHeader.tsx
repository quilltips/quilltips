
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { AuthorProfile } from "@/types/author";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthorProfileHeaderProps {
  author: AuthorProfile;
}

interface LandingPageSettings {
  next_release_date: string | null;
  next_release_title: string | null;
}

export const AuthorProfileHeader = ({ author }: AuthorProfileHeaderProps) => {
  const [landingPageSettings, setLandingPageSettings] = useState<LandingPageSettings | null>(null);
  
  // Extract year from created_at if available, safely handling the optional property
  const joinedYear = author.created_at && author.created_at.trim() !== '' 
    ? new Date(author.created_at).getFullYear().toString() 
    : undefined;

  useEffect(() => {
    const fetchLandingPageSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('public_profiles')
          .select(`
            next_release_date,
            next_release_title
          `)
          .eq('id', author.id)
          .single();

        if (error) throw error;
        
        setLandingPageSettings({
          next_release_date: data.next_release_date || null,
          next_release_title: data.next_release_title || null,
        });
      } catch (error) {
        console.error('Error fetching landing page settings:', error);
      }
    };

    fetchLandingPageSettings();
  }, [author.id]);
  
  return (
    <AuthorPublicProfileView
      name={author.name || 'Anonymous Author'}
      bio={author.bio || 'No bio available'}
      imageUrl={author.avatar_url || undefined }
      authorId={author.id}
      socialLinks={author.social_links || []}
      joinedDate={joinedYear}
      releaseDate={landingPageSettings?.next_release_date || null}
      releaseTitle={landingPageSettings?.next_release_title || null}
    />
  );
};
