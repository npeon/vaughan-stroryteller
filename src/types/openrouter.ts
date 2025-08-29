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
}

export interface OpenRouterChoice {
  index: number;
  message: OpenRouterMessage;
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

export type OpenRouterModelId = typeof OPENROUTER_MODELS[keyof typeof OPENROUTER_MODELS];

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
        title: { type: 'string', description: 'Engaging story title' },
        content: { type: 'string', description: 'The main story content (~300 words)' },
        level: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
        genre: { type: 'string' },
        word_count: { type: 'number' },
        reading_time_minutes: { type: 'number' }
      },
      required: ['title', 'content', 'level', 'genre', 'word_count', 'reading_time_minutes'],
      additionalProperties: false
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