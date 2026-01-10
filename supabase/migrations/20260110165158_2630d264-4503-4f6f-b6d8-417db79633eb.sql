-- Add book_videos JSONB column to qr_codes table for multiple videos with type selection
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS book_videos JSONB DEFAULT '[]'::jsonb;

-- Add a comment explaining the structure
COMMENT ON COLUMN qr_codes.book_videos IS 'Array of video objects: [{url: string, type: "thank-you"|"interview"|"other", description?: string}]';