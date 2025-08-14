-- Update the handle_new_user function to generate privacy-safe placeholder names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role public.app_role;
  placeholder_name TEXT;
BEGIN
  -- Get the role from user metadata, default to 'reader' if not specified
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'reader')::public.app_role;
  
  -- Generate placeholder name using last 8 characters of UUID
  placeholder_name := 'Author' || RIGHT(new.id::text, 8);
  
  -- Insert into profiles with placeholder name (never use email as name)
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', placeholder_name),
    user_role,
    new.email
  );
  
  RETURN new;
EXCEPTION
  WHEN invalid_text_representation THEN
    -- If role casting fails, default to 'reader'
    INSERT INTO public.profiles (id, name, role, email)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', placeholder_name),
      'reader'::public.app_role,
      new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update existing profiles that use email addresses as names
-- This identifies profiles where name contains '@' (likely email addresses)
UPDATE profiles 
SET name = 'Author' || RIGHT(id::text, 8),
    slug = NULL  -- Reset slug so it gets regenerated with new name
WHERE name LIKE '%@%';

-- Also update public_profiles table for consistency
UPDATE public_profiles 
SET name = 'Author' || RIGHT(id::text, 8),
    slug = NULL  -- Reset slug so it gets regenerated with new name  
WHERE name LIKE '%@%';