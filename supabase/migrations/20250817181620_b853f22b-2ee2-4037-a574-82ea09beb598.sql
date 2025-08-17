-- Add buy_now_link column to qr_codes table
ALTER TABLE public.qr_codes 
ADD COLUMN buy_now_link TEXT;