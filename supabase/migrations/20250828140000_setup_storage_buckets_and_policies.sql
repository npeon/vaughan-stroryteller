-- ============================================================================
-- Migration: Setup Storage Buckets and RLS Policies
-- Description: Configura buckets de Supabase Storage y políticas RLS para
--              The Vaughan Storyteller con enfoque educativo y seguridad
-- Version: 20250828140000
-- ============================================================================

-- Habilitar la extensión de Storage si no está habilitada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  -- Bucket para assets de historias (público con CDN)
  ('story-assets', 'story-assets', true, 52428800, ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'
  ]),
  
  -- Bucket para contenido de usuarios (privado)
  ('user-content', 'user-content', false, 20971520, ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'
  ]),
  
  -- Bucket para recursos educativos (acceso controlado por roles)
  ('learning-resources', 'learning-resources', false, 31457280, ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'text/plain', 'application/json',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'
  ])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS POLICIES PARA BUCKET: story-assets (PÚBLICO)
-- ============================================================================

-- Política para lectura pública de assets de historias
CREATE POLICY "Public read access to story assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-assets');

-- Política para subida de assets solo por usuarios autenticados (para TTS)
CREATE POLICY "Authenticated users can upload story assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-assets' 
  AND auth.role() = 'authenticated'
  AND (
    -- TTS audio files
    (name ~ '^audio/tts/.*\.(mp3|wav|ogg|webm|m4a)$') OR
    -- Story illustrations
    (name ~ '^illustrations/.*\.(jpg|jpeg|png|webp|gif)$') OR
    -- Admin banners (solo admins)
    (name ~ '^banners/.*\.(jpg|jpeg|png|webp|gif)$' AND 
     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);

-- Política para actualización de assets por usuarios autenticados
CREATE POLICY "Authenticated users can update story assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'story-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para eliminación de assets solo por admins
CREATE POLICY "Only admins can delete story assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'story-assets'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- RLS POLICIES PARA BUCKET: user-content (PRIVADO)
-- ============================================================================

-- Política para que usuarios solo accedan a su propio contenido
CREATE POLICY "Users can access only their own content"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-content'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para subida de contenido de usuario
CREATE POLICY "Users can upload their own content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-content'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    -- Avatar images (max 5MB)
    (name ~ '^[^/]+/avatars/.*\.(jpg|jpeg|png|webp)$' AND pg_column_size(name) < 5242880) OR
    -- Audio recordings (max 10MB)
    (name ~ '^[^/]+/recordings/.*\.(mp3|wav|ogg|webm|m4a)$' AND pg_column_size(name) < 10485760) OR
    -- Portfolio files (max 15MB)
    (name ~ '^[^/]+/portfolio/.*\.(jpg|jpeg|png|webp|mp3|wav|ogg)$' AND pg_column_size(name) < 15728640)
  )
);

-- Política para actualización de contenido propio
CREATE POLICY "Users can update their own content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-content'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para eliminación de contenido propio
CREATE POLICY "Users can delete their own content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-content'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política especial para admins (acceso total a user-content para moderación)
CREATE POLICY "Admins have full access to user content for moderation"
ON storage.objects FOR ALL
USING (
  bucket_id = 'user-content'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- RLS POLICIES PARA BUCKET: learning-resources (EDUCATIVO)
-- ============================================================================

-- Política para lectura de recursos educativos por usuarios autenticados
CREATE POLICY "Authenticated users can read learning resources"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'learning-resources'
  AND auth.role() = 'authenticated'
  AND (
    -- Recursos públicos de vocabulario
    (name ~ '^vocabulary/.*') OR
    -- Certificados propios
    (name ~ '^certificates/.*' AND (storage.foldername(name))[2] = auth.uid()::text) OR
    -- Reports propios
    (name ~ '^reports/.*' AND (storage.foldername(name))[2] = auth.uid()::text) OR
    -- Admins tienen acceso total
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Política para subida de recursos educativos
CREATE POLICY "System and admins can upload learning resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'learning-resources'
  AND (
    -- Solo admins pueden subir contenido
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR
    -- O el sistema (para generar certificados automáticamente)
    auth.role() = 'service_role'
  )
  AND (
    -- Validar estructura de archivos
    (name ~ '^vocabulary/flashcards/.*\.(jpg|jpeg|png|webp)$') OR
    (name ~ '^certificates/[^/]+/.*\.(pdf|jpg|jpeg|png)$') OR
    (name ~ '^reports/[^/]+/.*\.(pdf|jpg|jpeg|png)$')
  )
);

-- Política para actualización de recursos educativos (solo admins)
CREATE POLICY "Only admins can update learning resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'learning-resources'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Política para eliminación de recursos educativos (solo admins)
CREATE POLICY "Only admins can delete learning resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'learning-resources'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- TABLA PARA METADATA DE STORAGE (Analytics y Control)
-- ============================================================================

CREATE TABLE IF NOT EXISTS storage_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    storage_path TEXT NOT NULL UNIQUE,
    bucket_id TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    file_size BIGINT,
    original_name TEXT,
    educational_context TEXT, -- 'tts', 'avatar', 'recording', 'certificate', etc.
    metadata JSONB DEFAULT '{}',
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_storage_metadata_user_id ON storage_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_metadata_bucket_id ON storage_metadata(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_metadata_content_type ON storage_metadata(content_type);
CREATE INDEX IF NOT EXISTS idx_storage_metadata_educational_context ON storage_metadata(educational_context);
CREATE INDEX IF NOT EXISTS idx_storage_metadata_created_at ON storage_metadata(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_storage_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_storage_metadata_updated_at
    BEFORE UPDATE ON storage_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_storage_metadata_updated_at();

-- ============================================================================
-- FUNCIONES HELPER PARA STORAGE
-- ============================================================================

-- Función para obtener estadísticas de storage por usuario
CREATE OR REPLACE FUNCTION get_user_storage_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_files', COUNT(*),
        'total_size_bytes', COALESCE(SUM(file_size), 0),
        'total_size_mb', ROUND(COALESCE(SUM(file_size), 0)::NUMERIC / 1024 / 1024, 2),
        'by_content_type', json_object_agg(content_type, count_and_size.count),
        'by_educational_context', json_object_agg(educational_context, count_and_size.count)
    ) INTO result
    FROM storage_metadata 
    LEFT JOIN LATERAL (
        SELECT content_type, educational_context, COUNT(*) as count, SUM(file_size) as size
        FROM storage_metadata sm2 
        WHERE sm2.user_id = user_uuid 
        GROUP BY content_type, educational_context
    ) count_and_size ON true
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar archivos huérfanos (sin metadata)
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Esta función debe ejecutarse desde un Edge Function o cron job
    -- Por ahora solo marca archivos para eliminación
    UPDATE storage_metadata 
    SET metadata = jsonb_set(
        COALESCE(metadata, '{}'), 
        '{marked_for_deletion}', 
        'true'
    )
    WHERE last_accessed < NOW() - INTERVAL '30 days'
    AND educational_context IN ('temp', 'draft');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONFIGURACIÓN DE CORS PARA BUCKETS
-- ============================================================================

-- Nota: CORS debe configurarse también en el dashboard de Supabase
-- Estas son las configuraciones recomendadas:

-- CORS Configuration for story-assets bucket:
-- Allowed Origins: *, https://*.vercel.app, http://localhost:*
-- Allowed Methods: GET, POST, PUT, DELETE, HEAD, OPTIONS
-- Allowed Headers: authorization, x-client-info, apikey, content-type, x-requested-with
-- Max Age: 3600

COMMENT ON TABLE storage_metadata IS 'Metadata y analytics para archivos en Supabase Storage del sistema educativo The Vaughan Storyteller';
COMMENT ON FUNCTION get_user_storage_stats IS 'Obtiene estadísticas detalladas de storage para un usuario específico';
COMMENT ON FUNCTION cleanup_orphaned_files IS 'Marca archivos huérfanos para eliminación después de 30 días sin acceso';

-- ============================================================================
-- DATOS DE EJEMPLO Y VALIDACIÓN
-- ============================================================================

-- Insertar algunos registros de ejemplo para testing
INSERT INTO storage_metadata (storage_path, bucket_id, content_type, educational_context, metadata)
VALUES 
    ('audio/tts/welcome-story.mp3', 'story-assets', 'audio/mpeg', 'tts', '{"voice": "Joanna", "language": "en-US", "generated_at": "2025-08-28T14:00:00Z"}'),
    ('illustrations/welcome-story-cover.webp', 'story-assets', 'image/webp', 'illustration', '{"alt_text": "Welcome story cover illustration", "dimensions": "800x600"}'),
    ('banners/welcome-banner.jpg', 'story-assets', 'image/jpeg', 'banner', '{"campaign": "welcome", "active": true}')
ON CONFLICT (storage_path) DO NOTHING;

-- Verificación final
SELECT 'Storage buckets and policies setup completed successfully!' as status;