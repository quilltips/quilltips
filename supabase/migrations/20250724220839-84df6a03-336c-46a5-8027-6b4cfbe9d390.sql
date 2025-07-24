-- Fix RLS policy for newsletter_subscribers table
-- Remove the existing incorrectly configured policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

-- Create a policy that explicitly allows the anon role to insert newsletter subscriptions
CREATE POLICY "Anyone can subscribe to newsletter"
ON newsletter_subscribers
FOR INSERT
TO anon
WITH CHECK (true);