-- Add missing landing page fields to public_profiles table
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS next_release_date timestamp with time zone;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS next_release_title text;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS arc_signup_enabled boolean DEFAULT false;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS arc_signup_description text;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS beta_reader_enabled boolean DEFAULT false;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS beta_reader_description text;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS newsletter_enabled boolean DEFAULT false;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS newsletter_description text;

-- Update the sync trigger to include the new fields
CREATE OR REPLACE FUNCTION public.sync_profile_to_public_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Check if a record already exists in public_profiles
    IF EXISTS (SELECT 1 FROM public_profiles WHERE id = NEW.id) THEN
      -- Update existing record, only updating fields that are not null
      UPDATE public_profiles
      SET
        name = COALESCE(NEW.name, name),
        bio = COALESCE(NEW.bio, bio),
        avatar_url = COALESCE(NEW.avatar_url, avatar_url),
        social_links = COALESCE(NEW.social_links, social_links),
        slug = COALESCE(NEW.slug, slug),
        stripe_account_id = COALESCE(NEW.stripe_account_id, stripe_account_id),
        stripe_setup_complete = COALESCE(NEW.stripe_setup_complete, stripe_setup_complete),
        next_release_date = COALESCE(NEW.next_release_date, next_release_date),
        next_release_title = COALESCE(NEW.next_release_title, next_release_title),
        arc_signup_enabled = COALESCE(NEW.arc_signup_enabled, arc_signup_enabled),
        arc_signup_description = COALESCE(NEW.arc_signup_description, arc_signup_description),
        beta_reader_enabled = COALESCE(NEW.beta_reader_enabled, beta_reader_enabled),
        beta_reader_description = COALESCE(NEW.beta_reader_description, beta_reader_description),
        newsletter_enabled = COALESCE(NEW.newsletter_enabled, newsletter_enabled),
        newsletter_description = COALESCE(NEW.newsletter_description, newsletter_description)
      WHERE id = NEW.id;
    ELSE
      -- Insert new record with null-safe handling for initial user creation
      INSERT INTO public_profiles (
        id, 
        name, 
        bio, 
        avatar_url, 
        social_links, 
        slug, 
        stripe_account_id, 
        stripe_setup_complete,
        next_release_date,
        next_release_title,
        arc_signup_enabled,
        arc_signup_description,
        beta_reader_enabled,
        beta_reader_description,
        newsletter_enabled,
        newsletter_description
      )
      VALUES (
        NEW.id, 
        NEW.name, 
        NEW.bio, 
        NEW.avatar_url, 
        NEW.social_links, 
        NEW.slug, 
        NEW.stripe_account_id, 
        COALESCE(NEW.stripe_setup_complete, false),
        NEW.next_release_date,
        NEW.next_release_title,
        COALESCE(NEW.arc_signup_enabled, false),
        NEW.arc_signup_description,
        COALESCE(NEW.beta_reader_enabled, false),
        NEW.beta_reader_description,
        COALESCE(NEW.newsletter_enabled, false),
        NEW.newsletter_description
      );
    END IF;
    RETURN NEW;
  
  -- For delete operations
  ELSIF (TG_OP = 'DELETE') THEN
    -- Delete the corresponding public profile
    DELETE FROM public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent the profile creation
    RAISE WARNING 'Error in sync_profile_to_public_profile: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync existing profile data to public_profiles for the new fields
UPDATE public_profiles 
SET 
  next_release_date = profiles.next_release_date,
  next_release_title = profiles.next_release_title,
  arc_signup_enabled = COALESCE(profiles.arc_signup_enabled, false),
  arc_signup_description = profiles.arc_signup_description,
  beta_reader_enabled = COALESCE(profiles.beta_reader_enabled, false),
  beta_reader_description = profiles.beta_reader_description,
  newsletter_enabled = COALESCE(profiles.newsletter_enabled, false),
  newsletter_description = profiles.newsletter_description
FROM profiles
WHERE public_profiles.id = profiles.id;