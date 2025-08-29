/**
 * Storage Types for The Vaughan Storyteller
 * Tipos TypeScript para integración con Supabase Storage
 */

// ============================================================================
// BUCKET TYPES
// ============================================================================

export type StorageBucket = 'story-assets' | 'user-content' | 'learning-resources';

export interface BucketConfig {
  id: StorageBucket;
  name: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}

// ============================================================================
// FILE TYPES
// ============================================================================

export type FileType = 
  | 'image/jpeg' 
  | 'image/jpg' 
  | 'image/png' 
  | 'image/webp' 
  | 'image/gif'
  | 'audio/mpeg' 
  | 'audio/mp3' 
  | 'audio/wav' 
  | 'audio/ogg' 
  | 'audio/webm' 
  | 'audio/mp4'
  | 'audio/x-m4a'
  | 'application/pdf'
  | 'text/plain'
  | 'application/json';

export type EducationalContext = 
  | 'tts'           // Audio generado por ElevenLabs
  | 'avatar'        // Avatar de usuario
  | 'recording'     // Grabación de pronunciación del usuario
  | 'illustration'  // Ilustración de historia
  | 'banner'        // Banner administrativo
  | 'certificate'   // Certificado de logro
  | 'vocabulary'    // Imagen de vocabulario
  | 'report'        // Reporte de progreso
  | 'portfolio'     // Archivo de portfolio del usuario
  | 'temp'          // Archivo temporal
  | 'draft';        // Borrador

// ============================================================================
// STORAGE METADATA
// ============================================================================

export interface StorageMetadata {
  id: string;
  storage_path: string;
  bucket_id: StorageBucket;
  user_id?: string;
  content_type: FileType;
  file_size?: number;
  original_name?: string;
  educational_context: EducationalContext;
  metadata: Record<string, unknown>;
  access_count: number;
  last_accessed?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File;
  educationalContext: EducationalContext;
  metadata?: Record<string, unknown>;
  userId?: string;
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
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

// ============================================================================
// DOWNLOAD TYPES
// ============================================================================

export interface DownloadOptions {
  bucket: StorageBucket;
  path: string;
  userId?: string;
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  };
}

export interface DownloadResult {
  success: boolean;
  data?: {
    url: string;
    signedUrl?: string;
    blob?: Blob;
    size?: number;
    contentType?: string;
  };
  error?: string;
}

// ============================================================================
// AUDIO SPECIFIC TYPES
// ============================================================================

export interface AudioMetadata {
  duration?: number; // en segundos
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  voice?: string; // Para TTS
  language?: string;
  generated_at?: string;
  story_id?: string;
  chapter_id?: string;
}

export interface AudioUploadOptions extends Omit<UploadOptions, 'educationalContext'> {
  educationalContext: 'tts' | 'recording';
  audioMetadata?: AudioMetadata;
}

// ============================================================================
// IMAGE SPECIFIC TYPES
// ============================================================================

export interface ImageMetadata {
  width?: number;
  height?: number;
  dimensions?: string; // "800x600"
  alt_text?: string;
  caption?: string;
  story_id?: string;
  user_id?: string;
}

export interface ImageUploadOptions extends Omit<UploadOptions, 'educationalContext'> {
  educationalContext: 'avatar' | 'illustration' | 'banner' | 'vocabulary' | 'certificate';
  imageMetadata?: ImageMetadata;
  transform?: {
    resize?: { width: number; height: number };
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
}

// ============================================================================
// STORAGE SERVICE TYPES
// ============================================================================

export interface StorageService {
  // Operaciones básicas
  upload(options: UploadOptions, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult>;
  download(options: DownloadOptions): Promise<DownloadResult>;
  delete(bucket: StorageBucket, path: string): Promise<{ success: boolean; error?: string }>;
  
  // URLs
  getPublicUrl(bucket: StorageBucket, path: string): string;
  getSignedUrl(bucket: StorageBucket, path: string, expiresIn?: number): Promise<string>;
  
  // Metadata
  getMetadata(bucket: StorageBucket, path: string): Promise<StorageMetadata | null>;
  updateMetadata(bucket: StorageBucket, path: string, metadata: Partial<StorageMetadata>): Promise<boolean>;
  
  // Estadísticas
  getUserStorageStats(userId: string): Promise<UserStorageStats>;
  
  // Listado
  listFiles(bucket: StorageBucket, prefix?: string, userId?: string): Promise<StorageFile[]>;
}

export interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at?: string;
  metadata?: StorageMetadata;
  size?: number;
  mimetype?: string;
  publicUrl?: string;
}

export interface UserStorageStats {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  by_content_type: Record<string, number>;
  by_educational_context: Record<string, number>;
  quota_used_percentage: number;
  quota_limit_bytes: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface StorageError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export type StorageErrorCode = 
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'UNAUTHORIZED'
  | 'FILE_NOT_FOUND'
  | 'QUOTA_EXCEEDED'
  | 'UPLOAD_FAILED'
  | 'DOWNLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface FileValidationRules {
  maxSize: number; // bytes
  allowedTypes: FileType[];
  allowedExtensions: string[];
  requiredDimensions?: { width: number; height: number };
  maxDimensions?: { width: number; height: number };
  minDimensions?: { width: number; height: number };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    size: number;
    type: string;
    dimensions?: { width: number; height: number };
    duration?: number; // for audio/video
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const BUCKET_CONFIGS: Record<StorageBucket, BucketConfig> = {
  'story-assets': {
    id: 'story-assets',
    name: 'Story Assets',
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'
    ]
  },
  'user-content': {
    id: 'user-content',
    name: 'User Content',
    public: false,
    fileSizeLimit: 20971520, // 20MB
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'
    ]
  },
  'learning-resources': {
    id: 'learning-resources',
    name: 'Learning Resources',
    public: false,
    fileSizeLimit: 31457280, // 30MB
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'text/plain', 'application/json',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'
    ]
  }
};

export const FILE_SIZE_LIMITS = {
  avatar: 5242880, // 5MB
  recording: 10485760, // 10MB
  portfolio: 15728640, // 15MB
  tts: 52428800, // 50MB
  illustration: 20971520, // 20MB
  banner: 10485760, // 10MB
  certificate: 5242880, // 5MB
  vocabulary: 2097152, // 2MB
} as const;

export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'
] as const;

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
] as const;