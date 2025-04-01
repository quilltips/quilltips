
-- Create function to get a public profile by ID
CREATE OR REPLACE FUNCTION get_public_profile_by_id(profile_id UUID)
RETURNS SETOF public_profiles
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM public_profiles WHERE id = profile_id;
$$;

-- Create function to get a public profile by name
CREATE OR REPLACE FUNCTION get_public_profile_by_name(profile_name TEXT)
RETURNS SETOF public_profiles
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM public_profiles WHERE name ILIKE profile_name;
$$;

-- Create function to update a public profile
CREATE OR REPLACE FUNCTION update_public_profile(
  profile_id UUID,
  profile_name TEXT,
  profile_bio TEXT,
  profile_avatar_url TEXT,
  profile_social_links JSONB
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public_profiles
  SET 
    name = profile_name,
    bio = profile_bio,
    avatar_url = profile_avatar_url,
    social_links = profile_social_links
  WHERE id = profile_id;
$$;

-- Create function to insert a public profile
CREATE OR REPLACE FUNCTION insert_public_profile(
  profile_id UUID,
  profile_name TEXT,
  profile_bio TEXT,
  profile_avatar_url TEXT,
  profile_social_links JSONB
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public_profiles (id, name, bio, avatar_url, social_links)
  VALUES (profile_id, profile_name, profile_bio, profile_avatar_url, profile_social_links);
$$;
