
-- Create page_views table to track visits to book pages and author profiles
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL,
  qr_code_id uuid,
  page_type text NOT NULL CHECK (page_type IN ('book', 'profile')),
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  visitor_id text
);

-- Create indexes for efficient querying
CREATE INDEX idx_page_views_author_id ON public.page_views (author_id);
CREATE INDEX idx_page_views_qr_code_id ON public.page_views (qr_code_id) WHERE qr_code_id IS NOT NULL;
CREATE INDEX idx_page_views_viewed_at ON public.page_views (viewed_at);
CREATE INDEX idx_page_views_author_page_type ON public.page_views (author_id, page_type);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views (public pages visited by anonymous readers)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Authors can view their own page views
CREATE POLICY "Authors can view their own page views"
ON public.page_views
FOR SELECT
USING (auth.uid() = author_id);

-- Admins can view all page views
CREATE POLICY "Admins can view all page views"
ON public.page_views
FOR SELECT
USING (is_admin(auth.uid()));
