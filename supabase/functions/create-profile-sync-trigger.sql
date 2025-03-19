
-- Create or replace trigger function to sync profiles to public_profiles
CREATE OR REPLACE FUNCTION sync_profile_to_public_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Check if a record already exists in public_profiles
    IF EXISTS (SELECT 1 FROM public_profiles WHERE id = NEW.id) THEN
      -- Update existing record
      UPDATE public_profiles
      SET
        name = NEW.name,
        bio = NEW.bio,
        avatar_url = NEW.avatar_url,
        social_links = NEW.social_links
      WHERE id = NEW.id;
    ELSE
      -- Insert new record
      INSERT INTO public_profiles (id, name, bio, avatar_url, social_links)
      VALUES (NEW.id, NEW.name, NEW.bio, NEW.avatar_url, NEW.social_links);
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

-- Create the trigger on the profiles table
DROP TRIGGER IF EXISTS sync_profile_trigger ON profiles;
CREATE TRIGGER sync_profile_trigger
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION sync_profile_to_public_profile();

-- Sync existing profiles to public_profiles
INSERT INTO public_profiles (id, name, bio, avatar_url, social_links)
SELECT id, name, bio, avatar_url, social_links
FROM profiles
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  social_links = EXCLUDED.social_links;
