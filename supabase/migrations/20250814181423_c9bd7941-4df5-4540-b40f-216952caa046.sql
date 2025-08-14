-- Fix email-based slugs by resetting them to NULL for regeneration
-- This identifies profiles where the slug contains common email patterns
UPDATE profiles 
SET slug = NULL
WHERE slug ~ '(gmail|yahoo|hotmail|outlook|icloud|live|msn|aol|comcast)';

-- Also update public_profiles table for consistency
UPDATE public_profiles 
SET slug = NULL
WHERE slug ~ '(gmail|yahoo|hotmail|outlook|icloud|live|msn|aol|comcast)';

-- Update the sync trigger to include slug field
CREATE OR REPLACE FUNCTION sync_profile_to_public_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Check if a record already exists in public_profiles
    IF EXISTS (SELECT 1 FROM public_profiles WHERE id = NEW.id) THEN
      -- Update existing record including slug
      UPDATE public_profiles
      SET
        name = NEW.name,
        bio = NEW.bio,
        avatar_url = NEW.avatar_url,
        social_links = NEW.social_links,
        slug = NEW.slug
      WHERE id = NEW.id;
    ELSE
      -- Insert new record including slug
      INSERT INTO public_profiles (id, name, bio, avatar_url, social_links, slug)
      VALUES (NEW.id, NEW.name, NEW.bio, NEW.avatar_url, NEW.social_links, NEW.slug);
    END IF;
    RETURN NEW;
  
  -- For delete operations
  ELSIF (TG_OP = 'DELETE') THEN
    -- Delete the corresponding public profile
    DELETE FROM public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;