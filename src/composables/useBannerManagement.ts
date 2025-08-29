/**
 * Banner Management Composable
 * Composable para gestión de banners administrativos con Supabase Storage
 */

import { ref, computed, readonly } from 'vue';
import { useAuthUser } from './useAuthUser';
import { storageService } from '../services/storage/SupabaseStorageService';
import { supabase } from '../services/supabase/client';
import type {
  ImageUploadOptions,
  UploadResult
} from '../types/storage';

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  image_path?: string;
  target_url?: string;
  is_active: boolean;
  display_order: number;
  target_audience: 'all' | 'students' | 'teachers' | 'premium';
  display_location: 'header' | 'sidebar' | 'story_end' | 'dashboard';
  start_date?: string;
  end_date?: string;
  click_count: number;
  impression_count: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface BannerUploadOptions {
  file: File;
  title: string;
  description?: string;
  targetUrl?: string;
  targetAudience?: Banner['target_audience'];
  displayLocation?: Banner['display_location'];
  isActive?: boolean;
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
}

export interface BannerValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    size: number;
    dimensions?: { width: number; height: number };
    format: string;
    aspectRatio?: number;
  };
}

export function useBannerManagement() {
  const { user } = useAuthUser();

  // Estado reactivo
  const banners = ref<Banner[]>([]);
  const isLoading = ref(false);
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);

  // Configuración de banners
  const BANNER_CONFIG = {
    MAX_SIZE: 10485760, // 10MB
    RECOMMENDED_DIMENSIONS: {
      header: { width: 1200, height: 200 },
      sidebar: { width: 300, height: 250 },
      story_end: { width: 600, height: 300 },
      dashboard: { width: 400, height: 200 }
    },
    MAX_DIMENSIONS: { width: 2048, height: 1024 },
    MIN_DIMENSIONS: { width: 200, height: 100 },
    ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    QUALITY: 0.85,
    ASPECT_RATIOS: {
      header: 6, // 6:1
      sidebar: 1.2, // 6:5
      story_end: 2, // 2:1
      dashboard: 2 // 2:1
    }
  };

  // Banners computados
  const activeBanners = computed(() => 
    banners.value.filter(banner => banner.is_active)
  );

  const bannersByLocation = computed(() => {
    const grouped: Record<string, Banner[]> = {};
    banners.value.forEach(banner => {
      if (!grouped[banner.display_location]) {
        grouped[banner.display_location] = [];
      }
      grouped[banner.display_location]!.push(banner);
    });
    
    // Ordenar por display_order
    Object.keys(grouped).forEach(location => {
      grouped[location]!.sort((a, b) => a.display_order - b.display_order);
    });

    return grouped;
  });

  const bannerStats = computed(() => {
    const stats = {
      total: banners.value.length,
      active: activeBanners.value.length,
      inactive: banners.value.length - activeBanners.value.length,
      totalClicks: banners.value.reduce((sum, b) => sum + b.click_count, 0),
      totalImpressions: banners.value.reduce((sum, b) => sum + b.impression_count, 0),
      averageCtr: 0
    };

    if (stats.totalImpressions > 0) {
      stats.averageCtr = (stats.totalClicks / stats.totalImpressions) * 100;
    }

    return stats;
  });

  // ============================================================================
  // BANNER VALIDATION
  // ============================================================================

  const validateBannerImage = async (
    file: File, 
    location: Banner['display_location']
  ): Promise<BannerValidation> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar tamaño
    if (file.size > BANNER_CONFIG.MAX_SIZE) {
      errors.push(`File size (${formatBytes(file.size)}) exceeds maximum of ${formatBytes(BANNER_CONFIG.MAX_SIZE)}`);
    }

    // Validar formato
    if (!BANNER_CONFIG.ALLOWED_FORMATS.includes(file.type)) {
      errors.push(`Format ${file.type} not supported. Use JPG, PNG, or WebP.`);
    }

    // Validar dimensiones
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < BANNER_CONFIG.MIN_DIMENSIONS.width || 
        dimensions.height < BANNER_CONFIG.MIN_DIMENSIONS.height) {
      errors.push(`Image too small. Minimum size: ${BANNER_CONFIG.MIN_DIMENSIONS.width}x${BANNER_CONFIG.MIN_DIMENSIONS.height}px`);
    }

    if (dimensions.width > BANNER_CONFIG.MAX_DIMENSIONS.width || 
        dimensions.height > BANNER_CONFIG.MAX_DIMENSIONS.height) {
      warnings.push(`Large image detected. Will be resized to fit ${BANNER_CONFIG.MAX_DIMENSIONS.width}x${BANNER_CONFIG.MAX_DIMENSIONS.height}px`);
    }

    // Validar aspecto según ubicación
    const aspectRatio = dimensions.width / dimensions.height;
    const expectedRatio = BANNER_CONFIG.ASPECT_RATIOS[location];
    const ratioDifference = Math.abs(aspectRatio - expectedRatio);

    if (ratioDifference > 0.5) {
      warnings.push(`Aspect ratio ${aspectRatio.toFixed(2)}:1 doesn't match recommended ${expectedRatio}:1 for ${location} banners`);
    }

    // Validar dimensiones recomendadas
    const recommended = BANNER_CONFIG.RECOMMENDED_DIMENSIONS[location];
    if (dimensions.width !== recommended.width || dimensions.height !== recommended.height) {
      warnings.push(`Recommended size for ${location}: ${recommended.width}x${recommended.height}px`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        size: file.size,
        dimensions,
        format: file.type,
        aspectRatio
      }
    };
  };

  // ============================================================================
  // BANNER MANAGEMENT
  // ============================================================================

  const loadBanners = async (): Promise<void> => {
    if (!user.value) return;

    try {
      isLoading.value = true;
      error.value = null;

      const { data, error: dbError } = await supabase
        .from('ad_banners')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      banners.value = data || [];

    } catch (err) {
      console.error('Failed to load banners:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load banners';
    } finally {
      isLoading.value = false;
    }
  };

  const createBanner = async (options: BannerUploadOptions): Promise<UploadResult> => {
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

      // Validar imagen
      const validation = await validateBannerImage(
        options.file, 
        options.displayLocation || 'header'
      );

      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      uploadProgress.value = 20;

      // Procesar imagen si es necesario
      let processedFile = options.file;
      const location = options.displayLocation || 'header';
      
      if (shouldResizeImage(validation.metadata?.dimensions, location)) {
        processedFile = await resizeBannerImage(options.file, location);
      }

      uploadProgress.value = 40;

      // Subir imagen a Storage
      const timestamp = Date.now();
      const fileName = `banner-${location}-${timestamp}.webp`;
      
      const uploadOptions: ImageUploadOptions = {
        bucket: 'story-assets',
        path: `banners/${fileName}`,
        file: processedFile,
        educationalContext: 'banner',
        userId: user.value.id,
        imageMetadata: {
          dimensions: `${validation.metadata?.dimensions?.width || 300}x${validation.metadata?.dimensions?.height || 200}`,
          alt_text: options.title,
          ...(options.description && { caption: options.description })
        },
        metadata: {
          original_filename: options.file.name,
          banner_location: location,
          banner_audience: options.targetAudience || 'all',
          created_by: user.value.id,
          processed: shouldResizeImage(validation.metadata?.dimensions, location)
        },
        options: {
          cacheControl: 'public, max-age=2592000', // 30 días
          upsert: false
        }
      };

      const uploadResult = await storageService.upload(uploadOptions);

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      uploadProgress.value = 80;

      // Crear registro en base de datos
      const bannerData = {
        title: options.title,
        description: options.description,
        image_url: uploadResult.data.publicUrl,
        image_path: uploadResult.data.path,
        target_url: options.targetUrl,
        is_active: options.isActive || false,
        display_order: options.displayOrder || getNextDisplayOrder(location),
        target_audience: options.targetAudience || 'all',
        display_location: location,
        start_date: options.startDate,
        end_date: options.endDate,
        click_count: 0,
        impression_count: 0,
        metadata: {
          image_metadata: uploadResult.data.metadata,
          original_file: options.file.name,
          created_via: 'admin_panel'
        },
        created_by: user.value.id
      };

      const { data: bannerRecord, error: dbError } = await supabase
        .from('ad_banners')
        .insert(bannerData)
        .select()
        .single();

      if (dbError) throw dbError;

      uploadProgress.value = 100;

      // Actualizar lista local
      banners.value.unshift(bannerRecord);

      return {
        success: true,
        data: uploadResult.data
      };

    } catch (err) {
      console.error('Banner creation failed:', err);
      error.value = err instanceof Error ? err.message : 'Banner creation failed';
      
      return {
        success: false,
        error: error.value
      };
    } finally {
      isUploading.value = false;
    }
  };

  const updateBanner = async (
    id: string, 
    updates: Partial<Banner>
  ): Promise<boolean> => {
    try {
      const { error: dbError } = await supabase
        .from('ad_banners')
        .update({
          ...(updates as Record<string, unknown>), // Type assertion for updates
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (dbError) throw dbError;

      // Actualizar lista local
      const index = banners.value.findIndex(b => b.id === id);
      if (index !== -1 && banners.value[index]) {
        const currentBanner = banners.value[index];
        const updatedFields: Record<string, unknown> = {};
        
        // Solo copiar campos que no son undefined
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined) {
            updatedFields[key] = value;
          }
        });
        
        banners.value[index] = { ...currentBanner, ...updatedFields } as Banner;
      }

      return true;

    } catch (err) {
      console.error('Failed to update banner:', err);
      error.value = err instanceof Error ? err.message : 'Update failed';
      return false;
    }
  };

  const deleteBanner = async (id: string): Promise<boolean> => {
    try {
      const banner = banners.value.find(b => b.id === id);
      if (!banner) return false;

      // Eliminar imagen de Storage si existe
      if (banner.image_path) {
        await storageService.delete('story-assets', banner.image_path);
      }

      // Eliminar registro de base de datos
      const { error: dbError } = await supabase
        .from('ad_banners')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Actualizar lista local
      banners.value = banners.value.filter(b => b.id !== id);

      return true;

    } catch (err) {
      console.error('Failed to delete banner:', err);
      error.value = err instanceof Error ? err.message : 'Delete failed';
      return false;
    }
  };

  const toggleBannerStatus = async (id: string): Promise<boolean> => {
    const banner = banners.value.find(b => b.id === id);
    if (!banner) return false;

    return updateBanner(id, { is_active: !banner.is_active });
  };

  const reorderBanners = async (
    // location: Banner['display_location'],
    newOrder: string[]
  ): Promise<boolean> => {
    try {
      // Actualizar orden en base de datos
      const updates = newOrder.map((id, index) => ({
        id,
        display_order: index + 1
      }));

      const { error: dbError } = await supabase
        .from('ad_banners')
        .upsert(updates.map(update => ({ 
          id: update.id, 
          display_order: update.display_order,
          updated_at: new Date().toISOString()
        })));

      if (dbError) throw dbError;

      // Actualizar lista local
      updates.forEach(update => {
        const index = banners.value.findIndex(b => b.id === update.id);
        if (index !== -1 && banners.value[index]) {
          banners.value[index].display_order = update.display_order;
        }
      });

      return true;

    } catch (err) {
      console.error('Failed to reorder banners:', err);
      error.value = err instanceof Error ? err.message : 'Reorder failed';
      return false;
    }
  };

  // ============================================================================
  // BANNER ANALYTICS
  // ============================================================================

  const trackBannerImpression = async (bannerId: string): Promise<void> => {
    try {
      // Use rpc function for atomic increment
      await supabase.rpc('increment_banner_impressions', { banner_id: bannerId });

      // Actualizar contador local
      const banner = banners.value.find(b => b.id === bannerId);
      if (banner) {
        banner.impression_count += 1;
      }

    } catch (err) {
      console.warn('Failed to track banner impression:', err);
    }
  };

  const trackBannerClick = async (bannerId: string): Promise<void> => {
    try {
      // Use rpc function for atomic increment  
      await supabase.rpc('increment_banner_clicks', { banner_id: bannerId });

      // Actualizar contador local
      const banner = banners.value.find(b => b.id === bannerId);
      if (banner) {
        banner.click_count += 1;
      }

    } catch (err) {
      console.warn('Failed to track banner click:', err);
    }
  };

  const getBannerAnalytics = async (
    bannerId?: string,
    dateRange?: { start: string; end: string }
  ) => {
    try {
      let query = supabase
        .from('ad_banners')
        .select('id, title, click_count, impression_count, display_location, created_at');

      if (bannerId) {
        query = query.eq('id', bannerId);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;

      return data?.map((banner: { impression_count: number; click_count: number }) => ({
        ...banner,
        ctr: banner.impression_count > 0 
          ? (banner.click_count / banner.impression_count) * 100 
          : 0
      })) || [];

    } catch (err) {
      console.error('Failed to get banner analytics:', err);
      return [];
    }
  };

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

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

  const shouldResizeImage = (
    dimensions?: { width: number; height: number },
    location: Banner['display_location'] = 'header'
  ): boolean => {
    if (!dimensions) return false;
    const recommended = BANNER_CONFIG.RECOMMENDED_DIMENSIONS[location];
    return dimensions.width !== recommended.width || dimensions.height !== recommended.height;
  };

  const resizeBannerImage = async (
    file: File,
    location: Banner['display_location']
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          const recommended = BANNER_CONFIG.RECOMMENDED_DIMENSIONS[location];
          canvas.width = recommended.width;
          canvas.height = recommended.height;

          if (!ctx) {
            throw new Error('Canvas context not available');
          }

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, recommended.width, recommended.height);

          // Convertir a blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to process image'));
                return;
              }

              const processedFile = new File(
                [blob], 
                `banner-${location}-${Date.now()}.webp`, 
                { type: 'image/webp' }
              );
              
              resolve(processedFile);
            },
            'image/webp',
            BANNER_CONFIG.QUALITY
          );
        } catch (err) {
          reject(new Error(err instanceof Error ? err.message : 'Failed to process image'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const getNextDisplayOrder = (location: Banner['display_location']): number => {
    const locationBanners = banners.value.filter(b => b.display_location === location);
    if (locationBanners.length === 0) return 1;
    
    const maxOrder = Math.max(...locationBanners.map(b => b.display_order));
    return maxOrder + 1;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    // Estado
    banners: readonly(banners),
    isLoading: readonly(isLoading),
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    error: readonly(error),

    // Computadas
    activeBanners,
    bannersByLocation,
    bannerStats,

    // Métodos
    loadBanners,
    validateBannerImage,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners,

    // Analytics
    trackBannerImpression,
    trackBannerClick,
    getBannerAnalytics,

    // Configuración
    BANNER_CONFIG: readonly(BANNER_CONFIG)
  };
}