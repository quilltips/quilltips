-- Add missing foreign key relationships for admin queries
-- Tips to public_profiles relationship  
ALTER TABLE tips ADD CONSTRAINT tips_author_public_profiles_fkey 
FOREIGN KEY (author_id) REFERENCES public_profiles (id) ON DELETE CASCADE;

-- Blog posts to public_profiles relationship
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_author_public_profiles_fkey 
FOREIGN KEY (author_id) REFERENCES public_profiles (id) ON DELETE CASCADE;