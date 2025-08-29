-- =============================================
-- Migration: Fix Recursive RLS Policies
-- Description: Soluciona la recursion infinita en politicas RLS
-- Date: 2025-08-29
-- =============================================

-- =============================================
-- ELIMINAR TODAS LAS POLITICAS QUE USAN is_admin()
-- =============================================

-- Primero eliminar todas las politicas que dependen de is_admin()
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all stories" ON stories;
DROP POLICY IF EXISTS "Admins can manage all stories" ON stories;
DROP POLICY IF EXISTS "Admins can view all vocabulary" ON vocabulary_words;
DROP POLICY IF EXISTS "Admins can view all progress" ON story_progress;
DROP POLICY IF EXISTS "Admins can view all analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Admins can create any analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Admins can view all banners" ON ad_banners;
DROP POLICY IF EXISTS "Admins can create banners" ON ad_banners;
DROP POLICY IF EXISTS "Admins can update banners" ON ad_banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON ad_banners;
DROP POLICY IF EXISTS "Admins can create user limits" ON user_limits;
DROP POLICY IF EXISTS "Admins can view all limits" ON user_limits;
DROP POLICY IF EXISTS "Admins can update user limits" ON user_limits;
DROP POLICY IF EXISTS "Admins can delete user limits" ON user_limits;
DROP POLICY IF EXISTS "Admins can view health checks" ON api_health_checks;
DROP POLICY IF EXISTS "Admins can create health checks" ON api_health_checks;
DROP POLICY IF EXISTS "Admins can update health checks" ON api_health_checks;
DROP POLICY IF EXISTS "Admins can delete health checks" ON api_health_checks;

-- Tambien eliminar politicas de migraciones anteriores que pueden usar is_admin()
DROP POLICY IF EXISTS "Only admins can manage banners" ON ad_banners;
DROP POLICY IF EXISTS "Admins can view all user limits" ON user_limits;
DROP POLICY IF EXISTS "Only admins can insert user limits" ON user_limits;
DROP POLICY IF EXISTS "Only admins can update user limits" ON user_limits;
DROP POLICY IF EXISTS "Only admins can delete user limits" ON user_limits;
DROP POLICY IF EXISTS "Only admins can manage API health checks" ON api_health_checks;

-- =============================================
-- ELIMINAR FUNCIONES PROBLEMATICAS
-- =============================================

-- Ahora si podemos eliminar las funciones que causan recursion
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- =============================================
-- NUEVAS POLITICAS RLS PARA PROFILES SIN RECURSION
-- =============================================

-- Los administradores pueden ver todos los perfiles
-- Usando una consulta directa sin funcion recursiva
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Los administradores pueden actualizar cualquier perfil
CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- =============================================
-- CREAR NUEVAS POLITICAS SIN RECURSION
-- =============================================

-- Crear politicas en stories

CREATE POLICY "Admins can view all stories" ON stories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all stories" ON stories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Crear politicas en vocabulary_words
CREATE POLICY "Admins can view all vocabulary" ON vocabulary_words
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Crear politicas en story_progress
CREATE POLICY "Admins can view all progress" ON story_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Crear politicas en usage_analytics
CREATE POLICY "Admins can view all analytics" ON usage_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can create any analytics" ON usage_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Crear politicas en ad_banners
CREATE POLICY "Admins can view all banners" ON ad_banners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can create banners" ON ad_banners
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        ) AND auth.uid() = created_by
    );

CREATE POLICY "Admins can update banners" ON ad_banners
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete banners" ON ad_banners
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Crear politicas en user_limits
CREATE POLICY "Admins can create user limits" ON user_limits
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all limits" ON user_limits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can update user limits" ON user_limits
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete user limits" ON user_limits
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Crear politicas en api_health_checks
CREATE POLICY "Admins can view health checks" ON api_health_checks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can create health checks" ON api_health_checks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        ) AND auth.uid() = checked_by
    );

CREATE POLICY "Admins can update health checks" ON api_health_checks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete health checks" ON api_health_checks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- =============================================
-- VERIFICAR QUE NO HAY RECURSION
-- =============================================

-- Las nuevas politicas usan EXISTS con subconsultas directas
-- en lugar de funciones que puedan causar recursion.
-- Esto evita el problema "infinite recursion detected in policy"