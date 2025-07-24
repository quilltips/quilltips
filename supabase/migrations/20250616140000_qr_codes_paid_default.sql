
CREATE OR REPLACE FUNCTION public.create_qr_code(
  author_id uuid, 
  book_title text, 
  template text DEFAULT 'basic'::text,
  publisher text DEFAULT NULL,
  isbn text DEFAULT NULL,
  cover_image text DEFAULT NULL
) 
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  new_qr_code_id uuid;
BEGIN
  INSERT INTO qr_codes (
    author_id, 
    book_title, 
    template, 
    is_paid,  -- Explicitly set to true
    publisher, 
    isbn, 
    cover_image
  ) VALUES (
    author_id, 
    book_title, 
    template, 
    true,  -- Default is_paid to true
    publisher, 
    isbn, 
    cover_image
  ) RETURNING id INTO new_qr_code_id;
  
  RETURN new_qr_code_id;
END;
$$;
