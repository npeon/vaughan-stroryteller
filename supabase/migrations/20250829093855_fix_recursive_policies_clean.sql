-- Fix for "infinite recursion detected in policy for relation profiles"
-- This migration removes circular references in admin policies

-- 1. Remove problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles; 
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- 2. Remove recursive functions if they exist
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- 3. Simplify policies for regular users (no recursion)
-- These policies should already exist, but we recreate them to ensure consistency

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Admin functionality will be handled at application level
-- using service_role key when necessary, avoiding recursive policies

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'Recursive RLS policies successfully removed. System ready for production.';
END $$;
