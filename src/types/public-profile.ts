
import { SocialLink } from "./author";

export interface PublicProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: SocialLink[] | null;
  created_at: string;
}

export interface PublicProfileResponse {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: SocialLink[] | null;
  created_at: string;
}

// Function to sync a private profile with its public version
export const syncProfileToPublic = async (profileId: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Fetch the private profile data first
  const { data: privateProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url, social_links, created_at')
    .eq('id', profileId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching private profile for sync:', fetchError);
    return { success: false, error: fetchError };
  }
  
  // Check if public profile already exists
  const { data: existingPublic, error: checkError } = await supabase
    .from('public_profiles')
    .select('id')
    .eq('id', profileId)
    .maybeSingle();
    
  if (checkError) {
    console.error('Error checking existing public profile:', checkError);
    return { success: false, error: checkError };
  }
  
  // Prepare public profile data
  const publicProfileData = {
    id: privateProfile.id,
    name: privateProfile.name,
    bio: privateProfile.bio,
    avatar_url: privateProfile.avatar_url,
    social_links: privateProfile.social_links
  };
  
  let result;
  
  // Insert or update as appropriate
  if (existingPublic) {
    // Update existing record
    result = await supabase
      .from('public_profiles')
      .update(publicProfileData)
      .eq('id', profileId);
  } else {
    // Insert new record
    result = await supabase
      .from('public_profiles')
      .insert(publicProfileData);
  }
  
  if (result.error) {
    console.error('Error syncing public profile:', result.error);
    return { success: false, error: result.error };
  }
  
  return { success: true };
};
