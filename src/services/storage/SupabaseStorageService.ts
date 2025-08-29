/**
 * Supabase Storage Service for The Vaughan Storyteller
 * Servicio principal para gestión de archivos multimedia educativos
 */

import { supabase } from '../supabase/client';
import type { 
  StorageService,
  StorageBucket,
  FileType,
  UploadOptions, 
  UploadResult,
  DownloadOptions,
  DownloadResult,
  StorageMetadata,
  StorageFile,
  UserStorageStats,
  ValidationResult
} from '../../types/storage';

export class SupabaseStorageService implements StorageService {
  private readonly bucketConfigs = {
    'story-assets': {
      id: 'story-assets' as const,
      name: 'Story Assets',
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'
      ]
    },
    'user-content': {
      id: 'user-content' as const,
      name: 'User Content',
      public: false,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'
      ]
    },
    'learning-resources': {
      id: 'learning-resources' as const,
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

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  validateFile(file: File, bucket: StorageBucket, educationalContext: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const bucketConfig = this.bucketConfigs[bucket as keyof typeof this.bucketConfigs];

    // Validar tamaño
    if (file.size > bucketConfig.fileSizeLimit) {
      errors.push(`File size (${this.formatBytes(file.size)}) exceeds limit of ${this.formatBytes(bucketConfig.fileSizeLimit)}`);
    }

    // Validar tipo MIME
    if (!bucketConfig.allowedMimeTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed in bucket ${bucket}`);
    }

    // Validaciones específicas por contexto educativo
    const contextLimits = {
      avatar: 5242880, // 5MB
      recording: 10485760, // 10MB
      portfolio: 15728640, // 15MB
      tts: 52428800, // 50MB
      illustration: 20971520, // 20MB
      banner: 10485760, // 10MB
      certificate: 5242880, // 5MB
      vocabulary: 2097152, // 2MB
    };

    const contextLimit = contextLimits[educationalContext as keyof typeof contextLimits];
    if (contextLimit && file.size > contextLimit) {
      errors.push(`File size exceeds limit for ${educationalContext} context: ${this.formatBytes(contextLimit)}`);
    }

    // Validar extensión de archivo
    const fileName = file.name.toLowerCase();
    const allowedExtensions = this.getMimeTypeExtensions(bucketConfig.allowedMimeTypes);
    const fileExtension = fileName.split('.').pop() || '';
    
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension .${fileExtension} is not allowed`);
    }

    // Advertencias para optimización
    if (file.type.startsWith('image/') && file.size > 5242880) { // >5MB para imágenes
      warnings.push('Large image file detected. Consider optimizing for better performance.');
    }

    if (file.type.startsWith('audio/') && file.size > 20971520) { // >20MB para audio
      warnings.push('Large audio file detected. Consider compressing for better streaming.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        size: file.size,
        type: file.type
      }
    };
  }

  private getMimeTypeExtensions(mimeTypes: string[]): string[] {
    const mimeToExt: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/jpg': ['jpg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'image/gif': ['gif'],
      'audio/mpeg': ['mp3'],
      'audio/mp3': ['mp3'],
      'audio/wav': ['wav'],
      'audio/ogg': ['ogg'],
      'audio/webm': ['webm'],
      'audio/mp4': ['mp4'],
      'audio/x-m4a': ['m4a'],
      'application/pdf': ['pdf'],
      'text/plain': ['txt'],
      'application/json': ['json']
    };

    return mimeTypes.flatMap(mime => mimeToExt[mime] || []);
  }

  // ============================================================================
  // UPLOAD OPERATIONS
  // ============================================================================

  async upload(
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(options.file, options.bucket, options.educationalContext);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Crear ruta única si no se proporciona
      const finalPath = options.path || this.generateUniqueFileName(
        options.file.name, 
        options.bucket, 
        options.educationalContext
      );

      // Preparar opciones de upload
      const uploadOptions = {
        cacheControl: options.options?.cacheControl || this.getDefaultCacheControl(options.bucket),
        contentType: options.options?.contentType || options.file.type,
        upsert: options.options?.upsert || false,
        ...options.options
      };

      // Realizar upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(finalPath, options.file, uploadOptions);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`
        };
      }

      // Crear metadata
      const metadata: Partial<StorageMetadata> = {
        storage_path: finalPath,
        bucket_id: options.bucket,
        ...(options.userId && { user_id: options.userId }),
        content_type: options.file.type as FileType,
        file_size: options.file.size,
        original_name: options.file.name,
        educational_context: options.educationalContext,
        metadata: {
          ...options.metadata,
          uploaded_at: new Date().toISOString(),
          file_hash: await this.calculateFileHash(options.file)
        }
      };

      // Guardar metadata en base de datos
      const { data: metadataData, error: metadataError } = await supabase
        .from('storage_metadata')
        .insert(metadata)
        .select()
        .single();

      if (metadataError) {
        console.warn('Failed to save storage metadata:', metadataError);
        // No fallamos el upload por esto, solo advertimos
      }

      // Obtener URLs
      const publicUrl = this.bucketConfigs[options.bucket as keyof typeof this.bucketConfigs].public 
        ? this.getPublicUrl(options.bucket, finalPath)
        : undefined;

      const signedUrl = !this.bucketConfigs[options.bucket as keyof typeof this.bucketConfigs].public
        ? await this.getSignedUrl(options.bucket, finalPath, 3600) // 1 hora
        : undefined;

      return {
        success: true,
        data: {
          id: uploadData.id || crypto.randomUUID(),
          path: finalPath,
          fullPath: `${options.bucket}/${finalPath}`,
          ...(publicUrl && { publicUrl }),
          ...(signedUrl && { signedUrl }),
          metadata: metadataData as StorageMetadata
        }
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // ============================================================================
  // DOWNLOAD OPERATIONS
  // ============================================================================

  async download(options: DownloadOptions): Promise<DownloadResult> {
    try {
      // Para archivos públicos, usar URL pública
      if (this.bucketConfigs[options.bucket as keyof typeof this.bucketConfigs].public) {
        const publicUrl = this.getPublicUrl(options.bucket, options.path);
        
        // Aplicar transformaciones si se especifican
        const transformedUrl = options.transform 
          ? this.applyImageTransforms(publicUrl)
          : publicUrl;

        return {
          success: true,
          data: {
            url: transformedUrl,
            contentType: this.guessContentType(options.path)
          }
        };
      }

      // Para archivos privados, usar URL firmada
      const signedUrl = await this.getSignedUrl(options.bucket, options.path, 3600);
      
      return {
        success: true,
        data: {
          url: signedUrl,
          signedUrl,
          contentType: this.guessContentType(options.path)
        }
      };

    } catch (error) {
      console.error('Download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      };
    }
  }

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  async delete(bucket: StorageBucket, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Eliminar archivo de storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (storageError) {
        return {
          success: false,
          error: `Failed to delete file: ${storageError.message}`
        };
      }

      // Eliminar metadata
      const { error: metadataError } = await supabase
        .from('storage_metadata')
        .delete()
        .eq('storage_path', path)
        .eq('bucket_id', bucket);

      if (metadataError) {
        console.warn('Failed to delete storage metadata:', metadataError);
        // No fallamos la eliminación por esto
      }

      return { success: true };

    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  // ============================================================================
  // URL OPERATIONS
  // ============================================================================

  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  async getSignedUrl(bucket: StorageBucket, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  // ============================================================================
  // METADATA OPERATIONS
  // ============================================================================

  async getMetadata(bucket: StorageBucket, path: string): Promise<StorageMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('storage_metadata')
        .select('*')
        .eq('storage_path', path)
        .eq('bucket_id', bucket)
        .single();

      if (error || !data) {
        return null;
      }

      return data as StorageMetadata;
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return null;
    }
  }

  async updateMetadata(
    bucket: StorageBucket, 
    path: string, 
    metadata: Partial<StorageMetadata>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('storage_metadata')
        .update(metadata)
        .eq('storage_path', path)
        .eq('bucket_id', bucket);

      return !error;
    } catch (error) {
      console.error('Failed to update metadata:', error);
      return false;
    }
  }

  // ============================================================================
  // STATISTICS OPERATIONS
  // ============================================================================

  async getUserStorageStats(userId: string): Promise<UserStorageStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_storage_stats', { user_uuid: userId });

      if (error) {
        console.error('Failed to get storage stats:', error);
        return this.getDefaultStorageStats();
      }

      return {
        ...data,
        quota_used_percentage: this.calculateQuotaPercentage(data.total_size_bytes),
        quota_limit_bytes: this.getUserQuotaLimit()
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return this.getDefaultStorageStats();
    }
  }

  // ============================================================================
  // LIST OPERATIONS
  // ============================================================================

  async listFiles(
    bucket: StorageBucket, 
    prefix?: string, 
    userId?: string
  ): Promise<StorageFile[]> {
    try {
      // Construir prefix basado en usuario si es bucket privado
      let searchPrefix = prefix;
      if (!this.bucketConfigs[bucket as keyof typeof this.bucketConfigs].public && userId && !prefix) {
        searchPrefix = userId;
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(searchPrefix, {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Failed to list files:', error);
        return [];
      }

      // Enriquecer con metadata
      const enrichedFiles = await Promise.all(
        data.map(async (file: { name: string; id?: string; updated_at?: string; created_at?: string; last_accessed_at?: string }) => {
          const fullPath = searchPrefix ? `${searchPrefix}/${file.name}` : file.name;
          const metadata = await this.getMetadata(bucket, fullPath);
          
          return {
            name: file.name,
            id: file.id || crypto.randomUUID(),
            updated_at: file.updated_at || new Date().toISOString(),
            created_at: file.created_at || new Date().toISOString(),
            last_accessed_at: file.last_accessed_at,
            metadata: metadata || undefined,
            size: metadata?.file_size,
            mimetype: metadata?.content_type,
            publicUrl: this.bucketConfigs[bucket as keyof typeof this.bucketConfigs].public 
              ? this.getPublicUrl(bucket, fullPath)
              : undefined
          } as StorageFile;
        })
      );

      return enrichedFiles;
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateUniqueFileName(
    originalName: string, 
    _bucket: StorageBucket, 
    context: string
  ): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop() || '';
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    
    // Sanitizar nombre
    const sanitizedBaseName = baseName
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    return `${context}/${timestamp}-${randomId}-${sanitizedBaseName}.${extension}`;
  }

  private getDefaultCacheControl(bucket: StorageBucket): string {
    const cacheControls = {
      'story-assets': 'public, max-age=31536000', // 1 año para assets
      'user-content': 'private, max-age=86400',   // 1 día para contenido usuario
      'learning-resources': 'private, max-age=2592000' // 1 mes para recursos
    };

    return cacheControls[bucket];
  }

  private async calculateFileHash(file: File): Promise<string> {
    // Calcular hash simple para deduplicación
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  private applyImageTransforms(url: string): string {
    // Para futuro: integrar con servicio de transformación de imágenes
    // Por ahora retornar URL original
    return url;
  }

  private guessContentType(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'webm': 'audio/webm',
      'm4a': 'audio/x-m4a',
      'pdf': 'application/pdf'
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  protected formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private calculateQuotaPercentage(usedBytes: number): number {
    const defaultQuota = 1073741824; // 1GB por defecto
    return Math.min((usedBytes / defaultQuota) * 100, 100);
  }

  private getUserQuotaLimit(): number {
    // Por defecto 1GB, en el futuro consultar desde base de datos
    return 1073741824;
  }

  private getDefaultStorageStats(): UserStorageStats {
    return {
      total_files: 0,
      total_size_bytes: 0,
      total_size_mb: 0,
      by_content_type: {},
      by_educational_context: {},
      quota_used_percentage: 0,
      quota_limit_bytes: 1073741824
    };
  }
}

// Singleton instance
export const storageService = new SupabaseStorageService();