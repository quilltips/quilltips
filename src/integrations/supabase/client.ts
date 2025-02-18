
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qrawynczvedffcvnympn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYXd5bmN6dmVkZmZjdm55bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjkzMDYsImV4cCI6MjA1MTUwNTMwNn0.opmDX2YSipmHmthISCg7mOXmxgCGiqAPUNrhYYcZPLo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'quilltips-auth',
    storage: window.localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
