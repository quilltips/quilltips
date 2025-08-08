-- Add slug column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS slug text;

-- Add slug column to qr_codes table for book slugs
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS book_slug text;

-- Create unique indexes for slugs
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_codes_book_slug ON qr_codes(book_slug) WHERE book_slug IS NOT NULL;

-- Function to generate author slug from name
CREATE OR REPLACE FUNCTION public.generate_author_slug(author_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace special characters
  slug := lower(regexp_replace(author_name, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Check if slug exists, if so append number
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = CASE WHEN counter = 0 THEN slug ELSE slug || '-' || counter END) LOOP
    counter := counter + 1;
  END LOOP;
  
  RETURN CASE WHEN counter = 0 THEN slug ELSE slug || '-' || counter END;
END;
$$;

-- Function to generate book slug from title
CREATE OR REPLACE FUNCTION public.generate_book_slug(book_title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace special characters
  slug := lower(regexp_replace(book_title, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Check if slug exists, if so append number
  WHILE EXISTS (SELECT 1 FROM qr_codes WHERE book_slug = CASE WHEN counter = 0 THEN slug ELSE slug || '-' || counter END) LOOP
    counter := counter + 1;
  END LOOP;
  
  RETURN CASE WHEN counter = 0 THEN slug ELSE slug || '-' || counter END;
END;
$$;

-- Function to get public profile by slug
CREATE OR REPLACE FUNCTION get_public_profile_by_slug(profile_slug TEXT)
RETURNS SETOF public_profiles
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT pp.* FROM public_profiles pp
  JOIN profiles p ON pp.id = p.id
  WHERE p.slug = profile_slug;
$$;

-- Function to get QR code by book slug
CREATE OR REPLACE FUNCTION get_qr_code_by_book_slug(book_slug TEXT)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  book_title text,
  book_slug text,
  publisher text,
  release_date date,
  isbn text,
  cover_image text,
  total_tips integer,
  total_amount numeric,
  average_tip numeric,
  last_tip_date timestamp with time zone,
  is_paid boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    id, author_id, book_title, book_slug, publisher, release_date, 
    isbn, cover_image, total_tips, total_amount, average_tip, 
    last_tip_date, is_paid, created_at, updated_at
  FROM qr_codes 
  WHERE book_slug = $1;
$$;

-- Update existing profiles with slugs
UPDATE profiles 
SET slug = generate_author_slug(name)
WHERE slug IS NULL AND name IS NOT NULL;

-- Update existing QR codes with book slugs
UPDATE qr_codes 
SET book_slug = generate_book_slug(book_title)
WHERE book_slug IS NULL AND book_title IS NOT NULL;

-- Create trigger to automatically generate slug when profile is created/updated
CREATE OR REPLACE FUNCTION update_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update slug if name changed and slug is empty or name changed significantly
  IF (NEW.name IS NOT NULL AND (NEW.slug IS NULL OR OLD.name != NEW.name)) THEN
    NEW.slug := generate_author_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS trigger_update_profile_slug ON profiles;
CREATE TRIGGER trigger_update_profile_slug
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_slug();

-- Create trigger to automatically generate book slug when QR code is created/updated
CREATE OR REPLACE FUNCTION update_qr_code_book_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update slug if book_title changed and book_slug is empty or title changed significantly
  IF (NEW.book_title IS NOT NULL AND (NEW.book_slug IS NULL OR OLD.book_title != NEW.book_title)) THEN
    NEW.book_slug := generate_book_slug(NEW.book_title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for qr_codes table
DROP TRIGGER IF EXISTS trigger_update_qr_code_book_slug ON qr_codes;
CREATE TRIGGER trigger_update_qr_code_book_slug
  BEFORE INSERT OR UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_qr_code_book_slug(); 