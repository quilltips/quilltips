-- Add new columns to profiles table for landing page features
ALTER TABLE public.profiles 
ADD COLUMN next_release_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN next_release_title TEXT,
ADD COLUMN arc_signup_enabled BOOLEAN DEFAULT false,
ADD COLUMN arc_signup_description TEXT,
ADD COLUMN beta_reader_enabled BOOLEAN DEFAULT false,
ADD COLUMN beta_reader_description TEXT,
ADD COLUMN newsletter_enabled BOOLEAN DEFAULT false,
ADD COLUMN newsletter_description TEXT;

-- Create ARC signups table
CREATE TABLE public.arc_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reader_name TEXT NOT NULL,
  reader_email TEXT NOT NULL,
  reader_location TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Create beta reader signups table
CREATE TABLE public.beta_reader_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reader_name TEXT NOT NULL,
  reader_email TEXT NOT NULL,
  reading_experience TEXT,
  favorite_genres TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Create author newsletter signups table (separate from global newsletter)
CREATE TABLE public.author_newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscriber_name TEXT,
  subscriber_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(author_id, subscriber_email)
);

-- Enable RLS on new tables
ALTER TABLE public.arc_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_reader_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_newsletter_signups ENABLE ROW LEVEL SECURITY;

-- RLS policies for ARC signups
CREATE POLICY "Authors can view their ARC signups" 
ON public.arc_signups 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Anyone can create ARC signups" 
ON public.arc_signups 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for beta reader signups
CREATE POLICY "Authors can view their beta reader signups" 
ON public.beta_reader_signups 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Anyone can create beta reader signups" 
ON public.beta_reader_signups 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for author newsletter signups
CREATE POLICY "Authors can view their newsletter signups" 
ON public.author_newsletter_signups 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Anyone can create newsletter signups" 
ON public.author_newsletter_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update newsletter subscriptions" 
ON public.author_newsletter_signups 
FOR UPDATE 
USING (true);