
-- First, create the app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'author', 'reader');
  END IF;
END $$;

-- Update the profiles table to use the enum type if it's not already using it
DO $$
BEGIN
  -- Check if the role column is already using the enum type
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role' 
    AND udt_name = 'app_role'
  ) THEN
    -- Add a temporary column with the enum type
    ALTER TABLE public.profiles ADD COLUMN role_enum public.app_role;
    
    -- Update the new column based on existing text values
    UPDATE public.profiles 
    SET role_enum = CASE 
      WHEN role = 'admin' THEN 'admin'::app_role
      WHEN role = 'author' THEN 'author'::app_role
      WHEN role = 'reader' THEN 'reader'::app_role
      ELSE 'reader'::app_role -- default fallback
    END;
    
    -- Drop the old text column and rename the enum column
    ALTER TABLE public.profiles DROP COLUMN role;
    ALTER TABLE public.profiles RENAME COLUMN role_enum TO role;
  END IF;
END $$;

-- Now update the handle_new_user function to properly handle the app_role enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  -- Get the role from user metadata, default to 'reader' if not specified
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'reader')::public.app_role;
  
  -- Insert into profiles with proper enum casting
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
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
      COALESCE(new.raw_user_meta_data->>'name', new.email),
      'reader'::public.app_role,
      new.email
    );
    RETURN new;
END;
$$;

-- Ensure the trigger is properly attached (recreate if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
