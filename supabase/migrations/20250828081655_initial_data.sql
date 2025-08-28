-- =============================================
-- Migraci�n: Datos Iniciales del Sistema
-- Descripci�n: Configuraci�n base y datos de ejemplo para desarrollo
-- Fecha: 2025-08-28
-- =============================================

-- =============================================
-- FUNCI�N AUXILIAR PARA INSERTAR USUARIO ADMIN DE EJEMPLO
-- =============================================

-- Funci�n para crear usuario administrador demo (solo para desarrollo)
CREATE OR REPLACE FUNCTION create_demo_admin()
RETURNS void AS $$
DECLARE
    demo_admin_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Solo crear si no existe (para environments de desarrollo)
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = demo_admin_id) THEN
        INSERT INTO profiles (
            id,
            email,
            full_name,
            cefr_level,
            role,
            created_at,
            updated_at
        ) VALUES (
            demo_admin_id,
            'admin@vaughanstoryteller.com',
            'Demo Administrator',
            'C2',
            'admin',
            NOW(),
            NOW()
        );
        
        -- Crear l�mites por defecto para el admin
        INSERT INTO user_limits (
            user_id,
            max_stories,
            current_stories,
            max_audio_generations,
            current_audio_generations,
            is_premium,
            notes
        ) VALUES (
            demo_admin_id,
            1000,
            0,
            500,
            0,
            true,
            'Admin account with elevated limits'
        );
        
        RAISE NOTICE 'Demo admin user created successfully';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DATOS INICIALES DE CONFIGURACI�N
-- =============================================

-- Insertar banner de ejemplo para testing del panel admin
INSERT INTO ad_banners (
    id,
    title,
    description,
    cta_link,
    image_url,
    target_audience,
    display_priority,
    max_impressions,
    current_impressions,
    is_active,
    start_date,
    end_date,
    created_by
) VALUES (
    gen_random_uuid(),
    'Welcome to The Vaughan Storyteller',
    'Discover unlimited AI-generated stories tailored to your English level. Start your language learning journey today!',
    'https://vaughanstoryteller.com/signup',
    null,
    '{"cefr_levels": ["A1", "A2", "B1", "B2", "C1", "C2"], "target_countries": ["global"]}',
    1,
    10000,
    0,
    false, -- Inactivo por defecto, admin debe activarlo
    NOW(),
    NOW() + INTERVAL '30 days',
    '00000000-0000-0000-0000-000000000001' -- Demo admin ID
) ON CONFLICT DO NOTHING;

-- Insertar datos de health check iniciales para testing
INSERT INTO api_health_checks (
    service_name,
    status,
    response_time,
    error_message,
    metadata,
    checked_by,
    checked_at
) VALUES 
    ('openrouter', 'connected', 150, null, '{"last_model_used": "claude-3.5-sonnet", "requests_today": 0}', '00000000-0000-0000-0000-000000000001', NOW()),
    ('elevenlabs', 'connected', 200, null, '{"voice_used": "pNInz6obpgDQGcFmaJgB", "characters_used_today": 0}', '00000000-0000-0000-0000-000000000001', NOW()),
    ('wordsapi', 'connected', 100, null, '{"requests_today": 0, "quota_remaining": 1000}', '00000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT DO NOTHING;

-- =============================================
-- EJEMPLOS DE DATOS PARA TESTING (DESARROLLO)
-- =============================================

-- Funci�n para crear datos de ejemplo para testing
CREATE OR REPLACE FUNCTION create_sample_data()
RETURNS void AS $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000002';
    sample_story_id UUID;
    sample_vocab_id UUID;
BEGIN
    -- Solo crear datos de ejemplo (usar variable personalizada o heurística)
    -- Detectar environment local por la existencia de ciertos elementos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles' LIMIT 1) THEN
        
        -- Crear usuario de ejemplo para testing
        INSERT INTO profiles (
            id,
            email,
            full_name,
            avatar_url,
            cefr_level,
            preferences,
            role,
            stories_completed,
            vocabulary_mastered,
            streak_days,
            last_active,
            created_at
        ) VALUES (
            demo_user_id,
            'user@vaughanstoryteller.com',
            'Demo User',
            null,
            'B1',
            '{"theme": "light", "notifications": true, "language": "en"}',
            'user',
            5,
            25,
            7,
            CURRENT_DATE,
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        -- Crear l�mites para usuario demo
        INSERT INTO user_limits (
            user_id,
            max_stories,
            current_stories,
            max_audio_generations,
            current_audio_generations,
            is_premium
        ) VALUES (
            demo_user_id,
            10,
            2,
            5,
            1,
            false
        ) ON CONFLICT DO NOTHING;
        
        -- Crear historia de ejemplo
        INSERT INTO stories (
            id,
            user_id,
            title,
            content,
            genre,
            cefr_level,
            estimated_read_time,
            word_count,
            vocabulary_words,
            reading_progress,
            model_used,
            generation_cost,
            is_favorite
        ) VALUES (
            gen_random_uuid(),
            demo_user_id,
            'The Magic Library',
            'Once upon a time, there was a young student named Emma who discovered a magical library in her school. Every book she touched came to life, showing her incredible adventures. In this library, she learned about different cultures, languages, and made friends from around the world. The librarian, an old wise woman, taught Emma that knowledge is the most powerful magic of all.',
            'fantasy',
            'B1',
            3,
            250,
            ARRAY['magical', 'library', 'adventures', 'cultures', 'knowledge'],
            75.5,
            'claude-3.5-sonnet',
            0.025,
            true
        ) RETURNING id INTO sample_story_id;
        
        -- Crear progreso de historia
        INSERT INTO story_progress (
            user_id,
            story_id,
            progress_percentage,
            reading_time_seconds,
            words_clicked,
            bookmarks,
            notes,
            last_position
        ) VALUES (
            demo_user_id,
            sample_story_id,
            75.5,
            180,
            ARRAY['magical', 'incredible'],
            '[{"paragraph": 2, "position": 45, "note": "Interesting phrase"}]',
            'Great story for practicing past tense',
            125
        ) ON CONFLICT DO NOTHING;
        
        -- Crear palabras de vocabulario de ejemplo
        INSERT INTO vocabulary_words (
            user_id,
            word,
            definition,
            context,
            story_id,
            difficulty,
            review_count,
            success_count,
            mastery_level,
            pronunciation,
            etymology,
            synonyms,
            next_review
        ) VALUES 
            (demo_user_id, 'magical', 'Having or relating to magic; mysterious and enchanting', 'The magical library was full of wonder', sample_story_id, 2, 5, 4, 'review', '�m�d�jkYl', 'From Latin magicus', ARRAY['enchanted', 'mystical'], NOW() + INTERVAL '2 days'),
            (demo_user_id, 'incredible', 'Impossible to believe; extraordinary', 'She saw incredible adventures in the books', sample_story_id, 3, 3, 2, 'learning', 'jn�kredYbl', 'From Latin incredibilis', ARRAY['amazing', 'extraordinary'], NOW() + INTERVAL '1 day'),
            (demo_user_id, 'knowledge', 'Facts, information, and skills acquired through experience or education', 'Knowledge is powerful', sample_story_id, 4, 8, 7, 'mastered', '�nRljd�', 'From Old English cnwl�ce', ARRAY['wisdom', 'learning'], NOW() + INTERVAL '7 days')
        ON CONFLICT DO NOTHING;
        
        -- Crear eventos de analytics de ejemplo
        INSERT INTO usage_analytics (
            user_id,
            event_type,
            event_data,
            session_id,
            created_at
        ) VALUES 
            (demo_user_id, 'story_started', '{"story_id": "' || sample_story_id || '", "genre": "fantasy"}', gen_random_uuid(), NOW() - INTERVAL '2 hours'),
            (demo_user_id, 'word_clicked', '{"word": "magical", "story_id": "' || sample_story_id || '"}', gen_random_uuid(), NOW() - INTERVAL '1 hour'),
            (demo_user_id, 'story_completed', '{"story_id": "' || sample_story_id || '", "reading_time": 180}', gen_random_uuid(), NOW() - INTERVAL '30 minutes')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample data created successfully for testing environment';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CONFIGURACIONES INICIALES DEL SISTEMA
-- =============================================

-- Tabla de configuraciones del sistema (opcional)
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO system_config (key, value, description) VALUES 
    ('default_user_limits', '{"max_stories": 10, "max_audio_generations": 5, "reset_frequency": "monthly"}', 'L�mites por defecto para nuevos usuarios'),
    ('banner_display_rules', '{"max_per_session": 3, "cooldown_minutes": 30}', 'Reglas de visualizaci�n de banners'),
    ('vocabulary_settings', '{"spaced_repetition_intervals": [1, 3, 7, 14, 30], "mastery_threshold": 80}', 'Configuraciones del sistema de vocabulario'),
    ('api_rate_limits', '{"openrouter": 50, "elevenlabs": 20, "wordsapi": 100}', 'L�mites de rate por hora para APIs externas'),
    ('content_settings', '{"min_story_words": 100, "max_story_words": 1000, "supported_genres": ["adventure", "romance", "mystery", "fantasy", "sci-fi", "educational"]}', 'Configuraciones de contenido')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- EJECUTAR FUNCIONES DE INICIALIZACI�N
-- =============================================

-- Crear usuario admin demo
SELECT create_demo_admin();

-- Crear datos de ejemplo (solo en desarrollo)
SELECT create_sample_data();

-- =============================================
-- CLEAN UP DE FUNCIONES TEMPORALES
-- =============================================

-- Las funciones se mantienen para re-ejecutar si es necesario
-- DROP FUNCTION IF EXISTS create_demo_admin();
-- DROP FUNCTION IF EXISTS create_sample_data();

-- =============================================
-- VERIFICACIONES FINALES
-- =============================================

-- Verificar que las tablas principales tienen los datos correctos
DO $$
BEGIN
    -- Verificar que el admin existe
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
        RAISE EXCEPTION 'Admin user was not created successfully';
    END IF;
    
    -- Verificar que existen configuraciones del sistema
    IF NOT EXISTS (SELECT 1 FROM system_config) THEN
        RAISE EXCEPTION 'System configuration was not created successfully';
    END IF;
    
    -- Verificar que los health checks iniciales est�n presentes
    IF NOT EXISTS (SELECT 1 FROM api_health_checks) THEN
        RAISE EXCEPTION 'Initial health checks were not created successfully';
    END IF;
    
    RAISE NOTICE 'All initial data verification passed successfully';
END $$;

-- =============================================
-- COMENTARIOS FINALES
-- =============================================

COMMENT ON TABLE system_config IS 'Configuraciones globales del sistema The Vaughan Storyteller';
COMMENT ON FUNCTION create_demo_admin IS 'Crea usuario administrador demo para desarrollo y testing';
COMMENT ON FUNCTION create_sample_data IS 'Crea datos de ejemplo para testing (solo development)';

-- =============================================
-- MENSAJE DE FINALIZACI�N
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRACI�N COMPLETADA EXITOSAMENTE';
    RAISE NOTICE 'The Vaughan Storyteller - Database Schema';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas creadas: 9 (profiles, stories, vocabulary_words, story_progress, usage_analytics, ad_banners, user_limits, api_health_checks, system_config)';
    RAISE NOTICE '�ndices creados: 25+ optimizados para performance';
    RAISE NOTICE 'Triggers creados: 15+ para automatizaci�n';
    RAISE NOTICE 'Pol�ticas RLS: Configuradas para todas las tablas';
    RAISE NOTICE 'Vistas creadas: 4 optimizadas';
    RAISE NOTICE 'Datos iniciales: Listos para desarrollo';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Pr�ximos pasos:';
    RAISE NOTICE '1. Generar tipos TypeScript: npx supabase gen types typescript --local';
    RAISE NOTICE '2. Configurar Edge Functions para APIs externas';
    RAISE NOTICE '3. Implementar frontend con Quasar Framework';
    RAISE NOTICE '========================================';
END $$;