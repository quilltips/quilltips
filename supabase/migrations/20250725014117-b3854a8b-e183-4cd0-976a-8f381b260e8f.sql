-- Fix newsletter subscription RLS policy to allow both anon and authenticated users
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

-- Create a new INSERT policy that explicitly allows both anon and authenticated users
CREATE POLICY "Allow anyone to subscribe to newsletter" 
ON newsletter_subscribers 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);