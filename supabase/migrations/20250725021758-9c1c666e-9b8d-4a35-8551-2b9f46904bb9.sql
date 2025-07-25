-- Add public SELECT and UPDATE policies for newsletter_subscribers
-- This allows the newsletter signup component to handle duplicate emails by updating existing records

-- Add public SELECT policy to allow checking for existing subscribers
CREATE POLICY "Public can read newsletter subscribers" 
ON newsletter_subscribers 
FOR SELECT 
TO public
USING (true);

-- Add public UPDATE policy to allow updating existing subscribers (for handling duplicates)
CREATE POLICY "Public can update newsletter subscribers" 
ON newsletter_subscribers 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);