-- Add slug column to public_profiles table
ALTER TABLE public_profiles ADD COLUMN slug TEXT UNIQUE;

-- Update public_profiles with slugs from profiles table
UPDATE public_profiles 
SET slug = profiles.slug 
FROM profiles 
WHERE public_profiles.id = profiles.id;

-- Update the sync trigger to include slug
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
        social_links = NEW.social_links,
        slug = NEW.slug
      WHERE id = NEW.id;
    ELSE
      -- Insert new record
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create function to get a public profile by slug
CREATE OR REPLACE FUNCTION get_public_profile_by_slug(profile_slug TEXT)
RETURNS SETOF public_profiles
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT * FROM public_profiles WHERE slug = profile_slug;
$$;