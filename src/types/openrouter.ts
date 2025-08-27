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
  CLAUDE_35_SONNET: 'anthropic/claude-3.5-sonnet',
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

// Vocabulary word extracted from story
export interface VocabularyWord {
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  difficulty: CEFRLevel;
}