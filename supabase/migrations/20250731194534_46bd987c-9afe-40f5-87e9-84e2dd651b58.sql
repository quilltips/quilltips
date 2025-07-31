-- Add flags and admin_notes columns to profiles table for tracking suspicious users
ALTER TABLE public.profiles 
ADD COLUMN flags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN admin_notes TEXT;