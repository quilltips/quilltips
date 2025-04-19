
-- Drop the old function if it exists
DROP FUNCTION IF EXISTS check_tip_rate_limit;

-- Create the fixed rate limit function with properly named parameters
CREATE OR REPLACE FUNCTION public.check_tip_rate_limit(email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  window_minutes INTEGER := 60; -- 1 hour window
  max_attempts INTEGER := 10;   -- Maximum 10 attempts per hour
  current_attempts INTEGER;
  first_attempt TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get or create rate limit record
  INSERT INTO tip_rate_limits (email)
  VALUES (email)
  ON CONFLICT (email) DO UPDATE
  SET 
    attempts = tip_rate_limits.attempts + 1,
    last_attempt_at = now()
  RETURNING attempts, first_attempt_at INTO current_attempts, first_attempt;

  -- Reset counter if window has passed
  IF first_attempt + (window_minutes || ' minutes')::interval < now() THEN
    UPDATE tip_rate_limits
    SET 
      attempts = 1,
      first_attempt_at = now(),
      last_attempt_at = now()
    WHERE email = email;
    RETURN TRUE;
  END IF;

  -- Check if under limit
  RETURN current_attempts <= max_attempts;
END;
$$;
