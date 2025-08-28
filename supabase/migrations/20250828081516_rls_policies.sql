-- =============================================
-- Migración: Row Level Security (RLS) Policies
-- Descripción: Políticas de seguridad granulares por tabla y rol
-- Fecha: 2025-08-28
-- =============================================

-- =============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_health_checks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNCIONES AUXILIARES PARA POLÍTICAS RLS
-- =============================================

-- Función para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario está autenticado
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- POLÍTICAS RLS PARA TABLA PROFILES
-- =============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil (excepto rol)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        (OLD.role = NEW.role OR is_admin()) -- Solo admins pueden cambiar roles
    );

-- Los usuarios pueden insertar su propio perfil durante signup
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id AND role = 'user');

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin());

-- Los administradores pueden actualizar cualquier perfil
CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (is_admin());

-- =============================================
-- POLÍTICAS RLS PARA TABLA STORIES
-- =============================================

-- Los usuarios solo pueden ver sus propias historias
CREATE POLICY "Users can view own stories" ON stories
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear historias para sí mismos
CREATE POLICY "Users can create own stories" ON stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias historias
CREATE POLICY "Users can update own stories" ON stories
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias historias
CREATE POLICY "Users can delete own stories" ON stories
    FOR DELETE USING (auth.uid() = user_id);

-- Los administradores pueden ver todas las historias
CREATE POLICY "Admins can view all stories" ON stories
    FOR SELECT USING (is_admin());

-- Los administradores pueden realizar todas las operaciones
CREATE POLICY "Admins can manage all stories" ON stories
    FOR ALL USING (is_admin());

-- =============================================
-- POLÍTICAS RLS PARA TABLA VOCABULARY_WORDS
-- =============================================

-- Los usuarios solo pueden ver su propio vocabulario
CREATE POLICY "Users can view own vocabulary" ON vocabulary_words
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear palabras de vocabulario para sí mismos
CREATE POLICY "Users can create own vocabulary" ON vocabulary_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propio vocabulario
CREATE POLICY "Users can update own vocabulary" ON vocabulary_words
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar su propio vocabulario
CREATE POLICY "Users can delete own vocabulary" ON vocabulary_words
    FOR DELETE USING (auth.uid() = user_id);

-- Los administradores pueden ver todo el vocabulario
CREATE POLICY "Admins can view all vocabulary" ON vocabulary_words
    FOR SELECT USING (is_admin());

-- =============================================
-- POLÍTICAS RLS PARA TABLA STORY_PROGRESS
-- =============================================

-- Los usuarios solo pueden ver su propio progreso
CREATE POLICY "Users can view own progress" ON story_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear progreso para sí mismos
CREATE POLICY "Users can create own progress" ON story_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propio progreso
CREATE POLICY "Users can update own progress" ON story_progress
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Los administradores pueden ver todo el progreso
CREATE POLICY "Admins can view all progress" ON story_progress
    FOR SELECT USING (is_admin());

-- =============================================
-- POLÍTICAS RLS PARA TABLA USAGE_ANALYTICS
-- =============================================

-- Los usuarios pueden crear eventos de analytics para sí mismos
CREATE POLICY "Users can create own analytics" ON usage_analytics
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id IS NULL -- Permitir eventos anónimos
    );

-- Los usuarios pueden ver sus propios analytics
CREATE POLICY "Users can view own analytics" ON usage_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Los administradores pueden ver todos los analytics
CREATE POLICY "Admins can view all analytics" ON usage_analytics
    FOR SELECT USING (is_admin());

-- Los administradores pueden crear cualquier evento de analytics
CREATE POLICY "Admins can create any analytics" ON usage_analytics
    FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- POLÍTICAS RLS PARA TABLA AD_BANNERS
-- =============================================

-- Todos los usuarios autenticados pueden ver banners activos
CREATE POLICY "Users can view active banners" ON ad_banners
    FOR SELECT USING (
        is_authenticated() AND 
        is_active = true AND
        (end_date IS NULL OR end_date > NOW()) AND
        current_impressions < max_impressions
    );

-- Solo administradores pueden ver todos los banners
CREATE POLICY "Admins can view all banners" ON ad_banners
    FOR SELECT USING (is_admin());

-- Solo administradores pueden crear banners
CREATE POLICY "Admins can create banners" ON ad_banners
    FOR INSERT WITH CHECK (is_admin() AND auth.uid() = created_by);

-- Solo administradores pueden actualizar banners
CREATE POLICY "Admins can update banners" ON ad_banners
    FOR UPDATE USING (is_admin());

-- Solo administradores pueden eliminar banners
CREATE POLICY "Admins can delete banners" ON ad_banners
    FOR DELETE USING (is_admin());

-- =============================================
-- POLÍTICAS RLS PARA TABLA USER_LIMITS
-- =============================================

-- Los usuarios pueden ver sus propios límites
CREATE POLICY "Users can view own limits" ON user_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Solo administradores pueden crear límites
CREATE POLICY "Admins can create user limits" ON user_limits
    FOR INSERT WITH CHECK (is_admin());

-- Solo administradores pueden ver todos los límites
CREATE POLICY "Admins can view all limits" ON user_limits
    FOR SELECT USING (is_admin());

-- Solo administradores pueden actualizar límites
CREATE POLICY "Admins can update user limits" ON user_limits
    FOR UPDATE USING (is_admin());

-- Solo administradores pueden eliminar límites
CREATE POLICY "Admins can delete user limits" ON user_limits
    FOR DELETE USING (is_admin());

-- =============================================
-- POLÍTICAS RLS PARA TABLA API_HEALTH_CHECKS
-- =============================================

-- Solo administradores pueden ver health checks
CREATE POLICY "Admins can view health checks" ON api_health_checks
    FOR SELECT USING (is_admin());

-- Solo administradores pueden crear health checks
CREATE POLICY "Admins can create health checks" ON api_health_checks
    FOR INSERT WITH CHECK (is_admin() AND auth.uid() = checked_by);

-- Solo administradores pueden actualizar health checks
CREATE POLICY "Admins can update health checks" ON api_health_checks
    FOR UPDATE USING (is_admin());

-- Solo administradores pueden eliminar health checks
CREATE POLICY "Admins can delete health checks" ON api_health_checks
    FOR DELETE USING (is_admin());

-- =============================================
-- POLÍTICAS ESPECIALES PARA CASOS DE USO ESPECÍFICOS
-- =============================================

-- Política para permitir que los usuarios vean historias compartidas (futuro feature)
-- CREATE POLICY "Users can view shared stories" ON stories
--     FOR SELECT USING (
--         auth.uid() = user_id OR 
--         (is_public = true AND is_authenticated())
--     );

-- Política para permitir lectura de stats agregadas por administradores
CREATE POLICY "Service role can read all for aggregation" ON profiles
    FOR SELECT USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role can read all stories for aggregation" ON stories
    FOR SELECT USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role can read all vocabulary for aggregation" ON vocabulary_words
    FOR SELECT USING (current_setting('role') = 'service_role');

-- =============================================
-- POLÍTICAS PARA OPERACIONES DE SISTEMA
-- =============================================

-- Permitir a los triggers del sistema actualizar contadores automáticamente
-- (usando SECURITY DEFINER en las funciones de trigger)

-- Política para permitir actualizaciones de límites por parte del sistema
CREATE POLICY "System can update limits" ON user_limits
    FOR UPDATE USING (current_setting('role') = 'service_role');

-- Política para permitir inserción automática de límites por defecto
CREATE POLICY "System can create default limits" ON user_limits
    FOR INSERT WITH CHECK (current_setting('role') = 'service_role');

-- =============================================
-- GRANTS NECESARIOS PARA ROLES
-- =============================================

-- Grants para usuarios autenticados (auth.users)
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON stories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vocabulary_words TO authenticated;
GRANT SELECT, INSERT, UPDATE ON story_progress TO authenticated;
GRANT SELECT, INSERT ON usage_analytics TO authenticated;
GRANT SELECT ON ad_banners TO authenticated;
GRANT SELECT ON user_limits TO authenticated;

-- Grants adicionales para service_role (para Edge Functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =============================================

COMMENT ON FUNCTION is_admin IS 'Verifica si el usuario actual tiene rol de administrador';
COMMENT ON FUNCTION is_authenticated IS 'Verifica si hay un usuario autenticado';
COMMENT ON FUNCTION get_user_role IS 'Obtiene el rol del usuario actual';

-- =============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE DE RLS
-- =============================================

-- Índices para mejorar performance de políticas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);
CREATE INDEX IF NOT EXISTS idx_stories_user_id_created ON stories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id_mastery ON vocabulary_words(user_id, mastery_level);
CREATE INDEX IF NOT EXISTS idx_story_progress_user_id_updated ON story_progress(user_id, updated_at DESC);