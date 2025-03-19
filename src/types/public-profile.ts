
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

// Define types for RPC function responses
interface RPCResponse<T> {
  data: T | null;
  error: Error | null;
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
  // Use type assertion at the function call level to bypass parameter type checking
  const checkProfileFn = supabase.rpc;
  const { data: existingPublic, error: checkError } = await (checkProfileFn as any)('get_public_profile_by_id', { 
    profile_id: profileId 
  }) as RPCResponse<PublicProfile[]>;
    
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
  if (existingPublic && Array.isArray(existingPublic) && existingPublic.length > 0) {
    // Update existing record using function reference to bypass type checking
    const updateFn = supabase.rpc;
    result = await (updateFn as any)('update_public_profile', {
      profile_id: profileId,
      profile_name: privateProfile.name,
      profile_bio: privateProfile.bio,
      profile_avatar_url: privateProfile.avatar_url,
      profile_social_links: privateProfile.social_links
    }) as RPCResponse<any>;
  } else {
    // Insert new record using function reference to bypass type checking
    const insertFn = supabase.rpc;
    result = await (insertFn as any)('insert_public_profile', {
      profile_id: profileId,
      profile_name: privateProfile.name,
      profile_bio: privateProfile.bio,
      profile_avatar_url: privateProfile.avatar_url,
      profile_social_links: privateProfile.social_links
    }) as RPCResponse<any>;
  }
  
  if (result.error) {
    console.error('Error syncing public profile:', result.error);
    return { success: false, error: result.error };
  }
  
  return { success: true };
};
