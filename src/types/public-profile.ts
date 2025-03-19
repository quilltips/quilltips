
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

// Function to manually sync a private profile with its public version
// This is now mostly a backup mechanism since automatic syncing is handled by the database trigger
export const syncProfileToPublic = async (profileId: string) => {
  // With the trigger in place, this function can be simplified to just
  // check if the public profile exists and force a refresh if needed
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    // Using type assertion to bypass strict type checking for RPC parameters
    const { data: existingPublic, error: checkError } = await (supabase.rpc as any)(
      'get_public_profile_by_id', 
      { profile_id: profileId }
    ) as RPCResponse<PublicProfile[]>;
      
    if (checkError) {
      console.error('Error checking existing public profile:', checkError);
      return { success: false, error: checkError };
    }
    
    // If public profile already exists, we're done (the trigger handles updates)
    if (existingPublic && Array.isArray(existingPublic) && existingPublic.length > 0) {
      return { success: true };
    }
    
    // If no public profile exists yet, fetch the private profile and create one
    const { data: privateProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, bio, avatar_url, social_links')
      .eq('id', profileId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching private profile for sync:', fetchError);
      return { success: false, error: fetchError };
    }
    
    // The trigger should handle this automatically, but just in case, we'll explicitly
    // insert a new public profile record
    // Using type assertion to bypass strict type checking for RPC parameters
    const result = await (supabase.rpc as any)(
      'insert_public_profile',
      {
        profile_id: profileId,
        profile_name: privateProfile.name,
        profile_bio: privateProfile.bio,
        profile_avatar_url: privateProfile.avatar_url,
        profile_social_links: privateProfile.social_links
      }
    ) as RPCResponse<any>;
    
    if (result.error) {
      console.error('Error creating public profile:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in syncProfileToPublic:', error);
    return { success: false, error };
  }
};
