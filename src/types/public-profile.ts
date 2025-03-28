
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

    // Check if public profile exists
    const { data: existingPublicProfile, error: checkError } = await supabase
      .from('public_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking public profile:", checkError);
      return { success: false, error: checkError.message };
    }

    // If public profile exists, update it, otherwise insert a new one
    if (existingPublicProfile) {
      const { error: updateError } = await supabase
        .from('public_profiles')
        .update({
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          social_links: profile.social_links
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating public profile:", updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase
        .from('public_profiles')
        .insert({
          id: userId,
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          social_links: profile.social_links
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
