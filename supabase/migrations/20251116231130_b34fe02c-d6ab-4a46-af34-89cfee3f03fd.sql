-- Add tipping_enabled field to qr_codes table
ALTER TABLE qr_codes 
ADD COLUMN tipping_enabled BOOLEAN DEFAULT true NOT NULL;

COMMENT ON COLUMN qr_codes.tipping_enabled IS 'Whether tipping is enabled for this book. When false, only messaging is available.';