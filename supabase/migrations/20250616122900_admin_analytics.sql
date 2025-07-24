
-- First, create the app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'author', 'reader');
  END IF;
END $$;

-- Update the role column to allow both text and enum values during transition
-- First add a new column with the enum type
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_enum public.app_role;

-- Update the new column based on existing text values
UPDATE public.profiles 
SET role_enum = CASE 
  WHEN role = 'admin' THEN 'admin'::app_role
  WHEN role = 'author' THEN 'author'::app_role
  WHEN role = 'reader' THEN 'reader'::app_role
  ELSE 'reader'::app_role -- default fallback
END;

-- Drop the old text column and rename the enum column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
ALTER TABLE public.profiles RENAME COLUMN role_enum TO role;

-- Create admin analytics helper functions
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_authors', (SELECT COUNT(*) FROM profiles WHERE role = 'author'),
    'total_readers', (SELECT COUNT(*) FROM profiles WHERE role = 'reader'),
    'new_signups_today', (SELECT COUNT(*) FROM profiles WHERE created_at::date = CURRENT_DATE),
    'new_signups_this_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_signups_this_month', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_tip_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'total_tips', (SELECT COUNT(*) FROM tips),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM tips WHERE status = 'complete'),
    'average_tip', (SELECT COALESCE(AVG(amount), 0) FROM tips WHERE status = 'complete'),
    'tips_today', (SELECT COUNT(*) FROM tips WHERE created_at::date = CURRENT_DATE),
    'tips_this_week', (SELECT COUNT(*) FROM tips WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'tips_this_month', (SELECT COUNT(*) FROM tips WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'revenue_today', (SELECT COALESCE(SUM(amount), 0) FROM tips WHERE created_at::date = CURRENT_DATE AND status = 'complete'),
    'revenue_this_week', (SELECT COALESCE(SUM(amount), 0) FROM tips WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'complete'),
    'revenue_this_month', (SELECT COALESCE(SUM(amount), 0) FROM tips WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'complete')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_qr_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'total_qr_codes', (SELECT COUNT(*) FROM qr_codes),
    'active_qr_codes', (SELECT COUNT(*) FROM qr_codes WHERE qr_code_status = 'active'),
    'paid_qr_codes', (SELECT COUNT(*) FROM qr_codes WHERE is_paid = true),
    'qr_codes_created_today', (SELECT COUNT(*) FROM qr_codes WHERE created_at::date = CURRENT_DATE),
    'qr_codes_created_this_week', (SELECT COUNT(*) FROM qr_codes WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'qr_codes_created_this_month', (SELECT COUNT(*) FROM qr_codes WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
  );
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create admin activity log table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES profiles(id) NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin activity log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin activity log
CREATE POLICY "Only admins can access admin activity log" 
ON public.admin_activity_log 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()));
