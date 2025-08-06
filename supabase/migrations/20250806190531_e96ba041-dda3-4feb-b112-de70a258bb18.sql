-- Create function to get a public profile by slug
CREATE OR REPLACE FUNCTION get_public_profile_by_slug(profile_slug TEXT)
RETURNS SETOF public_profiles
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT * FROM public_profiles WHERE slug = profile_slug;
$$;