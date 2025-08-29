import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StoryWithImageService } from '../../../../../src/services/openrouter/StoryWithImageService';
import { StoryGenerator } from '../../../../../src/services/openrouter/StoryGenerator';
import { ImageGenerator } from '../../../../../src/services/openrouter/ImageGenerator';
import { ImageStorageService } from '../../../../../src/services/supabase/ImageStorageService';
import type { 
  StoryWithImageRequest,
  StoryGenerationResponse,
  ImageGenerationResult
} from '../../../../../src/types/openrouter';

// Mock Supabase client to avoid environment variable requirements
vi.mock('../../../../../src/services/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
        list: vi.fn()
      }))
    },
    from: vi.fn(() => ({
      update: vi.fn(),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        })),
        not: vi.fn()
      }))
    })),
    rpc: vi.fn()
  }
}));

describe('StoryWithImageService - Persistence Integration', () => {
  let storyWithImageService: StoryWithImageService;
  let mockStoryGenerator: StoryGenerator;
  let mockImageGenerator: ImageGenerator;
  let mockImageStorageService: ImageStorageService;

  const mockStoryResponse: StoryGenerationResponse = {
    story: {
      id: 'story-123',
      title: 'The Hidden Treasure',
      content: 'A young explorer finds a mysterious key in the forest...',
      level: 'B1',
      genre: 'adventure',
      word_count: 150,
      reading_time_minutes: 1
    },
    vocabulary: [],
    metadata: {
      generated_at: '2025-01-01T00:00:00.000Z',
      model_used: 'openai/gpt-4o-mini',
      total_words: 150,
      vocabulary_percentage: 5
    }
  };

  const mockImageResult: ImageGenerationResult = {
    success: true,
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==',
    prompt: 'Educational illustration of a young explorer',
    model: 'google/gemini-2.5-flash-image-preview:free',
    generatedAt: '2025-01-01T00:00:00.000Z',
    isPlaceholder: false
  };

  beforeEach(() => {
    // Create mocks
    mockStoryGenerator = {
      generateStory: vi.fn().mockResolvedValue(mockStoryResponse),
      getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' })
    } as any;

    mockImageGenerator = {
      generateStoryImage: vi.fn().mockResolvedValue(mockImageResult),
      getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' })
    } as any;

    mockImageStorageService = {
      saveStoryImage: vi.fn(),
      getStoryImageMetadata: vi.fn(),
      deleteStoryImage: vi.fn(),
      getStorageStats: vi.fn(),
      cleanupOrphanedImages: vi.fn()
    } as any;

    // Create service with persistence enabled
    storyWithImageService = new StoryWithImageService(
      mockStoryGenerator,
      mockImageGenerator,
      mockImageStorageService,
      true // persistImages = true
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateStoryWithImage with persistence', () => {
    const mockRequest: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 150,
      includeImage: true,
      imageStyle: 'educational'
    };

    it('should generate story and persist image successfully', async () => {
      // Mock successful persistence
      mockImageStorageService.saveStoryImage = vi.fn().mockResolvedValue({
        imageUrl: 'https://supabase.co/storage/v1/object/public/story-images/stories/B1/adventure/story-story-123-1640995200000.png',
        storagePath: 'stories/B1/adventure/story-story-123-1640995200000.png',
        generatedAt: '2025-01-01T00:00:00.000Z',
        modelUsed: 'google/gemini-2.5-flash-image-preview:free',
        style: 'educational',
        prompt: 'Educational illustration of a young explorer'
      });

      const result = await storyWithImageService.generateStoryWithImage(mockRequest);

      // Verify story generation
      expect(mockStoryGenerator.generateStory).toHaveBeenCalledWith({
        level: 'B1',
        genre: 'adventure',
        wordCount: 150
      });

      // Verify image generation
      expect(mockImageGenerator.generateStoryImage).toHaveBeenCalledWith({
        storyContent: mockStoryResponse.story.content,
        level: 'B1',
        genre: 'adventure',
        style: 'educational'
      });

      // Verify image persistence
      expect(mockImageStorageService.saveStoryImage).toHaveBeenCalledWith(
        'story-123',
        mockImageResult,
        {
          storyContent: mockStoryResponse.story.content,
          level: 'B1',
          genre: 'adventure',
          style: 'educational'
        },
        mockImageResult.prompt
      );

      // Verify result structure
      expect(result.story).toEqual(mockStoryResponse);
      expect(result.image?.imageUrl).toBe('https://supabase.co/storage/v1/object/public/story-images/stories/B1/adventure/story-story-123-1640995200000.png');
      expect(result.image?.storage).toEqual({
        storagePath: 'stories/B1/adventure/story-story-123-1640995200000.png',
        publicUrl: 'https://supabase.co/storage/v1/object/public/story-images/stories/B1/adventure/story-story-123-1640995200000.png',
        persistedAt: '2025-01-01T00:00:00.000Z'
      });
      expect(result.metadata.imagePersisted).toBe(true);
      expect(result.metadata.storageProvider).toBe('supabase');
    });

    it('should continue with base64 image if persistence fails', async () => {
      // Mock persistence failure
      mockImageStorageService.saveStoryImage = vi.fn().mockRejectedValue(new Error('Storage error'));

      const result = await storyWithImageService.generateStoryWithImage(mockRequest);

      // Should still have story and image
      expect(result.story).toEqual(mockStoryResponse);
      expect(result.image?.imageUrl).toBe(mockImageResult.imageUrl); // Original base64
      expect(result.image?.storage).toBeUndefined(); // No storage metadata
      expect(result.metadata.imagePersisted).toBe(false);
      expect(result.metadata.storageProvider).toBe('supabase');
    });

    it('should skip persistence for placeholder images', async () => {
      // Mock placeholder image generation
      const placeholderImage = {
        ...mockImageResult,
        isPlaceholder: true,
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjg4IiBmb250LXNpemU9IjE2Ij5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K'
      };

      mockImageGenerator.generateStoryImage = vi.fn().mockResolvedValue(placeholderImage);

      const result = await storyWithImageService.generateStoryWithImage(mockRequest);

      // Should not attempt persistence
      expect(mockImageStorageService.saveStoryImage).not.toHaveBeenCalled();
      expect(result.image?.isPlaceholder).toBe(true);
      expect(result.metadata.imagePersisted).toBe(false);
    });

    it('should work in memory-only mode', async () => {
      // Create service with persistence disabled
      const memoryOnlyService = new StoryWithImageService(
        mockStoryGenerator,
        mockImageGenerator,
        mockImageStorageService,
        false // persistImages = false
      );

      const result = await memoryOnlyService.generateStoryWithImage(mockRequest);

      // Should not attempt persistence
      expect(mockImageStorageService.saveStoryImage).not.toHaveBeenCalled();
      expect(result.image?.imageUrl).toBe(mockImageResult.imageUrl); // Base64
      expect(result.image?.storage).toBeUndefined();
      expect(result.metadata.imagePersisted).toBe(false);
      expect(result.metadata.storageProvider).toBe('memory');
    });
  });

  describe('Storage management methods', () => {
    it('should retrieve stored image metadata', async () => {
      const mockMetadata = {
        imageUrl: 'https://supabase.co/image.png',
        storagePath: 'stories/B1/adventure/story-123.png',
        generatedAt: '2025-01-01T00:00:00.000Z',
        modelUsed: 'google/gemini-2.5-flash-image-preview:free',
        style: 'educational',
        prompt: 'Test prompt'
      };

      mockImageStorageService.getStoryImageMetadata = vi.fn().mockResolvedValue(mockMetadata);

      const result = await storyWithImageService.getStoredImage('story-123');

      expect(result).toEqual(mockMetadata);
      expect(mockImageStorageService.getStoryImageMetadata).toHaveBeenCalledWith('story-123');
    });

    it('should delete stored image', async () => {
      mockImageStorageService.deleteStoryImage = vi.fn().mockResolvedValue(true);

      const result = await storyWithImageService.deleteStoredImage('story-123');

      expect(result).toBe(true);
      expect(mockImageStorageService.deleteStoryImage).toHaveBeenCalledWith('story-123');
    });

    it('should get storage statistics', async () => {
      const mockStats = {
        totalImages: 10,
        totalSizeBytes: 1024000,
        imagesWithStories: 8,
        orphanedImages: 2
      };

      mockImageStorageService.getStorageStats = vi.fn().mockResolvedValue(mockStats);

      const result = await storyWithImageService.getStorageStats();

      expect(result).toEqual(mockStats);
    });

    it('should cleanup orphaned images', async () => {
      mockImageStorageService.cleanupOrphanedImages = vi.fn().mockResolvedValue(3);

      const result = await storyWithImageService.cleanupOrphanedImages();

      expect(result).toBe(3);
      expect(mockImageStorageService.cleanupOrphanedImages).toHaveBeenCalled();
    });

    it('should handle persistence mode changes', () => {
      // Initial state
      expect(storyWithImageService.getConfiguration().persistImages).toBe(true);

      // Disable persistence
      storyWithImageService.setPersistenceMode(false);
      expect(storyWithImageService.getConfiguration().persistImages).toBe(false);
      expect(storyWithImageService.getConfiguration().storageProvider).toBe('memory');

      // Re-enable persistence
      storyWithImageService.setPersistenceMode(true);
      expect(storyWithImageService.getConfiguration().persistImages).toBe(true);
      expect(storyWithImageService.getConfiguration().storageProvider).toBe('supabase');
    });
  });

  describe('Health status with storage', () => {
    it('should include storage service in health check when persistence enabled', async () => {
      const health = await storyWithImageService.getHealthStatus();

      expect(health).toEqual({
        storyService: { status: 'healthy' },
        imageService: { status: 'healthy' },
        storageService: { status: 'healthy' },
        overall: 'healthy'
      });
    });

    it('should handle degraded service gracefully', async () => {
      mockImageGenerator.getHealthStatus = vi.fn().mockResolvedValue({ status: 'unhealthy' });

      const health = await storyWithImageService.getHealthStatus();

      expect(health.overall).toBe('degraded');
      expect(health.imageService.status).toBe('unhealthy');
      expect(health.storyService.status).toBe('healthy');
    });

    it('should not include storage service when persistence disabled', async () => {
      const memoryOnlyService = new StoryWithImageService(
        mockStoryGenerator,
        mockImageGenerator,
        mockImageStorageService,
        false
      );

      const health = await memoryOnlyService.getHealthStatus();

      expect(health).toEqual({
        storyService: { status: 'healthy' },
        imageService: { status: 'healthy' },
        overall: 'healthy'
      });
      expect(health.storageService).toBeUndefined();
    });
  });

  describe('Error isolation with persistence', () => {
    const mockRequest: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 150,
      includeImage: true
    };

    it('should continue if story generation succeeds but image generation fails', async () => {
      mockImageGenerator.generateStoryImage = vi.fn().mockRejectedValue(new Error('Image generation failed'));

      const result = await storyWithImageService.generateStoryWithImage(mockRequest);

      expect(result.story).toEqual(mockStoryResponse);
      expect(result.image).toBeUndefined();
      expect(mockImageStorageService.saveStoryImage).not.toHaveBeenCalled();
      expect(result.metadata.imagePersisted).toBe(false);
    });

    it('should fail if story generation fails', async () => {
      mockStoryGenerator.generateStory = vi.fn().mockRejectedValue(new Error('Story generation failed'));

      await expect(storyWithImageService.generateStoryWithImage(mockRequest))
        .rejects.toThrow('Story generation failed');

      expect(mockImageGenerator.generateStoryImage).not.toHaveBeenCalled();
      expect(mockImageStorageService.saveStoryImage).not.toHaveBeenCalled();
    });

    it('should handle missing story ID gracefully', async () => {
      // Mock story without ID
      const storyWithoutId = {
        ...mockStoryResponse,
        story: { ...mockStoryResponse.story, id: undefined }
      };
      mockStoryGenerator.generateStory = vi.fn().mockResolvedValue(storyWithoutId);

      const result = await storyWithImageService.generateStoryWithImage(mockRequest);

      expect(result.story).toEqual(storyWithoutId);
      expect(result.image?.imageUrl).toBe(mockImageResult.imageUrl); // Base64
      expect(mockImageStorageService.saveStoryImage).not.toHaveBeenCalled();
      expect(result.metadata.imagePersisted).toBe(false);
    });
  });

  describe('Configuration and setup', () => {
    it('should provide correct configuration', () => {
      const config = storyWithImageService.getConfiguration();

      expect(config).toEqual({
        persistImages: true,
        hasStorageService: true,
        storageProvider: 'supabase'
      });
    });

    it('should handle missing storage service', () => {
      const serviceWithoutStorage = new StoryWithImageService(
        mockStoryGenerator,
        mockImageGenerator,
        undefined, // no storage service
        true
      );

      const config = serviceWithoutStorage.getConfiguration();
      expect(config.hasStorageService).toBe(true); // Should create default service
    });
  });
});