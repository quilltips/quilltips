-- Fix the sync trigger to allow NULL values to be properly set during reset operations
CREATE OR REPLACE FUNCTION public.sync_profile_to_public_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Check if a record already exists in public_profiles
    IF EXISTS (SELECT 1 FROM public_profiles WHERE id = NEW.id) THEN
      -- Update existing record, allowing NULL values to be set explicitly
      UPDATE public_profiles
      SET
        name = NEW.name,
        bio = NEW.bio,
        avatar_url = NEW.avatar_url,
        social_links = NEW.social_links,
        slug = NEW.slug,
        stripe_account_id = NEW.stripe_account_id,
        stripe_setup_complete = NEW.stripe_setup_complete,
        next_release_date = NEW.next_release_date,
        next_release_title = NEW.next_release_title,
        countdown_enabled = NEW.countdown_enabled,
        arc_signup_enabled = NEW.arc_signup_enabled,
        arc_signup_description = NEW.arc_signup_description,
        beta_reader_enabled = NEW.beta_reader_enabled,
        beta_reader_description = NEW.beta_reader_description,
        newsletter_enabled = NEW.newsletter_enabled,
        newsletter_description = NEW.newsletter_description
      WHERE id = NEW.id;
    ELSE
      -- Insert new record with proper NULL handling for initial user creation
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
        countdown_enabled,
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
        COALESCE(NEW.countdown_enabled, true),
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