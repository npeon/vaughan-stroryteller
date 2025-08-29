/**
 * Avatar Management Composable
 * Composable para gestión de avatares de usuario con Supabase Storage
 */

import { ref, computed, readonly } from 'vue';
import { useAuthUser } from './useAuthUser';
import { storageService } from '../services/storage/SupabaseStorageService';
import type { 
  ImageUploadOptions, 
  UploadResult,
  StorageMetadata 
} from '../types/storage';

export interface AvatarUploadOptions {
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX?: number;
    scaleY?: number;
  };
  quality?: number; // 0.1 - 1.0
}

export interface AvatarValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    size: number;
    dimensions?: { width: number; height: number };
    format: string;
  };
}

export function useAvatar() {
  const { user } = useAuthUser();
  
  // Estado reactivo
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const currentAvatar = ref<string | null>(null);
  const avatarMetadata = ref<StorageMetadata | null>(null);
  const error = ref<string | null>(null);

  // Configuración de avatares
  const AVATAR_CONFIG = {
    MAX_SIZE: 5242880, // 5MB
    MIN_DIMENSIONS: { width: 100, height: 100 },
    MAX_DIMENSIONS: { width: 2048, height: 2048 },
    RECOMMENDED_SIZE: { width: 400, height: 400 },
    ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    QUALITY: 0.8,
    DEFAULT_AVATAR: '/images/default-avatar.png'
  };

  // URLs de avatar computadas
  const avatarUrl = computed(() => {
    return currentAvatar.value || AVATAR_CONFIG.DEFAULT_AVATAR;
  });

  const hasCustomAvatar = computed(() => {
    return currentAvatar.value !== null && currentAvatar.value !== AVATAR_CONFIG.DEFAULT_AVATAR;
  });

  // ============================================================================
  // AVATAR VALIDATION
  // ============================================================================

  const validateAvatarFile = async (file: File): Promise<AvatarValidation> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar tamaño
    if (file.size > AVATAR_CONFIG.MAX_SIZE) {
      errors.push(`File size (${formatBytes(file.size)}) exceeds maximum of ${formatBytes(AVATAR_CONFIG.MAX_SIZE)}`);
    }

    // Validar formato
    if (!AVATAR_CONFIG.ALLOWED_FORMATS.includes(file.type)) {
      errors.push(`Format ${file.type} not supported. Use JPG, PNG, or WebP.`);
    }

    // Validar dimensiones
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < AVATAR_CONFIG.MIN_DIMENSIONS.width || 
        dimensions.height < AVATAR_CONFIG.MIN_DIMENSIONS.height) {
      errors.push(`Image too small. Minimum size: ${AVATAR_CONFIG.MIN_DIMENSIONS.width}x${AVATAR_CONFIG.MIN_DIMENSIONS.height}px`);
    }

    if (dimensions.width > AVATAR_CONFIG.MAX_DIMENSIONS.width || 
        dimensions.height > AVATAR_CONFIG.MAX_DIMENSIONS.height) {
      warnings.push(`Large image detected. Will be resized to ${AVATAR_CONFIG.MAX_DIMENSIONS.width}x${AVATAR_CONFIG.MAX_DIMENSIONS.height}px`);
    }

    // Validar aspecto
    const aspectRatio = dimensions.width / dimensions.height;
    if (aspectRatio < 0.8 || aspectRatio > 1.2) {
      warnings.push('Non-square images work best as avatars. Consider cropping to square.');
    }

    // Advertencias de optimización
    if (file.size > 1048576 && file.type !== 'image/webp') { // >1MB y no WebP
      warnings.push('Consider using WebP format for better compression.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        size: file.size,
        dimensions,
        format: file.type
      }
    };
  };

  // ============================================================================
  // AVATAR UPLOAD
  // ============================================================================

  const uploadAvatar = async (options: AvatarUploadOptions): Promise<UploadResult> => {
    if (!user.value) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    try {
      error.value = null;
      isUploading.value = true;
      uploadProgress.value = 0;

      // Validar archivo
      const validation = await validateAvatarFile(options.file);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      uploadProgress.value = 10;

      // Procesar imagen si se necesita
      let processedFile = options.file;
      
      if (options.cropData || options.quality || shouldResize(validation.metadata?.dimensions)) {
        processedFile = await processAvatarImage(options.file, {
          crop: options.cropData,
          quality: options.quality || AVATAR_CONFIG.QUALITY,
          resize: getOptimalSize(validation.metadata?.dimensions)
        });
      }

      uploadProgress.value = 30;

      // Preparar upload options
      const uploadOptions: ImageUploadOptions = {
        bucket: 'user-content',
        path: `${user.value.id}/avatars/avatar-${Date.now()}.webp`,
        file: processedFile,
        educationalContext: 'avatar',
        userId: user.value.id,
        imageMetadata: {
          dimensions: `${AVATAR_CONFIG.RECOMMENDED_SIZE.width}x${AVATAR_CONFIG.RECOMMENDED_SIZE.height}`,
          alt_text: `Avatar for ${user.value.email}`,
          user_id: user.value.id
        },
        metadata: {
          original_filename: options.file.name,
          original_size: options.file.size,
          processed_size: processedFile.size,
          crop_applied: !!options.cropData,
          quality_applied: options.quality || AVATAR_CONFIG.QUALITY
        },
        options: {
          cacheControl: 'private, max-age=86400',
          upsert: true
        }
      };

      // Realizar upload
      const result = await storageService.upload(uploadOptions);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Upload failed');
      }

      // Actualizar avatar actual
      currentAvatar.value = result.data.publicUrl || result.data.signedUrl || null;
      avatarMetadata.value = result.data.metadata;

      // Eliminar avatar anterior si existe
      await cleanupOldAvatar(user.value.id, result.data.path);

      uploadProgress.value = 100;

      return result;

    } catch (err) {
      console.error('Avatar upload failed:', err);
      error.value = err instanceof Error ? err.message : 'Upload failed';
      
      return {
        success: false,
        error: error.value
      };
    } finally {
      isUploading.value = false;
    }
  };

  // ============================================================================
  // AVATAR MANAGEMENT
  // ============================================================================

  const loadCurrentAvatar = async (): Promise<void> => {
    if (!user.value) return;

    try {
      // Buscar avatar más reciente del usuario
      const files = await storageService.listFiles('user-content', `${user.value.id}/avatars`, user.value.id);
      
      if (files.length > 0) {
        const latestAvatar = files.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        if (latestAvatar?.publicUrl) {
          currentAvatar.value = latestAvatar.publicUrl;
          avatarMetadata.value = latestAvatar.metadata || null;
        } else if (latestAvatar?.name) {
          // Generar signed URL para avatar privado
          const signedUrl = await storageService.getSignedUrl('user-content', latestAvatar.name, 3600);
          currentAvatar.value = signedUrl;
          avatarMetadata.value = latestAvatar.metadata || null;
        }
      }
    } catch (err) {
      console.error('Failed to load current avatar:', err);
    }
  };

  const removeAvatar = async (): Promise<boolean> => {
    if (!user.value || !avatarMetadata.value) return false;

    try {
      const success = await storageService.delete('user-content', avatarMetadata.value.storage_path);
      
      if (success.success) {
        currentAvatar.value = null;
        avatarMetadata.value = null;
      }

      return success.success;
    } catch (err) {
      console.error('Failed to remove avatar:', err);
      return false;
    }
  };

  const generateAvatarUrl = (size: number = 400): string => {
    if (!currentAvatar.value) {
      return AVATAR_CONFIG.DEFAULT_AVATAR;
    }

    // Para avatares de Storage, agregar parámetros de transformación
    if (currentAvatar.value.includes('supabase')) {
      return `${currentAvatar.value}?width=${size}&height=${size}&resize=cover`;
    }

    return currentAvatar.value;
  };

  // ============================================================================
  // IMAGE PROCESSING UTILITIES
  // ============================================================================

  const processAvatarImage = async (
    file: File, 
    options: {
      crop?: AvatarUploadOptions['cropData'];
      quality?: number;
      resize?: { width: number; height: number };
    }
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          const { crop, quality = 0.8, resize } = options;
          
          // Determinar dimensiones finales
          const finalSize = resize || AVATAR_CONFIG.RECOMMENDED_SIZE;
          canvas.width = finalSize.width;
          canvas.height = finalSize.height;

          if (!ctx) {
            throw new Error('Canvas context not available');
          }

          // Aplicar crop si se especifica
          if (crop) {
            ctx.drawImage(
              img,
              crop.x, crop.y, crop.width, crop.height, // source
              0, 0, finalSize.width, finalSize.height  // destination
            );
          } else {
            // Centrar y escalar manteniendo aspecto
            const scale = Math.max(finalSize.width / img.width, finalSize.height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const offsetX = (finalSize.width - scaledWidth) / 2;
            const offsetY = (finalSize.height - scaledHeight) / 2;

            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          }

          // Convertir a blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to process image'));
                return;
              }

              const processedFile = new File(
                [blob], 
                `avatar-${Date.now()}.webp`, 
                { type: 'image/webp' }
              );
              
              resolve(processedFile);
            },
            'image/webp',
            quality
          );
        } catch (err) {
          reject(new Error(err instanceof Error ? err.message : 'Failed to process image'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for dimension check'));
        URL.revokeObjectURL(img.src);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const shouldResize = (dimensions?: { width: number; height: number }): boolean => {
    if (!dimensions) return false;
    return dimensions.width > AVATAR_CONFIG.MAX_DIMENSIONS.width || 
           dimensions.height > AVATAR_CONFIG.MAX_DIMENSIONS.height;
  };

  const getOptimalSize = (dimensions?: { width: number; height: number }) => {
    if (!dimensions || !shouldResize(dimensions)) {
      return AVATAR_CONFIG.RECOMMENDED_SIZE;
    }

    const scale = Math.min(
      AVATAR_CONFIG.MAX_DIMENSIONS.width / dimensions.width,
      AVATAR_CONFIG.MAX_DIMENSIONS.height / dimensions.height
    );

    return {
      width: Math.round(dimensions.width * scale),
      height: Math.round(dimensions.height * scale)
    };
  };

  const cleanupOldAvatar = async (userId: string, currentPath: string): Promise<void> => {
    try {
      const files = await storageService.listFiles('user-content', `${userId}/avatars`, userId);
      
      // Eliminar avatares antiguos, mantener solo los últimos 2
      const sortedFiles = files
        .filter((f: { name: string }) => f.name !== currentPath.split('/').pop())
        .sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(2); // Mantener solo los 2 más recientes

      for (const file of sortedFiles) {
        await storageService.delete('user-content', `${userId}/avatars/${file.name}`);
      }
    } catch (err) {
      console.warn('Failed to cleanup old avatars:', err);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  // Cargar avatar al inicializar
  if (user.value) {
    void loadCurrentAvatar();
  }

  return {
    // Estado
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    currentAvatar: readonly(currentAvatar),
    avatarMetadata: readonly(avatarMetadata),
    error: readonly(error),

    // Computadas
    avatarUrl,
    hasCustomAvatar,

    // Métodos
    validateAvatarFile,
    uploadAvatar,
    loadCurrentAvatar,
    removeAvatar,
    generateAvatarUrl,

    // Configuración
    AVATAR_CONFIG: readonly(AVATAR_CONFIG)
  };
}