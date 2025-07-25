-- Fix RLS policies for newsletter_subscribers table
-- Drop the overly broad ALL policy that's causing conflicts
DROP POLICY IF EXISTS "Only admins can manage newsletter subscribers" ON newsletter_subscribers;

-- Create specific admin policies instead of the broad ALL policy
-- This prevents conflicts with the INSERT policy for anon users

-- Allow admins to view all newsletter subscribers
CREATE POLICY "Admins can view newsletter subscribers" 
ON newsletter_subscribers 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Allow admins to update newsletter subscribers
CREATE POLICY "Admins can update newsletter subscribers" 
ON newsletter_subscribers 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Allow admins to delete newsletter subscribers
CREATE POLICY "Admins can delete newsletter subscribers" 
ON newsletter_subscribers 
FOR DELETE 
TO authenticated
USING (is_admin(auth.uid()));