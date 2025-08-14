-- Add foreign key relationship between qr_codes and public_profiles
-- This enables the author:public_profiles join syntax for search functionality
ALTER TABLE qr_codes ADD CONSTRAINT qr_codes_author_public_profiles_fkey 
FOREIGN KEY (author_id) REFERENCES public_profiles (id) ON DELETE CASCADE;