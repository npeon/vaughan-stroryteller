-- =============================================
-- Migración: Configuraciones Iniciales del Sistema
-- Descripción: Solo configuraciones del sistema, sin datos de usuario
-- Fecha: 2025-08-28
-- =============================================

-- =============================================
-- CONFIGURACIONES INICIALES DEL SISTEMA
-- =============================================

-- Insertar configuraciones por defecto
INSERT INTO system_config (key, value, description) VALUES 
    ('default_user_limits', '{"max_stories": 10, "max_audio_generations": 5, "reset_frequency": "monthly"}', 'Límites por defecto para nuevos usuarios'),
    ('banner_display_rules', '{"max_per_session": 3, "cooldown_minutes": 30}', 'Reglas de visualización de banners'),
    ('vocabulary_settings', '{"spaced_repetition_intervals": [1, 3, 7, 14, 30], "mastery_threshold": 80}', 'Configuraciones del sistema de vocabulario'),
    ('api_rate_limits', '{"openrouter": 50, "elevenlabs": 20, "wordsapi": 100}', 'Límites de rate por hora para APIs externas'),
    ('content_settings', '{"min_story_words": 100, "max_story_words": 1000, "supported_genres": ["adventure", "romance", "mystery", "fantasy", "sci-fi", "educational"]}', 'Configuraciones de contenido'),
    ('oauth_providers', '{"google": {"enabled": true, "scopes": ["profile", "email"]}, "github": {"enabled": false}, "discord": {"enabled": false}}', 'Configuración de providers OAuth'),
    ('auth_settings', '{"default_role": "user", "auto_confirm": false, "session_timeout": 3600}', 'Configuraciones de autenticación')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- FUNCIONES DE UTILIDAD PARA EL SISTEMA
-- =============================================

-- Función para crear límites por defecto para nuevos usuarios
CREATE OR REPLACE FUNCTION create_default_user_limits(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
    INSERT INTO user_limits (
        user_id,
        max_stories,
        current_stories,
        max_audio_generations,
        current_audio_generations,
        is_premium,
        notes
    ) VALUES (
        user_id,
        10, -- Default story limit
        0,
        5,  -- Default audio limit
        0,
        false,
        'Default user limits created automatically'
    ) ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Función para promover un usuario a administrador (solo desde SQL)
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE profiles 
    SET 
        role = 'admin',
        updated_at = NOW()
    WHERE email = user_email;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    IF affected_rows > 0 THEN
        -- Actualizar límites para admin
        INSERT INTO user_limits (
            user_id,
            max_stories,
            current_stories,
            max_audio_generations,
            current_audio_generations,
            is_premium,
            notes
        ) SELECT 
            id,
            1000,
            current_stories,
            500,
            current_audio_generations,
            true,
            'Admin account with elevated limits'
        FROM profiles 
        WHERE email = user_email
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            max_stories = 1000,
            max_audio_generations = 500,
            is_premium = true,
            notes = 'Admin account with elevated limits',
            updated_at = NOW();
            
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- =============================================
-- MEJORAR EL TRIGGER DE CREACIÓN DE USUARIOS
-- =============================================

-- Actualizar la función handle_new_user para incluir límites automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Crear perfil del usuario
  INSERT INTO public.profiles (id, email, role, cefr_level, preferences, is_active)
  VALUES (
    new.id,
    new.email,
    'user', -- Rol por defecto
    'A1',    -- Nivel CEFR por defecto
    '{"theme": "light", "language": "es", "notifications": true}'::jsonb,
    true
  );
  
  -- Crear límites por defecto automáticamente
  PERFORM create_default_user_limits(new.id);
  
  RETURN new;
END;
$$;

-- =============================================
-- COMENTARIOS DOCUMENTACIÓN
-- =============================================

COMMENT ON FUNCTION create_default_user_limits(uuid) IS 
'Crea límites por defecto para un usuario específico';

COMMENT ON FUNCTION promote_user_to_admin(text) IS 
'Promueve un usuario a administrador basándose en su email. Solo debe usarse desde SQL directo.';

-- =============================================
-- VERIFICACIONES FINALES
-- =============================================

DO $$
BEGIN
    -- Verificar que existen configuraciones del sistema
    IF NOT EXISTS (SELECT 1 FROM system_config) THEN
        RAISE EXCEPTION 'System configuration was not created successfully';
    END IF;
    
    RAISE NOTICE 'Sistema configurado correctamente. Use la función promote_user_to_admin(email) para crear administradores.';
END $$;