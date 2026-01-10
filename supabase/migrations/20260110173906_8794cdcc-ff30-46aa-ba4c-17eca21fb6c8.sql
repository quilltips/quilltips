-- Create book_club_invites table for storing book club/event invitations
CREATE TABLE public.book_club_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reader_name TEXT NOT NULL,
  reader_email TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'book_club', -- book_club, virtual_event, in_person_event, other
  event_date DATE,
  event_location TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_club_invites ENABLE ROW LEVEL SECURITY;

-- Authors can view their own invites
CREATE POLICY "Authors can view their own book club invites"
ON public.book_club_invites
FOR SELECT
USING (auth.uid() = author_id);

-- Anyone can insert invites (readers submitting invitations)
CREATE POLICY "Anyone can create book club invites"
ON public.book_club_invites
FOR INSERT
WITH CHECK (true);

-- Authors can update their own invites (to change status)
CREATE POLICY "Authors can update their own book club invites"
ON public.book_club_invites
FOR UPDATE
USING (auth.uid() = author_id);

-- Add book club invite settings to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS book_club_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS book_club_description TEXT;

COMMENT ON TABLE public.book_club_invites IS 'Stores book club and event invitations from readers to authors';
COMMENT ON COLUMN public.profiles.book_club_enabled IS 'Whether book club/event invite form is enabled on author profile';
COMMENT ON COLUMN public.profiles.book_club_description IS 'Custom description for the book club invite form';

-- Add book club enabled column to qr_codes for per-book settings
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS book_club_enabled BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.qr_codes.book_club_enabled IS 'Whether book club invite form is enabled for this book page';