// OpenRouter API Types
// https://openrouter.ai/docs/api

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
  response_format?: {
    type: 'json_schema';
    json_schema: {
      name: string;
      strict?: boolean;
      schema: Record<string, unknown>;
    };
  };
  modalities?: ('text' | 'image')[]; // For image generation support
}

export interface OpenRouterChoice {
  index: number;
  message: OpenRouterMessage & {
    images?: string[]; // Base64 encoded image data URLs for image generation
  };
  finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage: OpenRouterUsage;
}

export interface OpenRouterError {
  error: {
    code: number;
    message: string;
    type: string;
    param?: string;
  };
}

// Model configurations for story generation
export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: 'text';
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

// Available models for fallback strategy
export const OPENROUTER_MODELS = {
  GPT4O_MINI: 'openai/gpt-4o-mini',
  GPT4_TURBO: 'openai/gpt-4-turbo',
  LLAMA_31_70B: 'meta-llama/llama-3.1-70b-instruct',
} as const;

// Image generation models
export const OPENROUTER_IMAGE_MODELS = {
  GEMINI_FLASH_FREE: 'google/gemini-2.5-flash-image-preview:free',
  GEMINI_FLASH: 'google/gemini-2.5-flash-image-preview',
} as const;

export type OpenRouterModelId = typeof OPENROUTER_MODELS[keyof typeof OPENROUTER_MODELS];
export type OpenRouterImageModelId = typeof OPENROUTER_IMAGE_MODELS[keyof typeof OPENROUTER_IMAGE_MODELS];

// CEFR levels for story generation
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Story genres
export type StoryGenre = 
  | 'adventure'
  | 'mystery'
  | 'romance'
  | 'science_fiction'
  | 'fantasy'
  | 'thriller'
  | 'comedy'
  | 'drama'
  | 'historical'
  | 'biography';

// Story generation request parameters
export interface StoryGenerationRequest {
  level: CEFRLevel;
  genre: StoryGenre;
  wordCount: number;
  theme?: string;
  includeVocabulary?: boolean;
  model?: OpenRouterModelId;
}

// Generated story structure
export interface GeneratedStory {
  title: string;
  content: string;
  level: CEFRLevel;
  genre: StoryGenre;
  wordCount: number;
  readingTime: number; // in minutes
  vocabulary: VocabularyWord[];
  generatedAt: string;
  model: string;
}

// Vocabulary word extracted from story with Spanish translations
export interface VocabularyWord {
  word: string;
  partOfSpeech: string;
  definition: string;
  definition_spanish: string;
  pronunciation_english: string;
  example: string;
  difficulty: CEFRLevel;
  difficulty_score: number; // 1-10 scale for sorting
}

// Structured response from OpenRouter for story generation
export interface StoryGenerationResponse {
  story: {
    id?: string; // Added optional id field for persistence
    title: string;
    content: string;
    level: CEFRLevel;
    genre: StoryGenre;
    word_count: number;
    reading_time_minutes: number;
  };
  vocabulary: VocabularyWord[];
  metadata: {
    generated_at: string;
    model_used: string;
    total_words: number;
    vocabulary_percentage: number;
  };
}

// JSON Schema for OpenRouter structured response
export const STORY_GENERATION_SCHEMA = {
  type: 'object',
  properties: {
    story: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Optional story identifier for persistence' },
        title: { type: 'string', description: 'Engaging story title' },
        content: { type: 'string', description: 'The main story content (~300 words)' },
        level: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
        genre: { type: 'string' },
        word_count: { type: 'number' },
        reading_time_minutes: { type: 'number' }
      },
      required: ['title', 'content', 'level', 'genre', 'word_count', 'reading_time_minutes'],
      additionalProperties: true // Allow additional properties like 'id' for persistence
    },
    vocabulary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          word: { type: 'string', description: 'The vocabulary word from the story' },
          partOfSpeech: { type: 'string', description: 'Part of speech (noun, verb, adjective, etc.)' },
          definition: { type: 'string', description: 'English definition' },
          definition_spanish: { type: 'string', description: 'Spanish translation/meaning' },
          pronunciation_english: { type: 'string', description: 'How to pronounce in English using Spanish-friendly phonetic notation' },
          example: { type: 'string', description: 'Example sentence using the word' },
          difficulty: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
          difficulty_score: { type: 'number', minimum: 1, maximum: 10 }
        },
        required: ['word', 'partOfSpeech', 'definition', 'definition_spanish', 'pronunciation_english', 'example', 'difficulty', 'difficulty_score'],
        additionalProperties: false
      },
      description: 'Top 10% most difficult words from the story with Spanish translations'
    },
    metadata: {
      type: 'object',
      properties: {
        generated_at: { type: 'string' },
        model_used: { type: 'string' },
        total_words: { type: 'number' },
        vocabulary_percentage: { type: 'number' }
      },
      required: ['generated_at', 'model_used', 'total_words', 'vocabulary_percentage'],
      additionalProperties: false
    }
  },
  required: ['story', 'vocabulary', 'metadata'],
  additionalProperties: false
} as const;

// Image Generation Types

export interface ImageGenerationRequest {
  storyContent: string;
  level: CEFRLevel;
  genre: StoryGenre;
  style?: 'educational' | 'children' | 'realistic' | 'illustration';
  aspectRatio?: '16:9' | '4:3' | '1:1';
  model?: OpenRouterImageModelId;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  model: OpenRouterImageModelId;
  generatedAt: string;
  isPlaceholder?: boolean;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string; // Can be base64 data URL or Supabase Storage public URL
  prompt?: string;
  model?: OpenRouterImageModelId;
  generatedAt?: string;
  isPlaceholder?: boolean;
  error?: string;
  // Storage metadata (populated after persistence)
  storage?: {
    storagePath?: string; // Path in Supabase Storage bucket
    publicUrl?: string;   // Public URL for cached access
    persistedAt?: string; // When image was persisted to storage
    sizeBytes?: number;   // File size in bytes
  };
}

// Story with Image combined types
export interface StoryWithImageRequest extends StoryGenerationRequest {
  includeImage?: boolean;
  imageStyle?: 'educational' | 'children' | 'realistic' | 'illustration';
  imageAspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface StoryWithImageResponse {
  story: StoryGenerationResponse;
  image?: ImageGenerationResult;
  metadata: {
    storyGeneratedAt: string;
    imageGeneratedAt?: string;
    totalProcessingTime: number;
    // Storage metadata
    imagePersisted?: boolean;
    storageProvider?: 'supabase' | 'memory';
  };
}

// Enhanced interfaces for persistent storage
export interface PersistedStoryImage {
  id: string; // Story ID
  imageUrl: string; // Supabase Storage public URL
  storagePath: string; // Path in storage bucket
  generatedAt: string;
  persistedAt: string;
  modelUsed: string;
  style: 'educational' | 'children' | 'realistic' | 'illustration';
  prompt: string; // Generation prompt for analytics
  level: CEFRLevel;
  genre: StoryGenre;
  sizeBytes?: number;
  mimeType?: string;
}

// Storage service response types
export interface ImageStorageResult {
  success: boolean;
  persistedImage?: PersistedStoryImage;
  error?: string;
}

// Analytics and management types
export interface ImageStorageStats {
  totalImages: number;
  totalSizeBytes: number;
  imagesWithStories: number;
  orphanedImages: number;
  byLevel: Record<CEFRLevel, number>;
  byGenre: Record<StoryGenre, number>;
  byModel: Record<string, number>;
}