-- Fix RLS policies for newsletter signup
-- Remove the incorrectly named "Anyone can insert blog analytics" policy from newsletter_subscribers table
DROP POLICY IF EXISTS "Anyone can insert blog analytics" ON newsletter_subscribers;

-- Ensure blog_analytics table has the proper policy for inserting analytics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'blog_analytics' 
    AND policyname = 'Anyone can insert blog analytics'
  ) THEN
    CREATE POLICY "Anyone can insert blog analytics" 
    ON blog_analytics 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END
$$;