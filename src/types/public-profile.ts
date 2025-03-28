
import { supabase } from "@/integrations/supabase/client";

export type SyncProfileResult = {
  success: boolean;
  error?: string;
};

export async function syncProfileToPublic(userId: string): Promise<SyncProfileResult> {
  try {
    // Get the current profile data
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!profile) {
      console.error("Profile not found");
      return { success: false, error: "Profile not found" };
    }

    // Use Supabase RPC to call our SQL functions instead of direct table operations
    // First check if the profile exists using a custom RPC call
    const { data: existingProfile, error: checkError } = await supabase
      .rpc('get_public_profile_by_id', { profile_id: userId });

    if (checkError) {
      console.error("Error checking public profile:", checkError);
      return { success: false, error: checkError.message };
    }

    // Ensure social_links is a valid JSON object
    let socialLinks = profile.social_links;
    if (!socialLinks) {
      socialLinks = [];
    }
    
    // If public profile exists, update it, otherwise insert a new one
    if (existingProfile && existingProfile.length > 0) {
      const { error: updateError } = await supabase
        .rpc('update_public_profile', {
          profile_id: userId,
          profile_name: profile.name || '',
          profile_bio: profile.bio || '',
          profile_avatar_url: profile.avatar_url || '',
          profile_social_links: socialLinks
        });

      if (updateError) {
        console.error("Error updating public profile:", updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase
        .rpc('insert_public_profile', {
          profile_id: userId,
          profile_name: profile.name || '',
          profile_bio: profile.bio || '',
          profile_avatar_url: profile.avatar_url || '',
          profile_social_links: socialLinks
        });

      if (insertError) {
        console.error("Error inserting public profile:", insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error syncing profile:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
