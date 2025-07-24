-- Fix RLS policy for newsletter_subscribers table
-- Remove the existing incorrectly configured policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

-- Create a properly configured policy that allows anyone to insert newsletter subscriptions
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);