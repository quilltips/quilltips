-- Fix security vulnerability: Remove public read access from profiles table
-- Drop the existing public read policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create new secure policies that restrict access to profile owners and admins
CREATE POLICY "Users can read their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" 
ON profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Keep existing policies for insert, update, and delete operations as they are already secure
-- These existing policies remain:
-- - "Enable insert for authenticated users only" (auth.uid() = id)
-- - "Users can insert their own profile" (auth.uid() = id) 
-- - "Users can update their own avatar" (auth.uid() = id)
-- - "Users can update their own profile" (auth.uid() = id)
-- - "Users can update their own stripe account" (auth.uid() = id)