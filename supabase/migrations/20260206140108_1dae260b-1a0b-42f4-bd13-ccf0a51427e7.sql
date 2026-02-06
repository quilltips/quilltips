
-- Add recommended_qr_code_id column to reference the recommended book on the platform
ALTER TABLE public.author_book_recommendations
ADD COLUMN recommended_qr_code_id uuid REFERENCES public.qr_codes(id);

-- Create an index for efficient lookups
CREATE INDEX idx_recommendations_recommended_qr_code_id 
ON public.author_book_recommendations(recommended_qr_code_id);
