-- Fix RLS policies for newsletter signup
-- Remove the incorrectly named "Anyone can insert blog analytics" policy from newsletter_subscribers table
DROP POLICY IF EXISTS "Anyone can insert blog analytics" ON newsletter_subscribers;

-- Ensure the correct policy exists for newsletter subscribers
CREATE POLICY IF NOT EXISTS "Anyone can subscribe to newsletter" 
ON newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- Ensure blog_analytics table has the proper policy for inserting analytics
CREATE POLICY IF NOT EXISTS "Anyone can insert blog analytics" 
ON blog_analytics 
FOR INSERT 
WITH CHECK (true);