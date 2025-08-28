-- =============================================
-- Migraci�n: �ndices y Triggers de Performance
-- Descripci�n: Optimizaciones de consultas y automatizaci�n
-- Fecha: 2025-08-28
-- =============================================

-- =============================================
-- �NDICES OPTIMIZADOS PARA QUERIES FRECUENTES
-- =============================================

-- �ndices para tabla PROFILES
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_cefr_level ON profiles(cefr_level);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- �ndices para tabla STORIES
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_cefr_level ON stories(cefr_level);
CREATE INDEX idx_stories_genre ON stories(genre);
CREATE INDEX idx_stories_completed_at ON stories(completed_at);
CREATE INDEX idx_stories_is_favorite ON stories(is_favorite);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
-- �ndice compuesto para b�squedas frecuentes
CREATE INDEX idx_stories_user_cefr_genre ON stories(user_id, cefr_level, genre);
-- �ndice para progreso de lectura
CREATE INDEX idx_stories_reading_progress ON stories(reading_progress);
-- �ndice para historias con audio
CREATE INDEX idx_stories_audio_generated ON stories(audio_generated);

-- �ndices para tabla VOCABULARY_WORDS
CREATE INDEX idx_vocabulary_user_id ON vocabulary_words(user_id);
CREATE INDEX idx_vocabulary_mastery_level ON vocabulary_words(mastery_level);
CREATE INDEX idx_vocabulary_next_review ON vocabulary_words(next_review);
CREATE INDEX idx_vocabulary_last_reviewed ON vocabulary_words(last_reviewed);
CREATE INDEX idx_vocabulary_story_id ON vocabulary_words(story_id);
-- �ndice compuesto para revisiones pendientes
CREATE INDEX idx_vocabulary_user_next_review ON vocabulary_words(user_id, next_review) 
    WHERE mastery_level != 'mastered';
-- �ndice para b�squeda de palabras
-- Crear índice para búsqueda de palabras con validación de pg_trgm
DO $$
BEGIN
    -- Intentar crear índice trigram solo si la extensión está disponible
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        CREATE INDEX idx_vocabulary_word_trgm ON vocabulary_words USING gin (word gin_trgm_ops);
        RAISE NOTICE 'Índice trigram creado para búsqueda de palabras';
    ELSE
        -- Crear índice alternativo para búsqueda básica
        CREATE INDEX idx_vocabulary_word_basic ON vocabulary_words (word);
        RAISE NOTICE 'Índice básico creado para búsqueda de palabras (pg_trgm no disponible)';
    END IF;
END $$;

-- �ndices para tabla STORY_PROGRESS
CREATE INDEX idx_story_progress_user_id ON story_progress(user_id);
CREATE INDEX idx_story_progress_story_id ON story_progress(story_id);
CREATE INDEX idx_story_progress_completed_at ON story_progress(completed_at);
CREATE INDEX idx_story_progress_updated_at ON story_progress(updated_at DESC);

-- �ndices para tabla USAGE_ANALYTICS
CREATE INDEX idx_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX idx_analytics_created_at ON usage_analytics(created_at DESC);
CREATE INDEX idx_analytics_session_id ON usage_analytics(session_id);
-- �ndice compuesto para an�lisis por usuario y evento
CREATE INDEX idx_analytics_user_event_date ON usage_analytics(user_id, event_type, created_at DESC);

-- �ndices para tabla AD_BANNERS
CREATE INDEX idx_ad_banners_is_active ON ad_banners(is_active);
CREATE INDEX idx_ad_banners_display_priority ON ad_banners(display_priority DESC);
CREATE INDEX idx_ad_banners_start_date ON ad_banners(start_date);
CREATE INDEX idx_ad_banners_end_date ON ad_banners(end_date);
CREATE INDEX idx_ad_banners_created_by ON ad_banners(created_by);
-- �ndice compuesto para banners activos ordenados por prioridad
CREATE INDEX idx_ad_banners_active_priority ON ad_banners(is_active, display_priority DESC) 
    WHERE is_active = true;

-- �ndices para tabla USER_LIMITS
CREATE INDEX idx_user_limits_user_id ON user_limits(user_id);
CREATE INDEX idx_user_limits_reset_date ON user_limits(reset_date);
CREATE INDEX idx_user_limits_is_premium ON user_limits(is_premium);

-- �ndices para tabla API_HEALTH_CHECKS
CREATE INDEX idx_api_health_service_name ON api_health_checks(service_name);
CREATE INDEX idx_api_health_status ON api_health_checks(status);
CREATE INDEX idx_api_health_checked_at ON api_health_checks(checked_at DESC);
-- �ndice compuesto para �ltimos checks por servicio
CREATE INDEX idx_api_health_service_date ON api_health_checks(service_name, checked_at DESC);

-- =============================================
-- EXTENSIONES NECESARIAS PARA �NDICES AVANZADOS
-- =============================================

-- Extensi�n para b�squeda de texto con trigrams
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- FUNCTIONS AUXILIARES PARA TRIGGERS
-- =============================================

-- Funci�n para actualizar updated_at autom�ticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Funci�n para calcular success_rate en vocabulary_words
CREATE OR REPLACE FUNCTION calculate_vocabulary_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.review_count > 0 THEN
        NEW.success_rate = (NEW.success_count::FLOAT / NEW.review_count::FLOAT) * 100;
    ELSE
        NEW.success_rate = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Funci�n para actualizar estad�sticas de usuario
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar stories_completed cuando se completa una historia
    IF TG_TABLE_NAME = 'story_progress' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        UPDATE profiles 
        SET stories_completed = stories_completed + 1,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    -- Actualizar vocabulary_mastered cuando una palabra alcanza mastery
    IF TG_TABLE_NAME = 'vocabulary_words' AND NEW.mastery_level = 'mastered' AND OLD.mastery_level != 'mastered' THEN
        UPDATE profiles 
        SET vocabulary_mastered = vocabulary_mastered + 1,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Funci�n para validar y actualizar l�mites de usuario
CREATE OR REPLACE FUNCTION check_user_limits()
RETURNS TRIGGER AS $$
DECLARE
    current_limit INTEGER;
    max_limit INTEGER;
BEGIN
    -- Verificar l�mites de historias al crear una nueva historia
    IF TG_TABLE_NAME = 'stories' THEN
        SELECT current_stories, max_stories INTO current_limit, max_limit
        FROM user_limits 
        WHERE user_id = NEW.user_id;
        
        -- Si no existe registro de l�mites, crear uno con valores por defecto
        IF NOT FOUND THEN
            INSERT INTO user_limits (user_id, current_stories, max_stories)
            VALUES (NEW.user_id, 1, 10);
        ELSE
            -- Verificar si se ha alcanzado el l�mite
            IF current_limit >= max_limit THEN
                RAISE EXCEPTION 'User has reached story generation limit: % / %', current_limit, max_limit;
            END IF;
            
            -- Incrementar contador de historias
            UPDATE user_limits 
            SET current_stories = current_stories + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Funci�n para actualizar contadores de impresiones de banners
CREATE OR REPLACE FUNCTION update_banner_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar impresiones cuando se registra una visualizaci�n
    IF TG_TABLE_NAME = 'usage_analytics' AND NEW.event_type = 'banner_impression' THEN
        UPDATE ad_banners 
        SET current_impressions = current_impressions + 1,
            updated_at = NOW()
        WHERE id = (NEW.event_data->>'banner_id')::UUID;
    END IF;
    
    -- Incrementar clicks cuando se registra un click
    IF TG_TABLE_NAME = 'usage_analytics' AND NEW.event_type = 'banner_click' THEN
        UPDATE ad_banners 
        SET click_count = click_count + 1,
            updated_at = NOW()
        WHERE id = (NEW.event_data->>'banner_id')::UUID;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS PARA AUTOMATIZACI�N
-- =============================================

-- Triggers para updated_at autom�tico
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vocabulary_updated_at
    BEFORE UPDATE ON vocabulary_words
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_story_progress_updated_at
    BEFORE UPDATE ON story_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ad_banners_updated_at
    BEFORE UPDATE ON ad_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_limits_updated_at
    BEFORE UPDATE ON user_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular success_rate autom�ticamente
CREATE TRIGGER trigger_vocabulary_success_rate
    BEFORE INSERT OR UPDATE OF review_count, success_count ON vocabulary_words
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vocabulary_success_rate();

-- Trigger para actualizar estad�sticas de usuario
CREATE TRIGGER trigger_update_user_stats_progress
    AFTER INSERT OR UPDATE ON story_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_stats_vocabulary
    AFTER INSERT OR UPDATE ON vocabulary_words
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Trigger para verificar l�mites de usuario
CREATE TRIGGER trigger_check_story_limits
    BEFORE INSERT ON stories
    FOR EACH ROW
    EXECUTE FUNCTION check_user_limits();

-- Trigger para estad�sticas de banners
CREATE TRIGGER trigger_banner_stats
    AFTER INSERT ON usage_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_banner_stats();

-- =============================================
-- VISTAS OPTIMIZADAS PARA QUERIES COMUNES
-- =============================================

-- Vista para estad�sticas de usuario completas
CREATE VIEW user_stats AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.cefr_level,
    p.role,
    p.stories_completed,
    p.vocabulary_mastered,
    p.streak_days,
    p.last_active,
    COALESCE(ul.current_stories, 0) as current_stories,
    COALESCE(ul.max_stories, 10) as max_stories,
    COALESCE(ul.is_premium, false) as is_premium,
    COUNT(DISTINCT s.id) as total_stories,
    COUNT(DISTINCT vw.id) as total_vocabulary,
    COUNT(DISTINCT CASE WHEN sp.completed_at IS NOT NULL THEN sp.story_id END) as completed_stories,
    AVG(sp.progress_percentage) as avg_reading_progress
FROM profiles p
LEFT JOIN user_limits ul ON p.id = ul.user_id
LEFT JOIN stories s ON p.id = s.user_id
LEFT JOIN vocabulary_words vw ON p.id = vw.user_id
LEFT JOIN story_progress sp ON p.id = sp.user_id
GROUP BY p.id, p.email, p.full_name, p.cefr_level, p.role, 
         p.stories_completed, p.vocabulary_mastered, p.streak_days, 
         p.last_active, ul.current_stories, ul.max_stories, ul.is_premium;

-- Vista para palabras pendientes de revisi�n
CREATE VIEW vocabulary_due_for_review AS
SELECT 
    vw.*,
    p.full_name as user_name,
    p.cefr_level as user_cefr_level
FROM vocabulary_words vw
JOIN profiles p ON vw.user_id = p.id
WHERE vw.next_review <= NOW() 
  AND vw.mastery_level != 'mastered'
ORDER BY vw.next_review ASC, vw.difficulty DESC;

-- Vista para banners activos con targeting
CREATE VIEW active_banners AS
SELECT 
    ab.*,
    p.full_name as created_by_name
FROM ad_banners ab
JOIN profiles p ON ab.created_by = p.id
WHERE ab.is_active = true 
  AND (ab.end_date IS NULL OR ab.end_date > NOW())
  AND ab.current_impressions < ab.max_impressions
ORDER BY ab.display_priority DESC, ab.created_at ASC;

-- Vista para health check summary (compatible con PostgreSQL < 14)
CREATE VIEW api_health_summary AS
SELECT 
    service_name,
    status,
    response_time,
    error_message,
    checked_at
FROM (
    SELECT 
        service_name,
        status,
        response_time,
        error_message,
        checked_at,
        ROW_NUMBER() OVER (PARTITION BY service_name ORDER BY checked_at DESC) as rn
    FROM api_health_checks
) ranked
WHERE rn = 1;