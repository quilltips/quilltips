
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qrawynczvedffcvnympn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYXd5bmN6dmVkZmZjdm55bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MjkzMDYsImV4cCI6MjA1MTUwNTMwNn0.opmDX2YSipmHmthISCg7mOXmxgCGiqAPUNrhYYcZPLo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'quilltips-auth',
    storage: window.localStorage,
    detectSessionInUrl: false, // Changed to false to prevent URL-based session detection
    autoRefreshToken: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'quilltips-web'
    }
  }
});

// Add a listener for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
