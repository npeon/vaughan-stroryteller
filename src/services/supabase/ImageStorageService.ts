import { supabase } from './client'
import type { 
  ImageGenerationResult, 
  ImageGenerationRequest,
  CEFRLevel,
  StoryGenre 
} from '../../types/openrouter'

export interface StoredImageMetadata {
  imageUrl: string
  storagePath: string
  generatedAt: string
  modelUsed: string
  style: string
  prompt: string
}

export interface ImageStorageError extends Error {
  code: string
  isRetryable: boolean
}

/**
 * Service for managing story image persistence in Supabase Storage
 * Handles upload, retrieval, and cleanup of generated story images
 */
export class ImageStorageService {
  private readonly bucketName = 'story-images'
  private readonly maxFileSizeBytes = 5 * 1024 * 1024 // 5MB
  private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp']

  /**
   * Save generated image to Supabase Storage and update story record
   */
  async saveStoryImage(
    storyId: string,
    imageResult: ImageGenerationResult,
    imageRequest: ImageGenerationRequest,
    generationPrompt: string
  ): Promise<StoredImageMetadata> {
    try {
      // Skip if image is placeholder or failed
      if (!imageResult.success || imageResult.isPlaceholder || !imageResult.imageUrl) {
        throw new Error('Invalid image result for storage')
      }

      // Convert base64 data URL to blob
      const imageBlob = this.base64ToBlob(imageResult.imageUrl)
      
      // Validate file size
      if (imageBlob.size > this.maxFileSizeBytes) {
        throw this.createStorageError(
          'FILE_TOO_LARGE', 
          `Image size ${imageBlob.size} exceeds limit ${this.maxFileSizeBytes}`,
          false
        )
      }

      // Generate storage path
      const storagePath = this.generateStoragePath(storyId, imageRequest.level, imageRequest.genre)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(storagePath, imageBlob, {
          contentType: imageBlob.type,
          cacheControl: '31536000', // 1 year cache
          upsert: true // Replace if exists
        })

      if (uploadError) {
        throw this.createStorageError(
          'UPLOAD_FAILED',
          `Failed to upload image: ${uploadError.message}`,
          this.isRetryableStorageError(uploadError.message)
        )
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(storagePath)

      if (!publicUrlData.publicUrl) {
        throw this.createStorageError(
          'URL_GENERATION_FAILED',
          'Failed to generate public URL for uploaded image',
          true
        )
      }

      // Update story record with image metadata
      const imageMetadata = {
        image_url: publicUrlData.publicUrl,
        image_storage_path: storagePath,
        image_generated_at: imageResult.generatedAt || new Date().toISOString(),
        image_model_used: imageResult.model || 'unknown',
        image_style: imageRequest.style || 'educational',
        image_generation_prompt: generationPrompt.substring(0, 1000) // Limit prompt length
      }

      const { error: updateError } = await supabase
        .from('stories')
        .update(imageMetadata)
        .eq('id', storyId)

      if (updateError) {
        // Try to cleanup uploaded file if database update fails
        await this.cleanupFailedUpload(storagePath)
        
        throw this.createStorageError(
          'DATABASE_UPDATE_FAILED',
          `Failed to update story record: ${updateError.message}`,
          true
        )
      }

      return {
        imageUrl: publicUrlData.publicUrl,
        storagePath,
        generatedAt: imageMetadata.image_generated_at,
        modelUsed: imageMetadata.image_model_used,
        style: imageMetadata.image_style,
        prompt: imageMetadata.image_generation_prompt
      }

    } catch (error) {
      console.error('Error saving story image:', error)
      throw error instanceof Error ? error : new Error('Unknown error saving image')
    }
  }

  /**
   * Retrieve image metadata for a story
   */
  async getStoryImageMetadata(storyId: string): Promise<StoredImageMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          image_url,
          image_storage_path,
          image_generated_at,
          image_model_used,
          image_style,
          image_generation_prompt
        `)
        .eq('id', storyId)
        .single()

      if (error) {
        console.warn('Error fetching story image metadata:', error)
        return null
      }

      if (!data.image_url) {
        return null
      }

      return {
        imageUrl: data.image_url,
        storagePath: data.image_storage_path,
        generatedAt: data.image_generated_at,
        modelUsed: data.image_model_used,
        style: data.image_style,
        prompt: data.image_generation_prompt
      }

    } catch (error) {
      console.error('Error getting story image metadata:', error)
      return null
    }
  }

  /**
   * Delete story image from storage and database
   */
  async deleteStoryImage(storyId: string): Promise<boolean> {
    try {
      // Get current image metadata
      const metadata = await this.getStoryImageMetadata(storyId)
      
      if (!metadata) {
        return true // Already deleted or never existed
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([metadata.storagePath])

      if (storageError) {
        console.warn('Failed to delete image from storage:', storageError)
        // Continue with database cleanup even if storage deletion fails
      }

      // Clear image fields in database
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          image_url: null,
          image_storage_path: null,
          image_generated_at: null,
          image_model_used: null,
          image_style: null,
          image_generation_prompt: null
        })
        .eq('id', storyId)

      if (updateError) {
        console.error('Failed to clear image metadata from database:', updateError)
        return false
      }

      return true

    } catch (error) {
      console.error('Error deleting story image:', error)
      return false
    }
  }

  /**
   * Cleanup orphaned images that don't have corresponding story records
   */
  async cleanupOrphanedImages(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_orphaned_story_images')

      if (error) {
        console.error('Failed to cleanup orphaned images:', error)
        return 0
      }

      return data as number

    } catch (error) {
      console.error('Error during orphaned image cleanup:', error)
      return 0
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalImages: number
    totalSizeBytes: number
    imagesWithStories: number
    orphanedImages: number
  }> {
    try {
      // Get all images from storage
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from(this.bucketName)
        .list('stories', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (storageError) {
        throw new Error(`Failed to list storage files: ${storageError.message}`)
      }

      // Get stories with images from database
      const { data: storiesWithImages, error: dbError } = await supabase
        .from('stories')
        .select('image_storage_path')
        .not('image_storage_path', 'is', null)

      if (dbError) {
        throw new Error(`Failed to query stories with images: ${dbError.message}`)
      }

      const totalImages = storageFiles?.length || 0
      const totalSizeBytes = storageFiles?.reduce((sum: number, file: { metadata?: { size?: number } }) => {
        return sum + (file.metadata?.size || 0)
      }, 0) || 0
      const imagesWithStories = storiesWithImages?.length || 0
      const orphanedImages = Math.max(0, totalImages - imagesWithStories)

      return {
        totalImages,
        totalSizeBytes,
        imagesWithStories,
        orphanedImages
      }

    } catch (error) {
      console.error('Error getting storage stats:', error)
      return {
        totalImages: 0,
        totalSizeBytes: 0,
        imagesWithStories: 0,
        orphanedImages: 0
      }
    }
  }

  /**
   * Convert base64 data URL to Blob
   */
  private base64ToBlob(dataUrl: string): Blob {
    try {
      // Extract mime type and base64 data
      const [header, base64Data] = dataUrl.split(',')
      
      if (!header || !base64Data) {
        throw new Error('Invalid data URL format')
      }

      const mimeMatch = header.match(/data:([^;]+)/)
      const mimeType = mimeMatch?.[1] || 'image/png'

      // Validate mime type
      if (!this.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`Unsupported mime type: ${mimeType}`)
      }

      // Convert base64 to binary
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      return new Blob([bytes], { type: mimeType })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to convert base64 to blob: ${errorMessage}`)
    }
  }

  /**
   * Generate storage path for image
   */
  private generateStoragePath(storyId: string, level: CEFRLevel, genre: StoryGenre): string {
    const timestamp = Date.now()
    const sanitizedGenre = genre.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    
    // Organize by level and genre for easier management
    return `stories/${level}/${sanitizedGenre}/story-${storyId}-${timestamp}.png`
  }

  /**
   * Create standardized storage error
   */
  private createStorageError(code: string, message: string, isRetryable: boolean): ImageStorageError {
    const error = new Error(message) as ImageStorageError
    error.name = 'ImageStorageError'
    error.code = code
    error.isRetryable = isRetryable
    return error
  }

  /**
   * Determine if storage error is retryable
   */
  private isRetryableStorageError(errorMessage: string): boolean {
    const retryableErrors = [
      'network',
      'timeout',
      'rate limit',
      'temporary',
      '5xx',
      'internal server error'
    ]
    
    const message = errorMessage.toLowerCase()
    return retryableErrors.some(retryable => message.includes(retryable))
  }

  /**
   * Cleanup failed upload attempt
   */
  private async cleanupFailedUpload(storagePath: string): Promise<void> {
    try {
      await supabase.storage
        .from(this.bucketName)
        .remove([storagePath])
    } catch (error) {
      console.warn('Failed to cleanup failed upload:', error)
      // Don't throw - this is cleanup, not critical
    }
  }
}