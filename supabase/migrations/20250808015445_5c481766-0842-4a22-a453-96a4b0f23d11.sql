-- Ensure slugs are generated and public profiles are kept in sync
-- 1) Create trigger to auto-generate profile slug on insert/update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_auto_generate_slug'
  ) THEN
    CREATE TRIGGER profiles_auto_generate_slug
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_profile_slug();
  END IF;
END $$;

-- 2) Create trigger to sync profiles -> public_profiles on insert/update/delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_sync_to_public'
  ) THEN
    CREATE TRIGGER profiles_sync_to_public
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_to_public_profile();
  END IF;
END $$;

-- 3) Backfill slugs for existing profiles where missing
UPDATE public.profiles p
SET slug = public.ensure_unique_profile_slug(public.generate_url_slug(p.name), p.id)
WHERE (p.slug IS NULL OR p.slug = '')
  AND p.name IS NOT NULL AND p.name <> '';

-- 4) Backfill/Upsert public_profiles from profiles
INSERT INTO public.public_profiles (id, name, bio, avatar_url, social_links, slug)
SELECT 
  p.id,
  p.name,
  p.bio,
  p.avatar_url,
  p.social_links,
  COALESCE(p.slug, public.ensure_unique_profile_slug(public.generate_url_slug(p.name), p.id))
FROM public.profiles p
WHERE p.name IS NOT NULL AND p.name <> ''
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  social_links = EXCLUDED.social_links,
  slug = EXCLUDED.slug;