-- =============================================
-- Migration: Esquema Base de The Vaughan Storyteller
-- Description: Tablas principales optimizadas para performance y escalabilidad
-- Date: 2025-08-28
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. TABLA PROFILES (Perfil de Usuario)
-- =============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    cefr_level TEXT NOT NULL DEFAULT 'B1' 
        CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    preferences JSONB DEFAULT '{}',
    role TEXT NOT NULL DEFAULT 'user' 
        CHECK (role IN ('user', 'admin')),
    stories_completed INTEGER DEFAULT 0 CHECK (stories_completed >= 0),
    vocabulary_mastered INTEGER DEFAULT 0 CHECK (vocabulary_mastered >= 0),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    last_active DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. TABLA STORIES (Historias Generadas)
-- =============================================
CREATE TABLE stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (length(title) > 0),
    content TEXT NOT NULL CHECK (length(content) > 0),
    genre TEXT NOT NULL CHECK (length(genre) > 0),
    cefr_level TEXT NOT NULL 
        CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    estimated_read_time INTEGER CHECK (estimated_read_time > 0),
    word_count INTEGER CHECK (word_count > 0),
    vocabulary_words TEXT[] DEFAULT '{}',
    audio_url TEXT,
    reading_progress FLOAT DEFAULT 0.0 
        CHECK (reading_progress >= 0.0 AND reading_progress <= 100.0),
    completed_at TIMESTAMP WITH TIME ZONE,
    model_used TEXT DEFAULT 'openai/gpt-4o-mini',
    generation_cost DECIMAL(10,6) DEFAULT 0.0,
    audio_generated BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. TABLA VOCABULARY_WORDS (Palabras de Vocabulario)
-- =============================================
CREATE TABLE vocabulary_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    word TEXT NOT NULL CHECK (length(word) > 0),
    definition TEXT NOT NULL CHECK (length(definition) > 0),
    context TEXT,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    difficulty INTEGER DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    success_count INTEGER DEFAULT 0 CHECK (success_count >= 0),
    success_rate FLOAT DEFAULT 0.0 
        CHECK (success_rate >= 0.0 AND success_rate <= 100.0),
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day'),
    mastery_level TEXT DEFAULT 'new' 
        CHECK (mastery_level IN ('new', 'learning', 'review', 'mastered')),
    ease_factor FLOAT DEFAULT 2.5 CHECK (ease_factor >= 1.0),
    interval_days INTEGER DEFAULT 1 CHECK (interval_days >= 0),
    pronunciation TEXT,
    etymology TEXT,
    synonyms TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word)
);

-- =============================================
-- 4. TABLA USAGE_ANALYTICS (An�lisis de Uso)
-- =============================================
CREATE TABLE usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (length(event_type) > 0),
    event_data JSONB DEFAULT '{}',
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. TABLA AD_BANNERS (Panel Admin - Banners Publicitarios)
-- =============================================
CREATE TABLE ad_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL CHECK (length(title) > 0),
    description TEXT NOT NULL CHECK (length(description) > 0),
    cta_link TEXT NOT NULL CHECK (cta_link ~* '^https?://'),
    image_url TEXT,
    target_audience JSONB DEFAULT '{}', -- CEFR levels, countries, etc.
    display_priority INTEGER DEFAULT 1 CHECK (display_priority >= 1),
    max_impressions INTEGER DEFAULT 1000 CHECK (max_impressions > 0),
    current_impressions INTEGER DEFAULT 0 CHECK (current_impressions >= 0),
    click_count INTEGER DEFAULT 0 CHECK (click_count >= 0),
    is_active BOOLEAN DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date IS NULL OR end_date > start_date)
);

-- =============================================
-- 6. TABLA USER_LIMITS (Panel Admin - L�mites de Usuario)
-- =============================================
CREATE TABLE user_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    max_stories INTEGER DEFAULT 10 CHECK (max_stories > 0),
    current_stories INTEGER DEFAULT 0 CHECK (current_stories >= 0),
    max_audio_generations INTEGER DEFAULT 5 CHECK (max_audio_generations > 0),
    current_audio_generations INTEGER DEFAULT 0 CHECK (current_audio_generations >= 0),
    reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    reset_frequency TEXT DEFAULT 'monthly' 
        CHECK (reset_frequency IN ('daily', 'weekly', 'monthly')),
    is_premium BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    CHECK (current_stories <= max_stories),
    CHECK (current_audio_generations <= max_audio_generations)
);

-- =============================================
-- 7. TABLA API_HEALTH_CHECKS (Panel Admin - Health Checks)
-- =============================================
CREATE TABLE api_health_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name TEXT NOT NULL 
        CHECK (service_name IN ('openrouter', 'elevenlabs', 'wordsapi', 'supabase', 'vercel')),
    status TEXT NOT NULL 
        CHECK (status IN ('connected', 'error', 'timeout', 'rate_limited')),
    response_time INTEGER CHECK (response_time >= 0), -- milliseconds
    error_message TEXT,
    error_code TEXT,
    metadata JSONB DEFAULT '{}', -- Additional service-specific data
    checked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. TABLA STORY_PROGRESS (Progreso Detallado de Lectura)
-- =============================================
CREATE TABLE story_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    progress_percentage FLOAT DEFAULT 0.0 
        CHECK (progress_percentage >= 0.0 AND progress_percentage <= 100.0),
    reading_time_seconds INTEGER DEFAULT 0 CHECK (reading_time_seconds >= 0),
    words_clicked TEXT[] DEFAULT '{}',
    bookmarks JSONB DEFAULT '[]', -- Array of paragraph/position bookmarks
    notes TEXT,
    last_position INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- =============================================
-- COMENTARIOS EN TABLAS PARA DOCUMENTACI�N
-- =============================================

COMMENT ON TABLE profiles IS 'Perfiles de usuario con configuraciones y estad�sticas';
COMMENT ON COLUMN profiles.cefr_level IS 'Nivel CEFR actual del usuario (A1-C2)';
COMMENT ON COLUMN profiles.preferences IS 'Configuraciones JSON: tema, idioma, notificaciones, etc.';
COMMENT ON COLUMN profiles.streak_days IS 'D�as consecutivos de actividad del usuario';

COMMENT ON TABLE stories IS 'Historias generadas por IA con metadatos completos';
COMMENT ON COLUMN stories.model_used IS 'Modelo de IA utilizado para generar la historia';
COMMENT ON COLUMN stories.generation_cost IS 'Costo en USD de generar la historia';
COMMENT ON COLUMN stories.vocabulary_words IS 'Array de palabras clave extra�das';

COMMENT ON TABLE vocabulary_words IS 'Sistema de vocabulario con repetici�n espaciada';
COMMENT ON COLUMN vocabulary_words.ease_factor IS 'Factor de facilidad para algoritmo SM-2';
COMMENT ON COLUMN vocabulary_words.interval_days IS 'Intervalo actual en d�as para revisi�n';

COMMENT ON TABLE ad_banners IS 'Sistema de banners publicitarios con targeting';
COMMENT ON COLUMN ad_banners.target_audience IS 'Criterios de targeting en JSON';
COMMENT ON COLUMN ad_banners.display_priority IS 'Prioridad de visualizaci�n (1=highest)';

COMMENT ON TABLE user_limits IS 'L�mites configurables por usuario para uso de APIs';
COMMENT ON COLUMN user_limits.reset_frequency IS 'Frecuencia de reset de l�mites';

COMMENT ON TABLE api_health_checks IS 'Monitoreo de salud de APIs externas';
COMMENT ON COLUMN api_health_checks.metadata IS 'Datos espec�ficos del servicio en JSON';

COMMENT ON TABLE story_progress IS 'Progreso detallado de lectura por historia';
COMMENT ON COLUMN story_progress.bookmarks IS 'Marcadores JSON con posiciones espec�ficas';

-- =============================================
-- 9. TABLA SYSTEM_CONFIG (Configuraciones del Sistema)
-- =============================================
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE system_config IS 'Configuraciones globales del sistema The Vaughan Storyteller';
COMMENT ON COLUMN system_config.value IS 'Valor de configuración en formato JSON';