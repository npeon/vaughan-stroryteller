-- =============================================
-- MIGRATION: Configure Auth, Roles and RLS Policies  
-- Date: 2025-08-28
-- Purpose: Implement complete OAuth authentication system with roles
-- =============================================

-- ==========================
-- TRIGGERS CONFIGURATION
-- ==========================

-- Function to automatically create profile when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, cefr_level, preferences, is_active)
  VALUES (
    new.id,
    new.email,
    'user', -- Default role
    'A1',    -- Default CEFR level
    '{"theme": "light", "language": "es", "notifications": true}'::jsonb,
    true
  );
  RETURN new;
END;
$$;

-- Trigger that executes after inserting into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================
-- RLS POLICIES FOR PROFILES
-- ==========================

-- Enable RLS on profiles table (if not enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- POLICY 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- POLICY 2: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- POLICY 3: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICY 4: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLICY 5: Allow insertion for new users (only from trigger)
CREATE POLICY "Enable insert for authenticated users via trigger" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ==========================
-- UTILITY FUNCTIONS FOR ROLES
-- ==========================

-- Function to verify if a user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY definer
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY definer
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- ==========================
-- RLS POLICIES FOR OTHER SENSITIVE TABLES
-- ==========================

-- RLS for ad_banners (only admins can modify)
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active banners" ON public.ad_banners;
DROP POLICY IF EXISTS "Only admins can manage banners" ON public.ad_banners;

-- Everyone can view active banners
CREATE POLICY "Everyone can view active banners" ON public.ad_banners
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage banners
CREATE POLICY "Only admins can manage banners" ON public.ad_banners
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS for user_limits (only admins)
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all user limits" ON public.user_limits;
DROP POLICY IF EXISTS "Users can view own limits" ON public.user_limits;
DROP POLICY IF EXISTS "Only admins can insert user limits" ON public.user_limits;
DROP POLICY IF EXISTS "Only admins can update user limits" ON public.user_limits;
DROP POLICY IF EXISTS "Only admins can delete user limits" ON public.user_limits;

-- Users can view their own limits
CREATE POLICY "Users can view own limits" ON public.user_limits
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all limits
CREATE POLICY "Admins can view all user limits" ON public.user_limits
  FOR SELECT
  USING (public.is_admin());

-- Only admins can insert user limits
CREATE POLICY "Only admins can insert user limits" ON public.user_limits
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update user limits
CREATE POLICY "Only admins can update user limits" ON public.user_limits
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete user limits
CREATE POLICY "Only admins can delete user limits" ON public.user_limits
  FOR DELETE
  USING (public.is_admin());

-- RLS for api_health_checks (only admins)
ALTER TABLE public.api_health_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can manage API health checks" ON public.api_health_checks;

CREATE POLICY "Only admins can manage API health checks" ON public.api_health_checks
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==========================
-- DOCUMENTATION COMMENTS
-- ==========================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function that automatically creates user profile when registering via OAuth with default user role';

COMMENT ON FUNCTION public.is_admin(uuid) IS 
'Utility function to verify if a user has admin role';

COMMENT ON FUNCTION public.get_user_role(uuid) IS 
'Utility function to get user role, returns user by default';

-- Function to prevent users from changing their own role
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Allow if user is admin or role is not being changed
  IF public.is_admin(OLD.id) OR OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;
  
  -- If a non-admin is trying to change role, prevent it
  IF OLD.role != NEW.role THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to prevent role changes
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON public.profiles;
CREATE TRIGGER prevent_role_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- Create indexes to improve performance of role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON public.profiles(id);