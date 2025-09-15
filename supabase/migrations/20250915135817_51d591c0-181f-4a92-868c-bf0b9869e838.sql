-- Update the auto_generate_profile_slug function to handle placeholder name transitions
CREATE OR REPLACE FUNCTION public.auto_generate_profile_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug TEXT;
  is_placeholder_transition BOOLEAN := false;
BEGIN
  -- Check if this is a transition from placeholder to real name
  IF TG_OP = 'UPDATE' THEN
    -- Detect if OLD name matches placeholder pattern (Author + 8 chars) and NEW name doesn't
    is_placeholder_transition := (
      OLD.name ~ '^Author[a-zA-Z0-9]{8}$' AND 
      NOT (NEW.name ~ '^Author[a-zA-Z0-9]{8}$')
    );
  END IF;

  -- Generate slug if:
  -- 1. INSERT and slug is null
  -- 2. UPDATE and name changed and slug is null  
  -- 3. UPDATE transitioning from placeholder name (force regeneration)
  IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR 
     (TG_OP = 'UPDATE' AND NEW.name IS DISTINCT FROM OLD.name AND NEW.slug IS NULL) OR
     (TG_OP = 'UPDATE' AND is_placeholder_transition) THEN
    
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
      base_slug := generate_url_slug(NEW.name);
      NEW.slug := ensure_unique_profile_slug(base_slug, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;