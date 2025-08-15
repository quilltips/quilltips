-- Update the sync function to handle new user creation gracefully
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
        stripe_setup_complete = COALESCE(NEW.stripe_setup_complete, stripe_setup_complete)
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
        stripe_setup_complete
      )
      VALUES (
        NEW.id, 
        NEW.name, 
        NEW.bio, 
        NEW.avatar_url, 
        NEW.social_links, 
        NEW.slug, 
        NEW.stripe_account_id, 
        COALESCE(NEW.stripe_setup_complete, false)
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