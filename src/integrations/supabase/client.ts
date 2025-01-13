import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrawynczvedffcvnympn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYXd5bmN6dmVkZmZjdm55bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzI0NzAsImV4cCI6MjAyNTQwODQ3MH0.qDPHvFHfIdxuOxM7QB8RYY-pWqBHqPVbxHNDGZWU5Oc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});