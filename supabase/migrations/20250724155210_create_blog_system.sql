-- Create blog posts table with SEO optimization
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- SEO fields
  meta_title text,
  meta_description text,
  meta_keywords text[],
  canonical_url text,
  
  -- Newsletter integration
  include_in_newsletter boolean DEFAULT false,
  newsletter_sent_at timestamp with time zone,
  
  -- Analytics
  view_count integer DEFAULT 0,
  read_time_minutes integer,
  
  -- Social sharing
  social_image_url text,
  social_title text,
  social_description text
);

-- Create blog categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create blog post categories junction table
CREATE TABLE IF NOT EXISTS public.blog_post_categories (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  subscribed_at timestamp with time zone DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  is_active boolean DEFAULT true,
  source text DEFAULT 'website', -- 'website', 'blog', 'admin'
  tags text[] DEFAULT '{}'
);

-- Create blog analytics table for tracking views, engagement
CREATE TABLE IF NOT EXISTS public.blog_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  visitor_ip text,
  user_agent text,
  referrer text,
  viewed_at timestamp with time zone DEFAULT now(),
  time_spent_seconds integer,
  scroll_depth_percentage integer
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
-- Anyone can read published posts
CREATE POLICY "Anyone can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Only admins can create, update, delete posts
CREATE POLICY "Only admins can manage blog posts" ON blog_posts
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can read blog categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage blog categories" ON blog_categories
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for blog_post_categories
CREATE POLICY "Anyone can read blog post categories" ON blog_post_categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage blog post categories" ON blog_post_categories
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for newsletter_subscribers
-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Only admins can view and manage subscribers
CREATE POLICY "Only admins can manage newsletter subscribers" ON newsletter_subscribers
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for blog_analytics
-- Anyone can insert analytics (for tracking)
CREATE POLICY "Anyone can insert blog analytics" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Only admins can view blog analytics" ON blog_analytics
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Functions for blog management
CREATE OR REPLACE FUNCTION public.get_blog_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'total_posts', (SELECT COUNT(*) FROM blog_posts),
    'published_posts', (SELECT COUNT(*) FROM blog_posts WHERE status = 'published'),
    'draft_posts', (SELECT COUNT(*) FROM blog_posts WHERE status = 'draft'),
    'total_views', (SELECT COALESCE(SUM(view_count), 0) FROM blog_posts),
    'total_subscribers', (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true),
    'posts_this_month', (SELECT COUNT(*) FROM blog_posts WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'views_this_month', (SELECT COALESCE(SUM(view_count), 0) FROM blog_posts WHERE published_at >= CURRENT_DATE - INTERVAL '30 days')
  );
$$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_blog_view(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts 
  SET view_count = view_count + 1 
  WHERE id = post_id;
END;
$$;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Check if slug exists, if so append number
  WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = CASE WHEN counter = 0 THEN slug ELSE slug || '-' || counter END) LOOP
    counter := counter + 1;
  END LOOP;
  
  RETURN CASE WHEN counter = 0 THEN slug ELSE slug || '-' || counter END;
END;
$$;

-- Insert some default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Writing Tips', 'writing-tips', 'Tips and advice for authors'),
  ('Publishing', 'publishing', 'Publishing industry insights'),
  ('Author Success', 'author-success', 'Stories and strategies from successful authors'),
  ('Platform Updates', 'platform-updates', 'Updates about Quilltips features'),
  ('Industry News', 'industry-news', 'Latest news from the publishing world')
ON CONFLICT (slug) DO NOTHING; 