import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StoryWithImageService } from '../../../../../src/services/openrouter/StoryWithImageService';
import { 
  SAMPLE_STORIES_FOR_IMAGES,
  SAMPLE_IMAGE_REQUESTS,
  createMockImageRequest,
  createMockImageResult,
  TEST_ENV_VARS
} from '../../../fixtures/image-generation.fixtures';
import type { 
  StoryWithImageRequest,
  StoryWithImageResponse,
  StoryGenerationRequest,
  StoryGenerationResponse,
  ImageGenerationRequest,
  ImageGenerationResult
} from '../../../../../src/types/openrouter';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    ...TEST_ENV_VARS,
    MODE: 'test'
  },
  configurable: true
});

describe('StoryWithImageService - Orchestration', () => {
  let storyWithImageService: StoryWithImageService;
  let mockStoryGenerator: any;
  let mockImageGenerator: any;

  beforeEach(() => {
    mockStoryGenerator = {
      generateStory: vi.fn(),
      getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' })
    };

    mockImageGenerator = {
      generateStoryImage: vi.fn(),
      getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' })
    };

    storyWithImageService = new StoryWithImageService(mockStoryGenerator, mockImageGenerator);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be instantiated with correct dependencies', () => {
    expect(storyWithImageService).toBeInstanceOf(StoryWithImageService);
    expect(storyWithImageService['storyGenerator']).toBeDefined();
    expect(storyWithImageService['imageGenerator']).toBeDefined();
  });

  it('should generate story and image in parallel for performance', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };

    // Mock successful story generation
    const mockStory = {
      story: { title: 'Test Story', content: 'Test content', level: 'B1', genre: 'adventure', word_count: 300, reading_time_minutes: 2 },
      vocabulary: [],
      metadata: { generated_at: '2024-01-01', model_used: 'test', total_words: 300, vocabulary_percentage: 10 }
    };

    // Mock successful image generation
    const mockImage = {
      success: true,
      imageUrl: 'data:image/png;base64,test',
      model: 'google/gemini-2.5-flash-image-preview:free' as any,
      generatedAt: '2024-01-01',
      prompt: 'test prompt',
      isPlaceholder: false
    };

    mockStoryGenerator.generateStory.mockResolvedValue(mockStory);
    mockImageGenerator.generateStoryImage.mockResolvedValue(mockImage);
    
    const result = await storyWithImageService.generateStoryWithImage(request);
    
    expect(result.story).toBeDefined();
    expect(result.image).toBeDefined();
    expect(result.metadata.totalProcessingTime).toBeGreaterThan(0);
    expect(result.metadata.storyGeneratedAt).toBeDefined();
    expect(result.metadata.imageGeneratedAt).toBeDefined();
  });

  it('should generate story first, then image based on content', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryFirst(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should handle async image generation without blocking story', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should combine story and image results correctly', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should track generation time for both operations', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });
});

describe('StoryWithImageService - Error Isolation', () => {
  let storyWithImageService: StoryWithImageService;
  let mockStoryGenerator: any;
  let mockImageGenerator: any;

  beforeEach(() => {
    mockStoryGenerator = {
      generateStory: vi.fn(),
      getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' })
    };
    mockImageGenerator = {
      generateStoryImage: vi.fn(),
      getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' })
    };
    storyWithImageService = new StoryWithImageService(mockStoryGenerator, mockImageGenerator);
    vi.clearAllMocks();
  });

  it('should return story even if image generation fails', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // Mock story generator to succeed but image generator to fail
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should provide placeholder image when generation fails', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should continue story generation if image service is down', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should log image generation failures without affecting user', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should retry image generation independently of story', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });
});

describe('StoryWithImageService - Configuration', () => {
  let storyWithImageService: StoryWithImageService;

  beforeEach(() => {
    storyWithImageService = new StoryWithImageService();
    vi.clearAllMocks();
  });

  it('should allow disabling image generation via configuration', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: false // Image generation disabled
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should respect different image styles per CEFR level', async () => {
    const a1Request: StoryWithImageRequest = {
      level: 'A1',
      genre: 'adventure',
      wordCount: 200,
      includeImage: true,
      imageStyle: 'children'
    };

    const c2Request: StoryWithImageRequest = {
      level: 'C2',
      genre: 'biography',
      wordCount: 500,
      includeImage: true,
      imageStyle: 'realistic'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(a1Request))
      .rejects.toThrow('Not implemented yet');
    await expect(storyWithImageService.generateStoryWithImage(c2Request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should handle environment-specific model preferences', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should support async vs sync generation modes', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // Test parallel generation
    await expect(storyWithImageService.generateParallel(request))
      .rejects.toThrow('Not implemented yet');
    
    // Test sequential generation
    await expect(storyWithImageService.generateStoryFirst(request))
      .rejects.toThrow('Not implemented yet');
  });
});

describe('StoryWithImageService - Performance', () => {
  let storyWithImageService: StoryWithImageService;

  beforeEach(() => {
    storyWithImageService = new StoryWithImageService();
    vi.clearAllMocks();
  });

  it('should optimize for fast story delivery', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });

  it('should handle concurrent generation requests', async () => {
    const request1: StoryWithImageRequest = {
      level: 'A1',
      genre: 'adventure',
      wordCount: 200,
      includeImage: true,
      imageStyle: 'children'
    };

    const request2: StoryWithImageRequest = {
      level: 'B2',
      genre: 'mystery',
      wordCount: 400,
      includeImage: true,
      imageStyle: 'realistic'
    };
    
    // This test should fail initially (Red phase)
    await expect(Promise.all([
      storyWithImageService.generateStoryWithImage(request1),
      storyWithImageService.generateStoryWithImage(request2)
    ])).rejects.toThrow('Not implemented yet');
  });

  it('should measure and track total processing time', async () => {
    const request: StoryWithImageRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      includeImage: true,
      imageStyle: 'educational'
    };
    
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.generateStoryWithImage(request))
      .rejects.toThrow('Not implemented yet');
  });
});

describe('StoryWithImageService - Health Status', () => {
  let storyWithImageService: StoryWithImageService;

  beforeEach(() => {
    storyWithImageService = new StoryWithImageService();
    vi.clearAllMocks();
  });

  it('should report health status of both services', async () => {
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.getHealthStatus())
      .rejects.toThrow('Not implemented yet');
  });

  it('should report overall status based on both services', async () => {
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.getHealthStatus())
      .rejects.toThrow('Not implemented yet');
  });

  it('should handle partial service degradation', async () => {
    // This test should fail initially (Red phase)
    await expect(storyWithImageService.getHealthStatus())
      .rejects.toThrow('Not implemented yet');
  });
});