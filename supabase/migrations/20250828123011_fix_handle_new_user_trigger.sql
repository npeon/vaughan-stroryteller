-- =============================================
-- MIGRATION: Fix handle_new_user trigger to extract full_name
-- Date: 2025-08-28
-- Purpose: Update trigger to properly extract full_name from user metadata
-- =============================================

-- Function to automatically create profile when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, cefr_level, preferences, is_active)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), -- Extract full_name or use email prefix
    'user', -- Default role
    'A1',    -- Default CEFR level
    '{"theme": "light", "language": "es", "notifications": true}'::jsonb,
    true
  );
  RETURN new;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function that automatically creates user profile when registering via OAuth or email/password with full_name extraction';
