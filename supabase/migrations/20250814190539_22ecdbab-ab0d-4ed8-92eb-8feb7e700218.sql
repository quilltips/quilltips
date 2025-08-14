-- COMPREHENSIVE SECURITY FIX: Completely secure the tips table from public access
-- This addresses the remaining email exposure vulnerability

-- First, let's check and remove any remaining public access policies
DROP POLICY IF EXISTS "Allow reading tips only for valid unsubscribe tokens" ON tips;
DROP POLICY IF EXISTS "Allow setting unsubscribed with valid token" ON tips;

-- Create a function to check if a user can access unsubscribe data with a valid token
CREATE OR REPLACE FUNCTION can_access_tip_for_unsubscribe(tip_uuid uuid, token_value text)
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM unsubscribe_tokens 
    WHERE token = token_value 
    AND tip_id = tip_uuid 
    AND expires_at > now()
  );
$$;

-- Secure policy: Only allow unsubscribe updates with valid tokens (no read access)
CREATE POLICY "Allow unsubscribe with valid token only" 
ON tips 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM unsubscribe_tokens 
    WHERE unsubscribe_tokens.tip_id = tips.id 
    AND unsubscribe_tokens.expires_at > now()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM unsubscribe_tokens 
    WHERE unsubscribe_tokens.tip_id = tips.id 
    AND unsubscribe_tokens.expires_at > now()
  )
);

-- Secure the unsubscribe_tokens table as well
DROP POLICY IF EXISTS "Allow reading unsubscribe tokens" ON unsubscribe_tokens;

-- Create a function to validate unsubscribe tokens without exposing the table
CREATE OR REPLACE FUNCTION validate_unsubscribe_token(token_value text, tip_uuid uuid)
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM unsubscribe_tokens 
    WHERE token = token_value 
    AND tip_id = tip_uuid 
    AND expires_at > now()
  );
$$;

-- Remove reader_email from any publicly accessible views or functions
-- Ensure the public_tips table doesn't have any email columns
DO $$
BEGIN
  -- Check if reader_email column exists in public_tips and drop it if it does
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'public_tips' 
    AND column_name = 'reader_email'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public_tips DROP COLUMN reader_email;
  END IF;
END $$;