import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageStorageService } from '../../../../../src/services/supabase/ImageStorageService';
import type { 
  ImageGenerationResult, 
  ImageGenerationRequest,
  CEFRLevel,
  StoryGenre 
} from '../../../../../src/types/openrouter';

// Mock Supabase using factory function
vi.mock('../../../../../src/services/supabase/client', () => {
  const mockStorageFrom = {
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
    remove: vi.fn(),
    list: vi.fn()
  };

  const mockFromSelect = {
    eq: vi.fn(() => ({
      single: vi.fn()
    })),
    not: vi.fn()
  };

  const mockFrom = {
    update: vi.fn(),
    select: vi.fn(() => mockFromSelect)
  };

  return {
    supabase: {
      storage: {
        from: vi.fn(() => mockStorageFrom)
      },
      from: vi.fn(() => mockFrom),
      rpc: vi.fn()
    }
  };
});

describe('ImageStorageService', () => {
  let imageStorageService: ImageStorageService;
  let mockImageResult: ImageGenerationResult;
  let mockImageRequest: ImageGenerationRequest;
  let mockSupabase: any;
  let mockStorageFrom: any;
  let mockFrom: any;

  beforeEach(async () => {
    imageStorageService = new ImageStorageService();
    vi.clearAllMocks();
    
    // Get mocked supabase instance
    const { supabase } = await import('../../../../../src/services/supabase/client');
    mockSupabase = vi.mocked(supabase);
    mockStorageFrom = mockSupabase.storage.from();
    mockFrom = mockSupabase.from();

    mockImageResult = {
      success: true,
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==',
      prompt: 'A test educational illustration',
      model: 'google/gemini-2.5-flash-image-preview:free',
      generatedAt: '2025-01-01T00:00:00.000Z',
      isPlaceholder: false
    };

    mockImageRequest = {
      storyContent: 'A young explorer finds a hidden treasure',
      level: 'B1' as CEFRLevel,
      genre: 'adventure' as StoryGenre,
      style: 'educational'
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveStoryImage', () => {
    it('should save image successfully to Supabase Storage', async () => {
      // Mock successful upload
      mockStorageFrom.upload.mockResolvedValue({
        data: { path: 'stories/B1/adventure/story-123-1640995200000.png' },
        error: null
      });

      mockStorageFrom.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/v1/object/public/story-images/stories/B1/adventure/story-123-1640995200000.png' }
      });

      // Mock successful database update
      mockFrom.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      const result = await imageStorageService.saveStoryImage(
        'story-123',
        mockImageResult,
        mockImageRequest,
        'Test prompt'
      );

      expect(result).toBeDefined();
      expect(result.imageUrl).toContain('supabase.co');
      expect(result.storagePath).toContain('stories/B1/adventure');
    });

    it('should handle upload failure gracefully', async () => {
      const mockStorageFrom = mockSupabase.storage.from();
      mockStorageFrom.upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' }
      });

      await expect(imageStorageService.saveStoryImage(
        'story-123',
        mockImageResult,
        mockImageRequest,
        'Test prompt'
      )).rejects.toThrow('Failed to upload image');
    });
  });

  describe('getStoryImageMetadata', () => {
    it('should retrieve image metadata successfully', async () => {
      const mockData = {
        image_url: 'https://supabase.co/storage/image.png',
        image_storage_path: 'stories/B1/adventure/story-123.png',
        image_generated_at: '2025-01-01T00:00:00.000Z',
        image_model_used: 'google/gemini-2.5-flash-image-preview:free',
        image_style: 'educational',
        image_generation_prompt: 'Test prompt'
      };

      const mockFromChain = mockSupabase.from();
      mockFromChain.select.mockReturnValue({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockData, error: null })
        })),
        not: vi.fn()
      });

      const result = await imageStorageService.getStoryImageMetadata('story-123');

      expect(result).toEqual({
        imageUrl: 'https://supabase.co/storage/image.png',
        storagePath: 'stories/B1/adventure/story-123.png',
        generatedAt: '2025-01-01T00:00:00.000Z',
        modelUsed: 'google/gemini-2.5-flash-image-preview:free',
        style: 'educational',
        prompt: 'Test prompt'
      });
    });

    it('should return null for non-existent image', async () => {
      const mockFromChain = mockSupabase.from();
      mockFromChain.select.mockReturnValue({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { image_url: null }, error: null })
        })),
        not: vi.fn()
      });

      const result = await imageStorageService.getStoryImageMetadata('story-123');
      expect(result).toBeNull();
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      // Mock storage files
      const mockStorageFrom = mockSupabase.storage.from();
      mockStorageFrom.list.mockResolvedValue({
        data: [
          { name: 'image1.png', metadata: { size: 1000 } },
          { name: 'image2.png', metadata: { size: 2000 } },
        ],
        error: null
      });

      // Mock stories with images
      const mockFromChain = mockSupabase.from();
      mockFromChain.select.mockReturnValue({
        eq: vi.fn(() => ({ single: vi.fn() })), not: vi.fn().mockResolvedValue({
          data: [
            { image_storage_path: 'stories/B1/image1.png' }
          ],
          error: null
        })
      });

      const result = await imageStorageService.getStorageStats();

      expect(result).toEqual({
        totalImages: 2,
        totalSizeBytes: 3000,
        imagesWithStories: 1,
        orphanedImages: 1
      });
    });
  });
});
