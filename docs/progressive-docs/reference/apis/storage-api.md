# 📖 Storage API Reference

> **Documentación técnica completa del sistema de Supabase Storage con tipos TypeScript, métodos, y configuraciones**

## 🏗️ Arquitectura de Servicios

### **Jerarquía de Clases**

```
SupabaseStorageService (Base)
├── AudioStorageService (Especializado en audio TTS/grabaciones)
├── ImageStorageService (Futuro: especializado en imágenes)
└── DocumentStorageService (Futuro: especializado en PDFs/documentos)
```

---

## 🔧 SupabaseStorageService (Base)

### **Configuración de Buckets**

```typescript
interface BucketConfig {
  isPublic: boolean;
  fileSizeLimit: number;      // bytes
  allowedTypes: string[];     // MIME types
  autoDelete?: string;        // ISO date string
  compressionEnabled?: boolean;
}

// Buckets configurados
private readonly bucketConfigs = {
  'story-assets': {
    isPublic: true,
    fileSizeLimit: 52428800,  // 50MB
    allowedTypes: ['image/*', 'audio/*', 'video/*'],
    compressionEnabled: true
  },
  'user-content': {
    isPublic: false, 
    fileSizeLimit: 20971520,  // 20MB
    allowedTypes: ['image/*', 'audio/*', 'application/pdf'],
    autoDelete: '90d'         // Auto-delete after 90 days
  },
  'learning-resources': {
    isPublic: false,
    fileSizeLimit: 31457280,  // 30MB  
    allowedTypes: ['image/*', 'audio/*', 'video/*', 'application/pdf']
  }
}
```

### **Contextos Educativos**

```typescript
type EducationalContext = 
  | 'tts'           // Text-to-speech audio
  | 'avatar'        // User profile avatars  
  | 'recording'     // User audio recordings
  | 'illustration'  // Story illustrations
  | 'banner'        // Marketing banners
  | 'certificate'   // Course certificates  
  | 'vocabulary'    // Vocabulary cards/images
  | 'report'        // Progress reports
  | 'portfolio'     // Student portfolios
  | 'temp'          // Temporary uploads
  | 'draft';        // Draft content

// Configuración por contexto
private readonly educationalContexts = {
  tts: { 
    maxSize: 10485760,        // 10MB
    bucket: 'story-assets',
    cacheDuration: '1y'       // 1 año
  },
  avatar: { 
    maxSize: 5242880,         // 5MB
    bucket: 'user-content', 
    allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
  },
  recording: { 
    maxSize: 10485760,        // 10MB
    bucket: 'user-content',
    cacheDuration: '1d',      // 1 día
    autoDelete: '6m'          // 6 meses
  }
  // ... más contextos
}
```

### **Interfaces TypeScript**

#### **Upload Options**

```typescript
interface BaseUploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File;
  educationalContext: EducationalContext;
  userId?: string;
  metadata?: Record<string, any>;
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
}

interface ImageUploadOptions extends BaseUploadOptions {
  imageMetadata: ImageMetadata;
}

interface AudioUploadOptions extends BaseUploadOptions {
  audioMetadata: AudioMetadata;
}
```

#### **Metadata Structures**

```typescript
interface StorageMetadata {
  id: string;
  storage_path: string;
  bucket_id: StorageBucket;
  user_id?: string;
  content_type: string;
  file_size: number;
  original_name: string;
  educational_context: EducationalContext;
  access_count: number;
  last_accessed?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ImageMetadata {
  dimensions: string;          // "400x300"
  alt_text: string;
  caption?: string;
  user_id?: string;
  [key: string]: any;
}

interface AudioMetadata {
  duration: number;            // seconds
  bitrate?: number;           // kbps
  sampleRate?: number;        // Hz
  channels?: number;          // 1=mono, 2=stereo
  [key: string]: any;
}
```

#### **Result Types**

```typescript
interface UploadResult {
  success: boolean;
  data?: {
    id: string;
    path: string;
    fullPath: string;
    publicUrl?: string;
    signedUrl?: string;
    metadata: StorageMetadata;
  };
  error?: string;
}

interface DownloadResult {
  success: boolean;
  data?: {
    blob: Blob;
    url: string;
    metadata: StorageMetadata;
  };
  error?: string;
}

interface DeleteResult {
  success: boolean;
  error?: string;
}
```

### **Métodos Principales**

#### **upload()**

```typescript
async upload(
  options: BaseUploadOptions | ImageUploadOptions | AudioUploadOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult>
```

**Ejemplo de uso:**

```typescript
const result = await storageService.upload({
  bucket: 'user-content',
  path: 'avatars/user-123/avatar.webp',
  file: avatarFile,
  educationalContext: 'avatar',
  userId: 'user-123',
  imageMetadata: {
    dimensions: '400x400',
    alt_text: 'User profile avatar'
  }
}, (progress) => {
  console.log(`Upload: ${progress.percentage}%`);
});
```

#### **download()**

```typescript
async download(
  bucket: StorageBucket,
  path: string,
  userId?: string
): Promise<DownloadResult>
```

#### **delete()**

```typescript  
async delete(
  bucket: StorageBucket,
  path: string
): Promise<DeleteResult>
```

#### **listFiles()**

```typescript
async listFiles(
  bucket: StorageBucket,
  prefix?: string,
  userId?: string,
  limit?: number
): Promise<StorageMetadata[]>
```

#### **getSignedUrl()**

```typescript
async getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600  // seconds
): Promise<string>
```

### **Métodos Utilitarios**

#### **validateFile()**

```typescript
private validateFile(
  file: File,
  bucket: StorageBucket,
  educationalContext: EducationalContext
): ValidationResult

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### **generateUniqueFileName()**

```typescript
private generateUniqueFileName(
  originalName: string,
  userId?: string,
  context?: EducationalContext
): string
```

#### **calculateFileHash()**

```typescript
private async calculateFileHash(file: File): Promise<string>
```

Genera SHA-256 hash para deduplicación y cache inteligente.

---

## 🎵 AudioStorageService (Especializado)

### **Extensión de SupabaseStorageService**

```typescript
export class AudioStorageService extends SupabaseStorageService {
  // Formatos de audio específicos
  private readonly AUDIO_FORMATS = {
    TTS_PRIMARY: 'audio/mpeg',      // MP3 para TTS
    TTS_FALLBACK: 'audio/ogg',      // OGG fallback  
    RECORDING_PRIMARY: 'audio/webm', // WebM para grabaciones
    RECORDING_FALLBACK: 'audio/wav'  // WAV fallback
  };

  // Configuraciones de calidad
  private readonly QUALITY_SETTINGS = {
    HIGH: { bitrate: 128, quality: 0.9 },
    MEDIUM: { bitrate: 96, quality: 0.7 },
    LOW: { bitrate: 64, quality: 0.5 }
  };
}
```

### **Interfaces Específicas**

#### **TTS Audio Options**

```typescript
interface TTSAudioOptions {
  storyId: string;
  chapterId?: string;
  text: string;
  voice: string;              // ElevenLabs voice ID
  language: string;           // 'en-GB', 'es-ES', etc.
  model?: string;             // ElevenLabs model
  stability?: number;         // 0.0-1.0
  similarity_boost?: number;  // 0.0-1.0
  style?: number;            // 0.0-1.0  
  use_speaker_boost?: boolean;
}
```

#### **Recording Options**

```typescript
interface RecordingOptions {
  userId: string;
  type: 'pronunciation' | 'assessment' | 'portfolio';
  exerciseId?: string;
  wordId?: string; 
  expectedText?: string;
  metadata?: Record<string, any>;
}
```

#### **Audio Processing Result**

```typescript
interface AudioProcessingResult {
  success: boolean;
  audioUrl?: string;
  duration?: number;          // seconds
  size?: number;             // bytes
  format?: string;           // MIME type
  error?: string;
  metadata?: StorageMetadata;
}
```

### **Métodos TTS**

#### **storeTTSAudio()**

```typescript
async storeTTSAudio(
  audioBlob: Blob,
  options: TTSAudioOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<AudioProcessingResult>
```

**Funcionalidades:**
- ✅ Genera nombre único basado en configuración TTS
- ✅ Extrae metadata de audio (duración, bitrate)
- ✅ Calcula hash de texto para deduplicación
- ✅ Almacena con cache de 1 año
- ✅ Crea metadata optimizada para búsquedas

#### **getTTSAudio()**

```typescript
async getTTSAudio(options: TTSAudioOptions): Promise<string | null>
```

**Sistema de Cache Inteligente:**
- Busca por hash de texto + configuración de voz
- Verifica expiración de cache
- Actualiza contador de acceso
- Retorna URL pública o signed URL

### **Métodos de Grabación**

#### **storeUserRecording()**

```typescript
async storeUserRecording(
  audioBlob: Blob,
  options: RecordingOptions,
  onProgress?: (progress: UploadProgress) => void  
): Promise<AudioProcessingResult>
```

**Características:**
- ✅ Validación de tamaño (10MB max)
- ✅ Metadata educativa específica
- ✅ Auto-delete después de 6 meses
- ✅ Cache privado (1 día)
- ✅ Estructura de carpetas por usuario

#### **getUserRecordings()**

```typescript
async getUserRecordings(
  userId: string,
  type?: 'pronunciation' | 'assessment' | 'portfolio',
  limit: number = 50
): Promise<StorageMetadata[]>
```

### **Utilidades de Audio**

#### **extractAudioMetadata()**

```typescript
private async extractAudioMetadata(
  file: File, 
  additionalMeta?: any
): Promise<AudioMetadata>
```

Usa HTML5 Audio API para extraer:
- Duración exacta
- Bitrate estimado
- Información de calidad

#### **generateTTSFileName()**

```typescript
private generateTTSFileName(options: TTSAudioOptions): string
```

Formato: `tts-{voice}-{language}-{storyId}-{chapterId}-{timestamp}.mp3`

#### **generateRecordingFileName()**

```typescript
private generateRecordingFileName(options: RecordingOptions): string  
```

Formato: `{type}-{timestamp}-{randomId}-{exerciseId}.webm`

---

## 🔐 Seguridad y Políticas RLS

### **Row Level Security Policies**

#### **story-assets Bucket (Público)**

```sql
-- Lectura pública
CREATE POLICY "Public read access for story assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-assets');

-- Escritura autenticada
CREATE POLICY "Authenticated upload to story assets"  
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-assets' 
  AND auth.role() = 'authenticated'
);

-- Actualización por creador o admin
CREATE POLICY "Creator or admin can update story assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'story-assets' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR auth.jwt() ->> 'role' = 'admin'
  )
);
```

#### **user-content Bucket (Privado)**

```sql  
-- Solo el propietario puede gestionar su contenido
CREATE POLICY "Users can manage their own content"
ON storage.objects FOR ALL
USING (
  bucket_id = 'user-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins pueden ver todo el contenido de usuario
CREATE POLICY "Admin read access to user content"  
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-content'
  AND auth.jwt() ->> 'role' = 'admin'
);
```

#### **learning-resources Bucket (Educativo)**

```sql
-- Profesores pueden gestionar recursos educativos
CREATE POLICY "Teachers can manage learning resources"
ON storage.objects FOR ALL  
USING (
  bucket_id = 'learning-resources'
  AND auth.jwt() ->> 'role' IN ('teacher', 'admin')
);

-- Estudiantes pueden leer recursos asignados
CREATE POLICY "Students read assigned resources"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'learning-resources'
  AND auth.role() = 'authenticated'
  -- Lógica adicional para verificar asignación
);
```

### **Validación de Contexto Educativo**

```typescript
// Validación estricta por contexto
private validateEducationalContext(
  context: EducationalContext,
  file: File,
  userId?: string
): ValidationResult {
  const contextConfig = this.educationalContexts[context];
  const errors: string[] = [];

  // Validar tamaño específico del contexto
  if (file.size > contextConfig.maxSize) {
    errors.push(
      `File size exceeds limit for ${context} context: ${this.formatBytes(contextConfig.maxSize)}`
    );
  }

  // Validar formatos permitidos
  if (contextConfig.allowedFormats && 
      !contextConfig.allowedFormats.includes(file.type)) {
    errors.push(
      `File format ${file.type} not allowed for ${context} context`
    );
  }

  // Validación específica por contexto
  switch (context) {
    case 'avatar':
      if (!userId) {
        errors.push('User ID required for avatar uploads');
      }
      break;
      
    case 'tts':
      // TTS files should be audio only
      if (!file.type.startsWith('audio/')) {
        errors.push('TTS context requires audio files');
      }
      break;
      
    case 'certificate':
      // Certificates should be PDF
      if (file.type !== 'application/pdf') {
        errors.push('Certificates must be PDF format');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}
```

---

## ⚡ Optimización y Performance

### **Sistema de Cache Multi-Nivel**

```typescript
// Cache de metadatos en memoria (desarrollo)
private metadataCache = new Map<string, StorageMetadata>();

// Cache de URLs firmadas
private signedUrlCache = new Map<string, {
  url: string;
  expiresAt: number;
}>();

// Cache inteligente por contexto
private getCacheStrategy(context: EducationalContext): CacheStrategy {
  const strategies = {
    tts: { duration: '1y', strategy: 'aggressive' },      // Cache agresivo
    avatar: { duration: '1d', strategy: 'moderate' },     // Cache moderado
    recording: { duration: '1h', strategy: 'minimal' },   // Cache mínimo
    temp: { duration: '5m', strategy: 'none' }           // Sin cache
  };

  return strategies[context] || strategies.temp;
}
```

### **Deduplicación por Hash**

```typescript
async calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Buscar duplicados antes de upload
private async findDuplicateFile(
  hash: string,
  bucket: StorageBucket,
  context: EducationalContext
): Promise<StorageMetadata | null> {
  const { data } = await this.supabase
    .from('storage_metadata')
    .select('*')
    .eq('bucket_id', bucket)
    .eq('educational_context', context)
    .eq('metadata->file_hash', hash)
    .limit(1)
    .single();
    
  return data;
}
```

### **Compresión Automática**

```typescript
// Compresión de imágenes a WebP
private async compressImage(
  file: File, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Redimensionar si es necesario
      const maxDimension = 2048;
      let { width, height } = img;
      
      if (width > maxDimension || height > maxDimension) {
        const scale = Math.min(maxDimension / width, maxDimension / height);
        width *= scale;
        height *= scale;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File(
            [blob!], 
            file.name.replace(/\.[^/.]+$/, '.webp'),
            { type: 'image/webp' }
          );
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}
```

---

## 📊 Monitoreo y Analytics

### **Métricas de Storage**

```typescript
interface StorageMetrics {
  totalFiles: number;
  totalSize: number;           // bytes
  averageFileSize: number;
  filesByContext: Record<EducationalContext, number>;
  uploadsByDate: Record<string, number>;
  topUsers: Array<{ userId: string; fileCount: number }>;
  storageByBucket: Record<StorageBucket, {
    fileCount: number;
    totalSize: number;
  }>;
}

async getStorageMetrics(
  timeframe: '24h' | '7d' | '30d' = '7d'
): Promise<StorageMetrics> {
  // Implementación con queries agregadas
}
```

### **Health Check**

```typescript
async healthCheck(): Promise<{
  storage: boolean;
  buckets: Record<StorageBucket, boolean>;
  policies: boolean;
  performance: {
    uploadLatency: number;    // ms
    downloadLatency: number; // ms
  };
}> {
  // Implementación de health check completo
}
```

---

## 🔗 Referencias de Configuración

### **Variables de Entorno**

```env
# Supabase Storage
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage específico  
STORAGE_MAX_FILE_SIZE=52428800          # 50MB default
STORAGE_CACHE_DURATION=3600             # 1 hour default
STORAGE_COMPRESSION_ENABLED=true
STORAGE_DEDUPLICATION_ENABLED=true
```

### **Configuración de Buckets (SQL)**

```sql
-- Crear buckets si no existen
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('story-assets', 'story-assets', true, 52428800),
  ('user-content', 'user-content', false, 20971520),
  ('learning-resources', 'learning-resources', false, 31457280)
ON CONFLICT (id) DO NOTHING;
```

### **Índices de Performance**

```sql
-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_storage_metadata_user_context 
ON storage_metadata (user_id, educational_context);

CREATE INDEX IF NOT EXISTS idx_storage_metadata_bucket_created 
ON storage_metadata (bucket_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_storage_metadata_hash 
ON storage_metadata USING btree ((metadata->>'file_hash'));
```

---

**💡 Pro Tip**: Este sistema de Storage está diseñado para escalar con las necesidades educativas. La arquitectura modular permite extender fácilmente con nuevos contextos educativos y servicios especializados según las necesidades del proyecto.

**🔒 Nota de Seguridad**: Todas las operaciones respetan las políticas RLS de Supabase. Los contextos educativos incluyen validaciones adicionales para cumplir con regulaciones como COPPA y FERPA para protección de datos de estudiantes.