import { StoryGenerator } from './StoryGenerator';
import { ImageGenerator } from './ImageGenerator';
import { ImageStorageService } from '../supabase/ImageStorageService';
import type {
  StoryWithImageRequest,
  StoryWithImageResponse,
  StoryGenerationRequest,
  StoryGenerationResponse,
  ImageGenerationResult,
  ImageGenerationRequest,
  CEFRLevel,
  StoryGenre
} from '../../types/openrouter';

export class StoryWithImageService {
  private storyGenerator: StoryGenerator;
  private imageGenerator: ImageGenerator;
  private imageStorageService: ImageStorageService;
  private persistImages: boolean;

  constructor(
    storyGenerator?: StoryGenerator, 
    imageGenerator?: ImageGenerator,
    imageStorageService?: ImageStorageService,
    persistImages: boolean = true
  ) {
    this.storyGenerator = storyGenerator || new StoryGenerator();
    this.imageGenerator = imageGenerator || new ImageGenerator();
    this.imageStorageService = imageStorageService || new ImageStorageService();
    this.persistImages = persistImages;
  }

  /**
   * Generate a story with an accompanying image
   * Uses sequential approach: story first, then image based on story content
   * Includes automatic persistence to Supabase Storage for production use
   */
  async generateStoryWithImage(request: StoryWithImageRequest): Promise<StoryWithImageResponse> {
    const startTime = Date.now();
    
    try {
      // Always generate the story first
      const story = await this.generateStory(request);
      const storyGeneratedAt = new Date().toISOString();

      // Only generate image if requested
      let image: ImageGenerationResult | undefined;
      let imageGeneratedAt: string | undefined;
      let imagePersisted = false;
      const storageProvider: 'supabase' | 'memory' = this.persistImages ? 'supabase' : 'memory';

      if (request.includeImage !== false) { // Default to true if not specified
        try {
          // Generate the image
          image = await this.generateImageForStory(story, request);
          imageGeneratedAt = new Date().toISOString();

          // Persist image to Supabase Storage if configured and successful
          if (this.persistImages && image.success && !image.isPlaceholder && story.story.id) {
            try {
              const imageRequest: ImageGenerationRequest = {
                storyContent: story.story.content,
                level: request.level,
                genre: request.genre,
                style: request.imageStyle || 'educational'
              };

              const persistedMetadata = await this.imageStorageService.saveStoryImage(
                story.story.id,
                image,
                imageRequest,
                image.prompt || 'Generated educational illustration'
              );

              // Update image result with persistence data
              image.imageUrl = persistedMetadata.imageUrl; // Use Supabase public URL
              image.storage = {
                storagePath: persistedMetadata.storagePath,
                publicUrl: persistedMetadata.imageUrl,
                persistedAt: persistedMetadata.generatedAt
              };

              imagePersisted = true;
              console.log(`Image successfully persisted for story ${story.story.id} at ${persistedMetadata.storagePath}`);

            } catch (persistError) {
              console.warn('Image persistence failed, falling back to base64:', persistError);
              // Continue with base64 image - error isolation
              imagePersisted = false;
            }
          }

        } catch (error) {
          console.warn('Image generation failed, continuing with story only:', error);
          // Story continues without image - error isolation principle
        }
      }

      const totalProcessingTime = Date.now() - startTime;

      const metadata: {
        storyGeneratedAt: string;
        imageGeneratedAt?: string;
        totalProcessingTime: number;
        imagePersisted?: boolean;
        storageProvider?: 'supabase' | 'memory';
      } = {
        storyGeneratedAt,
        totalProcessingTime,
        imagePersisted,
        storageProvider
      };
      
      if (imageGeneratedAt) {
        metadata.imageGeneratedAt = imageGeneratedAt;
      }

      const result: StoryWithImageResponse = {
        story,
        metadata
      };
      
      if (image) {
        result.image = image;
      }
      
      return result;
    } catch (error) {
      console.error('Story with image generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate story first approach - ensures story is always available
   */
  async generateStoryFirst(request: StoryWithImageRequest): Promise<StoryWithImageResponse> {
    return this.generateStoryWithImage(request);
  }

  /**
   * Generate story and image in parallel for better performance
   */
  async generateParallel(request: StoryWithImageRequest): Promise<StoryWithImageResponse> {
    const startTime = Date.now();

    try {
      const promises: [Promise<StoryGenerationResponse>, Promise<ImageGenerationResult | null>] = [
        this.generateStory(request),
        request.includeImage !== false 
          ? this.generateImageAsync(request.theme || '', request.level, request.genre)
          : Promise.resolve(null)
      ];

      const [story, image] = await Promise.allSettled(promises);
      
      // Handle story result
      if (story.status === 'rejected') {
        throw new Error(`Story generation failed: ${story.reason}`);
      }

      // Handle image result (allow failure)
      let imageResult: ImageGenerationResult | undefined;
      if (image.status === 'fulfilled' && image.value) {
        imageResult = image.value;
      } else if (image.status === 'rejected') {
        console.warn('Image generation failed in parallel mode:', image.reason);
      }

      const totalProcessingTime = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      const metadata: { storyGeneratedAt: string; imageGeneratedAt?: string; totalProcessingTime: number } = {
        storyGeneratedAt: timestamp,
        totalProcessingTime
      };
      
      if (imageResult) {
        metadata.imageGeneratedAt = timestamp;
      }

      const result: StoryWithImageResponse = {
        story: story.value,
        metadata
      };
      
      if (imageResult) {
        result.image = imageResult;
      }
      
      return result;
    } catch (error) {
      console.error('Parallel generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate story using the existing StoryGenerator
   */
  private async generateStory(request: StoryWithImageRequest): Promise<StoryGenerationResponse> {
    const storyRequest: StoryGenerationRequest = {
      level: request.level,
      genre: request.genre,
      wordCount: request.wordCount,
      ...(request.theme && { theme: request.theme }),
      ...(request.includeVocabulary !== undefined && { includeVocabulary: request.includeVocabulary }),
      ...(request.model && { model: request.model })
    };

    return await this.storyGenerator.generateStory(storyRequest);
  }

  /**
   * Generate image based on completed story content
   */
  private async generateImageForStory(
    story: StoryGenerationResponse,
    request: StoryWithImageRequest
  ): Promise<ImageGenerationResult> {
    const imageRequest: ImageGenerationRequest = {
      storyContent: story.story.content,
      level: story.story.level,
      genre: story.story.genre,
      style: request.imageStyle || 'educational',
      aspectRatio: request.imageAspectRatio || '16:9'
    };

    return await this.imageGenerator.generateStoryImage(imageRequest);
  }

  /**
   * Generate image asynchronously with basic parameters
   */
  private async generateImageAsync(
    theme: string,
    level: CEFRLevel,
    genre: StoryGenre
  ): Promise<ImageGenerationResult> {
    // Create a basic image request when we don't have story content yet
    const basicImageRequest: ImageGenerationRequest = {
      storyContent: `A ${genre} story about ${theme || 'life and adventure'}`,
      level: level,
      genre: genre,
      style: 'educational',
      aspectRatio: '16:9'
    };

    return await this.imageGenerator.generateStoryImage(basicImageRequest);
  }

  /**
   * Retrieve persisted image for a story
   */
  async getStoredImage(storyId: string) {
    if (!this.persistImages) {
      return null;
    }

    try {
      return await this.imageStorageService.getStoryImageMetadata(storyId);
    } catch (error) {
      console.error('Failed to retrieve stored image:', error);
      return null;
    }
  }

  /**
   * Delete persisted image for a story
   */
  async deleteStoredImage(storyId: string): Promise<boolean> {
    if (!this.persistImages) {
      return true; // Nothing to delete
    }

    try {
      return await this.imageStorageService.deleteStoryImage(storyId);
    } catch (error) {
      console.error('Failed to delete stored image:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    if (!this.persistImages) {
      return {
        totalImages: 0,
        totalSizeBytes: 0,
        imagesWithStories: 0,
        orphanedImages: 0
      };
    }

    try {
      return await this.imageStorageService.getStorageStats();
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalImages: 0,
        totalSizeBytes: 0,
        imagesWithStories: 0,
        orphanedImages: 0
      };
    }
  }

  /**
   * Cleanup orphaned images that don't have corresponding stories
   */
  async cleanupOrphanedImages(): Promise<number> {
    if (!this.persistImages) {
      return 0;
    }

    try {
      return await this.imageStorageService.cleanupOrphanedImages();
    } catch (error) {
      console.error('Failed to cleanup orphaned images:', error);
      return 0;
    }
  }

  /**
   * Toggle persistence mode
   */
  setPersistenceMode(enabled: boolean): void {
    this.persistImages = enabled;
  }

  /**
   * Get current persistence configuration
   */
  getConfiguration() {
    return {
      persistImages: this.persistImages,
      hasStorageService: !!this.imageStorageService,
      storageProvider: this.persistImages ? 'supabase' : 'memory'
    };
  }

  /**
   * Get health status of both story and image generation services
   */
  async getHealthStatus(): Promise<{
    storyService: { status: string };
    imageService: { status: string };
    storageService?: { status: string };
    overall: string;
  }> {
    try {
      // Get health status from each service
      const [storyHealthResult, imageHealthResult] = await Promise.allSettled([
        this.storyGenerator.getHealthStatus(),
        this.imageGenerator.getHealthStatus()
      ]);

      // Extract status from story service health check
      const storyStatus = storyHealthResult.status === 'fulfilled' 
        ? storyHealthResult.value.status 
        : 'unhealthy';
        
      // Extract status from image service health check
      const imageStatus = imageHealthResult.status === 'fulfilled' 
        ? imageHealthResult.value.status 
        : 'unhealthy';

      // Storage service is always healthy if persistence is enabled (placeholder)
      const storageStatus = this.persistImages ? 'healthy' : undefined;

      // Determine overall status
      let overall = 'healthy';
      if (storyStatus === 'unhealthy' || imageStatus === 'unhealthy') {
        overall = 'degraded'; // Can still provide stories without images
      }
      if (storyStatus === 'unhealthy' && imageStatus === 'unhealthy') {
        overall = 'unhealthy';
      }

      const result: {
        storyService: { status: string };
        imageService: { status: string };
        storageService?: { status: string };
        overall: string;
      } = {
        storyService: { status: storyStatus },
        imageService: { status: imageStatus },
        overall
      };

      if (this.persistImages && storageStatus) {
        result.storageService = { status: storageStatus };
      }

      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        storyService: { status: 'unhealthy' },
        imageService: { status: 'unhealthy' },
        ...(this.persistImages && { storageService: { status: 'unhealthy' } }),
        overall: 'unhealthy'
      };
    }
  }
}