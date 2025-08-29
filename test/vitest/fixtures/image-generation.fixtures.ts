import type { 
  CEFRLevel, 
  StoryGenre, 
  ImageGenerationRequest,
  ImageGenerationResult,
  OpenRouterImageModelId 
} from '../../../src/types/openrouter';

// Sample story content for different CEFR levels and genres
export const SAMPLE_STORIES_FOR_IMAGES = {
  A1: {
    adventure: 'Tom finds a key in the garden. The key is old and gold. He opens a small box with the key. Inside the box, there is a map. The map shows his house and a big tree. Tom runs to the tree. He finds a treasure under the tree!',
    mystery: 'The books move by themselves at night. Sara sees them from her window. She goes to the library. The old librarian smiles at her. "The books want to find their readers," she says. Sara understands now.'
  },
  B1: {
    adventure: 'Dr. Richardson leads an expedition into the Amazon rainforest. Her team discovers ancient ruins covered by thick vines. Strange symbols carved into stone walls tell a story of a lost civilization. As they explore deeper, mysterious sounds echo through the jungle.',
    science_fiction: 'In 2087, memory extraction technology allows people to share experiences directly. Maya works as a memory archivist, preserving important moments from human history. But when she discovers memories that were meant to be forgotten, everything changes.'
  },
  C2: {
    philosophical: 'The concept of time had always fascinated Professor Kellerman, but it wasn\'t until she encountered the paradoxical nature of quantum mechanics that she began to question the very foundation of causality itself. Her research into temporal consciousness would revolutionize our understanding of existence.'
  }
} as const;

// Expected image prompts for different scenarios
export const EXPECTED_IMAGE_PROMPTS = {
  A1_adventure: {
    basePrompt: 'Simple, colorful illustration suitable for A1 English learners',
    educationalElements: ['clear visual storytelling', 'child-friendly imagery', 'bold colors'],
    prohibitedElements: ['violence', 'complex details', 'dark themes'],
    expectedKeywords: ['garden', 'key', 'treasure', 'tree']
  },
  B1_adventure: {
    basePrompt: 'Detailed illustration suitable for B1 English learners',
    educationalElements: ['contextual backgrounds', 'moderate complexity', 'narrative elements'],
    prohibitedElements: ['excessive violence', 'inappropriate content'],
    expectedKeywords: ['Amazon', 'expedition', 'ruins', 'jungle']
  },
  C2_philosophical: {
    basePrompt: 'Sophisticated, artistic illustration suitable for C2 English learners',
    educationalElements: ['abstract concepts', 'cultural references', 'artistic interpretation'],
    prohibitedElements: ['overly simplistic imagery'],
    expectedKeywords: ['quantum', 'time', 'consciousness', 'abstract']
  }
} as const;

// Mock OpenRouter API responses for image generation
export const MOCK_IMAGE_GENERATION_RESPONSES = {
  success: {
    geminiFlash: {
      id: 'img-test-12345',
      object: 'chat.completion' as const,
      created: 1234567890,
      model: 'google/gemini-2.5-flash-image-preview:free' as OpenRouterImageModelId,
      choices: [{
        index: 0,
        message: {
          role: 'assistant' as const,
          content: 'Generated an educational illustration for your story.',
          images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==']
        },
        finish_reason: 'stop' as const
      }],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 0,
        total_tokens: 50
      }
    },
    geminiPro: {
      id: 'img-test-67890',
      object: 'chat.completion' as const,
      created: 1234567891,
      model: 'google/gemini-2.5-flash-image-preview' as OpenRouterImageModelId,
      choices: [{
        index: 0,
        message: {
          role: 'assistant' as const,
          content: 'Generated a high-quality educational illustration.',
          images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==']
        },
        finish_reason: 'stop' as const
      }],
      usage: {
        prompt_tokens: 60,
        completion_tokens: 0,
        total_tokens: 60
      }
    }
  },
  errors: {
    rateLimit: {
      error: {
        code: 429,
        message: 'Rate limit exceeded. Please try again later.',
        type: 'rate_limit_exceeded'
      }
    },
    modelUnavailable: {
      error: {
        code: 503,
        message: 'Model temporarily unavailable',
        type: 'service_unavailable'
      }
    },
    authError: {
      error: {
        code: 401,
        message: 'Invalid API key provided',
        type: 'invalid_api_key'
      }
    },
    invalidPrompt: {
      error: {
        code: 400,
        message: 'Invalid prompt for image generation',
        type: 'invalid_prompt'
      }
    }
  }
} as const;

// Sample image generation requests
export const SAMPLE_IMAGE_REQUESTS: Record<string, ImageGenerationRequest> = {
  A1_adventure: {
    storyContent: SAMPLE_STORIES_FOR_IMAGES.A1.adventure,
    level: 'A1',
    genre: 'adventure',
    style: 'children',
    aspectRatio: '16:9'
  },
  B1_adventure: {
    storyContent: SAMPLE_STORIES_FOR_IMAGES.B1.adventure,
    level: 'B1',
    genre: 'adventure',
    style: 'educational',
    aspectRatio: '16:9'
  },
  C2_philosophical: {
    storyContent: SAMPLE_STORIES_FOR_IMAGES.C2.philosophical,
    level: 'C2',
    genre: 'biography',
    style: 'realistic',
    aspectRatio: '4:3'
  }
};

// Expected successful results
export const EXPECTED_IMAGE_RESULTS: Record<string, ImageGenerationResult> = {
  success: {
    success: true,
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==',
    prompt: 'Educational illustration for story',
    model: 'google/gemini-2.5-flash-image-preview:free',
    generatedAt: '2024-01-01T00:00:00.000Z',
    isPlaceholder: false
  },
  placeholder: {
    success: true,
    imageUrl: 'https://picsum.photos/800/600',
    prompt: 'Placeholder image',
    model: 'google/gemini-2.5-flash-image-preview:free',
    generatedAt: '2024-01-01T00:00:00.000Z',
    isPlaceholder: true
  },
  failure: {
    success: false,
    error: 'Failed to generate image after trying all models'
  }
};

// Environment variables for testing
export const TEST_ENV_VARS = {
  OPENROUTER_API_KEY: 'test-api-key-12345',
  OPENROUTER_IMAGE_MODEL: 'google/gemini-2.5-flash-image-preview:free',
  OPENROUTER_IMAGE_MODEL_SECONDARY: 'google/gemini-2.5-flash-image-preview',
  IMAGE_GENERATION_ENABLED: 'true',
  IMAGE_GENERATION_TIMEOUT_MS: '30000',
  PLACEHOLDER_IMAGE_URL: 'https://picsum.photos/800/600'
};

// Utility functions for testing
export function createMockImageRequest(
  level: CEFRLevel = 'B1',
  genre: StoryGenre = 'adventure'
): ImageGenerationRequest {
  return {
    storyContent: SAMPLE_STORIES_FOR_IMAGES.B1.adventure,
    level,
    genre,
    style: 'educational',
    aspectRatio: '16:9'
  };
}

export function createMockImageResult(
  success = true,
  isPlaceholder = false
): ImageGenerationResult {
  if (!success) {
    return {
      success: false,
      error: 'Mock generation failure'
    };
  }

  return {
    success: true,
    imageUrl: isPlaceholder 
      ? 'https://picsum.photos/800/600'
      : 'data:image/png;base64,mock-base64-data',
    prompt: 'Mock generated prompt',
    model: 'google/gemini-2.5-flash-image-preview:free',
    generatedAt: new Date().toISOString(),
    isPlaceholder
  };
}