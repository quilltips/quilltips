-- SECURITY FIX: Remove overly permissive RLS policy that exposes all customer emails
-- Current issue: "Allow reading tips for unsubscribe verification" policy allows anyone to read ALL tips

-- First, drop the dangerous policy that allows public access to all tips
DROP POLICY IF EXISTS "Allow reading tips for unsubscribe verification" ON tips;

-- Create a secure policy that only allows unsubscribe access with valid tokens
-- This replaces the overly broad policy with a secure, token-based approach
CREATE POLICY "Allow reading tips only for valid unsubscribe tokens" 
ON tips 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM unsubscribe_tokens 
    WHERE unsubscribe_tokens.tip_id = tips.id 
    AND unsubscribe_tokens.expires_at > now()
  )
);

-- Ensure the public_tips table doesn't expose email addresses
-- Update the sync trigger to exclude reader_email from public_tips
CREATE OR REPLACE FUNCTION sync_to_public_tips()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    INSERT INTO public_tips (
      id, 
      qr_code_id,
      created_at, 
      message, 
      amount,
      reader_name,
      reader_avatar_url,
      is_private
      -- NOTE: deliberately excluding reader_email for security
    )
    VALUES (
      NEW.id, 
      NEW.qr_code_id,
      NEW.created_at, 
      NEW.message, 
      NEW.amount,
      NEW.reader_name,
      NEW.reader_avatar_url,
      NEW.is_private
      -- NOTE: deliberately excluding reader_email for security
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      qr_code_id = EXCLUDED.qr_code_id,
      message = EXCLUDED.message,
      amount = EXCLUDED.amount,
      reader_name = EXCLUDED.reader_name,
      reader_avatar_url = EXCLUDED.reader_avatar_url,
      is_private = EXCLUDED.is_private;
      -- NOTE: deliberately excluding reader_email for security

    RETURN NEW;

  -- For delete operations
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public_tips WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';