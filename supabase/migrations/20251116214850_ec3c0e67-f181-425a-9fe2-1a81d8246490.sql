-- Add book enhancement columns to qr_codes table
ALTER TABLE qr_codes
ADD COLUMN thank_you_video_url TEXT,
ADD COLUMN thank_you_video_thumbnail TEXT,
ADD COLUMN video_title TEXT,
ADD COLUMN video_description TEXT,
ADD COLUMN book_description TEXT,
ADD COLUMN character_images JSONB DEFAULT '[]'::jsonb;

-- Create author_book_recommendations table
CREATE TABLE author_book_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  recommended_book_title TEXT NOT NULL,
  recommended_book_author TEXT NOT NULL,
  recommended_book_cover_url TEXT,
  buy_link TEXT,
  recommendation_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_recommendation UNIQUE(author_id, qr_code_id, recommended_book_title)
);

-- Enable RLS
ALTER TABLE author_book_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for author_book_recommendations
CREATE POLICY "Authors can manage their recommendations"
ON author_book_recommendations FOR ALL
USING (author_id = auth.uid());

CREATE POLICY "Public can view recommendations"
ON author_book_recommendations FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_recommendations_author_id ON author_book_recommendations(author_id);
CREATE INDEX idx_recommendations_qr_code_id ON author_book_recommendations(qr_code_id);
CREATE INDEX idx_recommendations_display_order ON author_book_recommendations(display_order);

-- Create storage bucket for book videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-videos', 'book-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for book videos
CREATE POLICY "Authors can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'book-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-videos');