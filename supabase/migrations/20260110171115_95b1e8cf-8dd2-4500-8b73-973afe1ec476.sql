-- Add letter_to_readers column to qr_codes table
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS letter_to_readers TEXT;
COMMENT ON COLUMN qr_codes.letter_to_readers IS 'Personal letter/note from the author to readers of this book';

-- Add columns to store enabled signup form settings for each book
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS arc_signup_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS beta_reader_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN qr_codes.arc_signup_enabled IS 'Whether ARC signup form is enabled for this book page';
COMMENT ON COLUMN qr_codes.beta_reader_enabled IS 'Whether beta reader signup form is enabled for this book page';
COMMENT ON COLUMN qr_codes.newsletter_enabled IS 'Whether newsletter signup form is enabled for this book page';