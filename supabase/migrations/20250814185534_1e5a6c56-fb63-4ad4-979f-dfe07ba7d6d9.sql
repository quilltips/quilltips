-- Add Stripe fields to public_profiles table
ALTER TABLE public_profiles 
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN stripe_setup_complete BOOLEAN DEFAULT false;

-- Update the trigger function to include Stripe fields
CREATE OR REPLACE FUNCTION sync_profile_to_public_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Check if a record already exists in public_profiles
    IF EXISTS (SELECT 1 FROM public_profiles WHERE id = NEW.id) THEN
      -- Update existing record including slug and Stripe fields
      UPDATE public_profiles
      SET
        name = NEW.name,
        bio = NEW.bio,
        avatar_url = NEW.avatar_url,
        social_links = NEW.social_links,
        slug = NEW.slug,
        stripe_account_id = NEW.stripe_account_id,
        stripe_setup_complete = NEW.stripe_setup_complete
      WHERE id = NEW.id;
    ELSE
      -- Insert new record including slug and Stripe fields
      INSERT INTO public_profiles (id, name, bio, avatar_url, social_links, slug, stripe_account_id, stripe_setup_complete)
      VALUES (NEW.id, NEW.name, NEW.bio, NEW.avatar_url, NEW.social_links, NEW.slug, NEW.stripe_account_id, NEW.stripe_setup_complete);
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

-- Sync existing Stripe data from profiles to public_profiles
UPDATE public_profiles 
SET 
  stripe_account_id = profiles.stripe_account_id,
  stripe_setup_complete = profiles.stripe_setup_complete
FROM profiles 
WHERE public_profiles.id = profiles.id;