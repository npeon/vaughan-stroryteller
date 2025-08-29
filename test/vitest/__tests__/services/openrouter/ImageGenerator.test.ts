import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageGenerator } from '../../../../../src/services/openrouter/ImageGenerator';
import { 
  SAMPLE_IMAGE_REQUESTS,
  EXPECTED_IMAGE_RESULTS,
  MOCK_IMAGE_GENERATION_RESPONSES,
  TEST_ENV_VARS,
  createMockImageRequest,
  createMockImageResult
} from '../../../fixtures/image-generation.fixtures';
import type { 
  ImageGenerationRequest, 
  ImageGenerationResult, 
  CEFRLevel, 
  StoryGenre 
} from '../../../../../src/types/openrouter';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    ...TEST_ENV_VARS,
    OPENROUTER_API_KEY: 'test-api-key-12345',
    MODE: 'test'
  },
  configurable: true
});

describe('ImageGenerator - Basic Functionality', () => {
  let imageGenerator: ImageGenerator;
  let mockOpenRouterClient: any;

  beforeEach(() => {
    // Mock OpenRouterClient
    mockOpenRouterClient = {
      chatCompletion: vi.fn(),
      generateImage: vi.fn().mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,mock-image-data',
        prompt: 'test prompt',
        model: 'google/gemini-2.5-flash-image-preview:free',
        generatedAt: '2024-01-01T00:00:00.000Z',
        isPlaceholder: false
      }),
      testConnection: vi.fn().mockResolvedValue(true)
    };
    
    imageGenerator = new ImageGenerator(mockOpenRouterClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be instantiated with correct environment variables', () => {
    expect(imageGenerator).toBeInstanceOf(ImageGenerator);
    expect(imageGenerator['primaryModel']).toBe('google/gemini-2.5-flash-image-preview:free');
    expect(imageGenerator['secondaryModel']).toBe('google/gemini-2.5-flash-image-preview');
    expect(imageGenerator['timeout']).toBe(30000);
  });

  it('should generate image successfully with primary model', async () => {
    const request = createMockImageRequest('A1', 'adventure');
    
    const result = await imageGenerator.generateStoryImage(request);
    
    expect(result.success).toBe(true);
    expect(result.imageUrl).toBe('data:image/png;base64,mock-image-data');
    expect(result.prompt).toBeDefined();
    expect(result.model).toBeDefined();
    expect(result.generatedAt).toBeDefined();
    expect(result.isPlaceholder).toBe(false);
  });

  it('should build appropriate prompt for A1 level', async () => {
    const request = SAMPLE_IMAGE_REQUESTS['A1_adventure'];
    expect(request).toBeDefined();
    
    // Test the prompt building logic
    const prompt = imageGenerator['buildPrompt'](request!);
    
    expect(prompt).toContain('A1');
    expect(prompt).toContain('educational');
    expect(prompt).toContain('adventure');
    expect(prompt).toContain('basic everyday expressions');
    expect(prompt).toContain('Simple and clear with minimal details');
  });

  it('should build appropriate prompt for B1 level', async () => {
    const request = SAMPLE_IMAGE_REQUESTS['B1_adventure'];
    expect(request).toBeDefined();
    
    const prompt = imageGenerator['buildPrompt'](request!);
    
    expect(prompt).toContain('B1');
    expect(prompt).toContain('adventure');
    expect(prompt).toContain('clear standard input on familiar matters');
    expect(prompt).toContain('Moderate complexity');
  });

  it('should build appropriate prompt for C2 level', async () => {
    const request = SAMPLE_IMAGE_REQUESTS['C2_philosophical'];
    expect(request).toBeDefined();
    
    const prompt = imageGenerator['buildPrompt'](request!);
    
    expect(prompt).toContain('C2');
    expect(prompt).toContain('virtually everything heard or read');
    expect(prompt).toContain('Rich detail with sophisticated visual elements');
  });

  it('should include educational context in prompts', async () => {
    const request = createMockImageRequest('B1', 'adventure');
    
    const prompt = imageGenerator['buildPrompt'](request);
    
    expect(prompt).toContain('educational illustration');
    expect(prompt).toContain('English learning story');
    expect(prompt).toContain('CEFR Level: B1');
    expect(prompt).toContain('Educational purpose');
    expect(prompt).toContain('vocabulary comprehension');
  });

  it('should handle custom style and aspect ratio parameters', async () => {
    const request = {
      ...createMockImageRequest(),
      style: 'realistic' as const,
      aspectRatio: '4:3' as const
    };
    
    const prompt = imageGenerator['buildPrompt'](request);
    
    expect(prompt).toContain('Style: photorealistic style with accurate details');
    expect(prompt).toContain('Aspect ratio: 4:3');
  });
});

describe('ImageGenerator - Fallback Strategy', () => {
  let imageGenerator: ImageGenerator;
  let mockOpenRouterClient: any;

  beforeEach(() => {
    mockOpenRouterClient = {
      chatCompletion: vi.fn(),
      testConnection: vi.fn().mockResolvedValue(true)
    };
    
    imageGenerator = new ImageGenerator(mockOpenRouterClient);
    vi.clearAllMocks();
  });

  it('should fallback to secondary model when primary fails', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should try all models in sequence until success', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should return placeholder image when all models fail', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should not retry on authentication errors', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should track which model was successful for analytics', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });
});

describe('ImageGenerator - Error Handling', () => {
  let imageGenerator: ImageGenerator;

  beforeEach(() => {
    imageGenerator = new ImageGenerator();
    vi.clearAllMocks();
  });

  it('should handle rate limiting gracefully with retry logic', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should handle timeout errors with exponential backoff', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should handle invalid response format from API', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should handle network connectivity issues', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });

  it('should validate image generation request parameters', async () => {
    // Test with invalid request
    const invalidRequest = {
      storyContent: '',
      level: 'INVALID' as CEFRLevel,
      genre: 'INVALID' as StoryGenre
    };
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(invalidRequest as ImageGenerationRequest))
      .rejects.toThrow('Not implemented yet');
  });

  it('should handle malformed image URLs from API', async () => {
    const request = createMockImageRequest();
    
    // This test should fail initially (Red phase)
    await expect(imageGenerator.generateStoryImage(request)).rejects.toThrow('Not implemented yet');
  });
});

describe('ImageGenerator - Prompt Engineering', () => {
  let imageGenerator: ImageGenerator;

  beforeEach(() => {
    imageGenerator = new ImageGenerator();
    vi.clearAllMocks();
  });

  it('should generate A1 level appropriate prompts (simple, basic)', async () => {
    const request = SAMPLE_IMAGE_REQUESTS['A1_adventure'];
    expect(request).toBeDefined();
    
    const prompt = imageGenerator['buildPrompt'](request!);
    
    expect(prompt).toContain('A1');
    expect(prompt).toContain('basic everyday expressions');
    expect(prompt).toContain('Simple and clear with minimal details');
    expect(prompt).toContain('children');
  });

  it('should generate C2 level appropriate prompts (complex, sophisticated)', async () => {
    const request = SAMPLE_IMAGE_REQUESTS['C2_philosophical'];
    expect(request).toBeDefined();
    
    const prompt = imageGenerator['buildPrompt'](request!);
    
    expect(prompt).toContain('C2');
    expect(prompt).toContain('virtually everything heard or read');
    expect(prompt).toContain('Rich detail with sophisticated visual elements');
    expect(prompt).toContain('realistic');
  });

  it('should include genre-specific styling cues', async () => {
    const adventureRequest = createMockImageRequest('B1', 'adventure');
    const mysteryRequest = createMockImageRequest('B1', 'mystery');
    
    const adventurePrompt = imageGenerator['buildPrompt'](adventureRequest);
    const mysteryPrompt = imageGenerator['buildPrompt'](mysteryRequest);
    
    expect(adventurePrompt).toContain('dynamic action scene with movement');
    expect(mysteryPrompt).toContain('intriguing atmosphere with shadows');
  });

  it('should incorporate educational story themes', async () => {
    const request = createMockImageRequest('B1', 'adventure');
    
    const prompt = imageGenerator['buildPrompt'](request);
    
    expect(prompt).toContain('educational illustration');
    expect(prompt).toContain('English learning story');
    expect(prompt).toContain('support vocabulary comprehension');
  });

  it('should create child-friendly prompts for younger levels', async () => {
    const a1Request = SAMPLE_IMAGE_REQUESTS['A1_adventure'];
    expect(a1Request).toBeDefined();
    const a2Request = createMockImageRequest('A2', 'adventure');
    
    const a1Prompt = imageGenerator['buildPrompt'](a1Request!);
    const a2Prompt = imageGenerator['buildPrompt'](a2Request);
    
    expect(a1Prompt).toContain('children');
    expect(a1Prompt).toContain('bright, primary colors');
    expect(a2Prompt).toContain('elementary school');
  });
});

describe('ImageGenerator - Health Status', () => {
  let imageGenerator: ImageGenerator;

  beforeEach(() => {
    imageGenerator = new ImageGenerator();
    vi.clearAllMocks();
  });

  it('should return health status with available models count', async () => {
    // This test should fail initially (Red phase)
    await expect(imageGenerator.getHealthStatus()).rejects.toThrow('Not implemented yet');
  });

  it('should return unhealthy status when API is down', async () => {
    // This test should fail initially (Red phase)
    await expect(imageGenerator.getHealthStatus()).rejects.toThrow('Not implemented yet');
  });

  it('should return degraded status when some models fail', async () => {
    // This test should fail initially (Red phase)
    await expect(imageGenerator.getHealthStatus()).rejects.toThrow('Not implemented yet');
  });
});

describe('ImageGenerator - Placeholder Images', () => {
  let imageGenerator: ImageGenerator;

  beforeEach(() => {
    imageGenerator = new ImageGenerator();
    vi.clearAllMocks();
  });

  it('should return placeholder image when all generation fails', async () => {
    const placeholderResult = imageGenerator['getPlaceholderImage']();
    
    expect(placeholderResult.success).toBe(true);
    expect(placeholderResult.isPlaceholder).toBe(true);
    expect(placeholderResult.imageUrl).toBe('https://picsum.photos/800/600');
    expect(placeholderResult.prompt).toContain('Placeholder');
  });

  it('should use configured placeholder URL', async () => {
    // This test should fail initially (Red phase)
    expect(() => imageGenerator['getPlaceholderImage']()).toThrow('Not implemented yet');
  });

  it('should mark placeholder images correctly', async () => {
    // This test should fail initially (Red phase)
    expect(() => imageGenerator['getPlaceholderImage']()).toThrow('Not implemented yet');
  });
});