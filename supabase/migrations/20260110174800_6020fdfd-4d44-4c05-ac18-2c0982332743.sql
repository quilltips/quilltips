-- Add book_club_enabled and book_club_description columns to public_profiles table
ALTER TABLE public.public_profiles ADD COLUMN IF NOT EXISTS book_club_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.public_profiles ADD COLUMN IF NOT EXISTS book_club_description TEXT;

COMMENT ON COLUMN public.public_profiles.book_club_enabled IS 'Whether book club/event invite form is enabled on author profile';
COMMENT ON COLUMN public.public_profiles.book_club_description IS 'Custom description for the book club invite form';

-- Copy existing data from profiles to public_profiles
UPDATE public.public_profiles pp
SET 
  book_club_enabled = p.book_club_enabled,
  book_club_description = p.book_club_description
FROM public.profiles p
WHERE pp.id = p.id;