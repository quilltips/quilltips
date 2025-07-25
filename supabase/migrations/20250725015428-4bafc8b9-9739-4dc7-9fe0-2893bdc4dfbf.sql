-- Complete RLS policy reset for newsletter_subscribers table
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow anyone to subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

-- Verify RLS is enabled
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create a very simple, permissive INSERT policy for testing
CREATE POLICY "Newsletter subscription insert policy" 
ON newsletter_subscribers 
FOR INSERT 
TO public
WITH CHECK (true);

-- Add a SELECT policy for admins to view subscribers
CREATE POLICY "Admin can view newsletter subscribers" 
ON newsletter_subscribers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add an UPDATE policy for admins to manage subscribers  
CREATE POLICY "Admin can update newsletter subscribers" 
ON newsletter_subscribers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Check for any constraints that might interfere
-- Ensure email field allows duplicates by checking for unique constraints
-- (We'll handle duplicates in application logic with ON CONFLICT)