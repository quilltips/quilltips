-- Fix security vulnerability: Restrict newsletter_subscribers read access to admins only
-- Drop the existing public read policy
DROP POLICY IF EXISTS "Public can read newsletter subscribers" ON newsletter_subscribers;

-- Create new policy that only allows admins to read newsletter subscribers
CREATE POLICY "Only admins can read newsletter subscribers" 
ON newsletter_subscribers 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Keep the existing INSERT policy for public newsletter signups
-- Keep the existing UPDATE policy for unsubscribe functionality