import { supabase } from "@/integrations/supabase/client";

export type SyncProfileResult = {
  success: boolean;
  error?: string;
};

export async function syncProfileToPublic(userId: string): Promise<SyncProfileResult> {
  console.warn("syncProfileToPublic is deprecated and will be removed in a future update");
  return { success: true };
}
