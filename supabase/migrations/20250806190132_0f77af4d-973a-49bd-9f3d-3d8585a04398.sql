-- Fix security warnings by setting search_path for all functions

-- Update generate_url_slug function
CREATE OR REPLACE FUNCTION generate_url_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  slug := lower(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Remove any double hyphens
  slug := regexp_replace(slug, '-+', '-', 'g');
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Update ensure_unique_profile_slug function
CREATE OR REPLACE FUNCTION ensure_unique_profile_slug(base_slug TEXT, profile_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  existing_count INTEGER;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists (excluding current profile if updating)
    SELECT COUNT(*) INTO existing_count
    FROM profiles 
    WHERE slug = final_slug 
    AND (profile_id IS NULL OR id != profile_id);
    
    -- If no conflicts, we're done
    IF existing_count = 0 THEN
      EXIT;
    END IF;
    
    -- Try next numbered version
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Update ensure_unique_qr_slug function
CREATE OR REPLACE FUNCTION ensure_unique_qr_slug(base_slug TEXT, qr_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  existing_count INTEGER;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists (excluding current QR code if updating)
    SELECT COUNT(*) INTO existing_count
    FROM qr_codes 
    WHERE slug = final_slug 
    AND (qr_id IS NULL OR id != qr_id);
    
    -- If no conflicts, we're done
    IF existing_count = 0 THEN
      EXIT;
    END IF;
    
    -- Try next numbered version
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Update auto_generate_profile_slug function
CREATE OR REPLACE FUNCTION auto_generate_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
BEGIN
  -- Only generate slug if name changed or slug is null
  IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR 
     (TG_OP = 'UPDATE' AND NEW.name IS DISTINCT FROM OLD.name AND NEW.slug IS NULL) THEN
    
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
      base_slug := generate_url_slug(NEW.name);
      NEW.slug := ensure_unique_profile_slug(base_slug, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Update auto_generate_qr_slug function
CREATE OR REPLACE FUNCTION auto_generate_qr_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
BEGIN
  -- Only generate slug if book_title changed or slug is null
  IF (TG_OP = 'INSERT' AND NEW.slug IS NULL) OR 
     (TG_OP = 'UPDATE' AND NEW.book_title IS DISTINCT FROM OLD.book_title AND NEW.slug IS NULL) THEN
    
    IF NEW.book_title IS NOT NULL AND NEW.book_title != '' THEN
      base_slug := generate_url_slug(NEW.book_title);
      NEW.slug := ensure_unique_qr_slug(base_slug, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';