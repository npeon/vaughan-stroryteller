import { OpenRouterClient, OpenRouterError } from './OpenRouterClient';
import type {
  StoryGenerationRequest,
  StoryGenerationResponse,
  CEFRLevel,
  OpenRouterModelId
} from '../../types/openrouter';
import { STORY_GENERATION_SCHEMA } from '../../types/openrouter';

/**
 * Story Generator Service
 * Handles AI-powered story generation with fallback strategy
 */
export class StoryGenerator {
  private client: OpenRouterClient;
  private readonly models: OpenRouterModelId[];
  private readonly maxRetries: number;

  constructor(client?: OpenRouterClient) {
    this.client = client || new OpenRouterClient();
    this.models = [
      import.meta.env.OPENROUTER_PRIMARY_MODEL || 'openai/gpt-4o-mini',
      import.meta.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-4-turbo', 
      import.meta.env.OPENROUTER_TERTIARY_MODEL || 'meta-llama/llama-3.1-70b-instruct'
    ];
    this.maxRetries = parseInt(import.meta.env.STORY_MAX_RETRIES || '3', 10);
  }

  /**
   * Generate a story with vocabulary based on CEFR level
   */
  async generateStory(request: StoryGenerationRequest): Promise<StoryGenerationResponse> {
    let lastError: Error | null = null;

    // Try each model in sequence
    for (const model of this.models) {
      try {
        return await this.attemptStoryGeneration(request, model);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Story generation failed with model ${model}:`, error);
        
        // If it's an auth error, don't retry with other models
        if (error instanceof OpenRouterError && error.isAuthError) {
          throw error;
        }
      }
    }

    throw new Error(
      `Failed to generate story after trying ${this.models.length} models. Last error: ${lastError?.message}`
    );
  }

  /**
   * Attempt story generation with specific model
   */
  private async attemptStoryGeneration(
    request: StoryGenerationRequest,
    model: OpenRouterModelId
  ): Promise<StoryGenerationResponse> {
    const prompt = this.buildPrompt(request);
    const wordCount = request.wordCount || parseInt(import.meta.env.STORY_DEFAULT_WORD_COUNT || '300', 10);
    const vocabularyPercentage = parseInt(import.meta.env.STORY_VOCABULARY_PERCENTAGE || '10', 10);

    const openRouterRequest = {
      model,
      messages: [
        {
          role: 'system' as const,
          content: this.getSystemPrompt(request.level, vocabularyPercentage)
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ],
      max_tokens: Math.floor(wordCount * 2.5), // Allow for JSON overhead
      temperature: 0.7,
      response_format: {
        type: 'json_schema' as const,
        json_schema: {
          name: 'story_generation',
          strict: true,
          schema: STORY_GENERATION_SCHEMA
        }
      }
    };

    const response = await this.client.chatCompletion(openRouterRequest);
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenRouter API');
    }

    try {
      const parsedResponse = JSON.parse(content) as StoryGenerationResponse;
      
      // Validate the response structure
      this.validateResponse(parsedResponse, request);

      // Add unique ID for persistence if not already present
      if (!parsedResponse.story.id) {
        parsedResponse.story.id = `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      return parsedResponse;
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
  }

  /**
   * Build the user prompt for story generation
   */
  private buildPrompt(request: StoryGenerationRequest): string {
    const wordCount = request.wordCount || parseInt(import.meta.env.STORY_DEFAULT_WORD_COUNT || '300', 10);
    
    return `Generate an engaging ${request.genre} story suitable for ${request.level} English learners.

Requirements:
- Approximately ${wordCount} words
- Appropriate difficulty for ${request.level} level
- Include vocabulary suitable for language learning
- Theme: ${request.theme || 'daily life and personal growth'}

The story should be interesting, well-structured, and help students learn English naturally while enjoying the narrative.`;
  }

  /**
   * Get system prompt for the AI model
   */
  private getSystemPrompt(level: CEFRLevel, vocabularyPercentage: number): string {
    const levelDescriptions = {
      A1: 'basic everyday expressions and very basic phrases',
      A2: 'sentences and frequently used expressions for simple, routine tasks',  
      B1: 'clear standard input on familiar matters and concrete topics',
      B2: 'complex texts on concrete and abstract topics, including technical discussions',
      C1: 'sophisticated texts with implicit meaning and various registers',
      C2: 'virtually everything heard or read with ease and sophisticated expression'
    };

    return `You are an expert English language teacher creating educational stories for students.

Generate a JSON response with:
1. A compelling ${level} level story (~300 words)
2. Extract the ${vocabularyPercentage}% most difficult words with:
   - English definition
   - Spanish translation (natural, not literal)
   - Spanish phonetic pronunciation 
   - Example sentence
   - Difficulty score (1-10)

${level} Level Guidelines:
- Use vocabulary and grammar appropriate for students who can understand ${levelDescriptions[level]}
- Ensure story complexity matches the learning level
- Make vocabulary extraction educational and practical

Focus on creating an engaging narrative that naturally incorporates vocabulary suitable for language learning at the ${level} level.`;
  }

  /**
   * Validate the generated response
   */
  private validateResponse(response: StoryGenerationResponse, request: StoryGenerationRequest): void {
    if (!response.story?.content || !response.story?.title) {
      throw new Error('Invalid response: missing story content or title');
    }

    if (!Array.isArray(response.vocabulary)) {
      throw new Error('Invalid response: vocabulary must be an array');
    }

    // Check if vocabulary has required Spanish translations
    for (const word of response.vocabulary) {
      if (!word.definition_spanish || !word.pronunciation_english) {
        throw new Error('Invalid response: vocabulary missing Spanish translations or English pronunciation');
      }
    }

    // Validate word count is reasonable
    const wordCount = response.story.content.split(/\s+/).length;
    const expectedWordCount = request.wordCount || parseInt(import.meta.env.STORY_DEFAULT_WORD_COUNT || '300', 10);
    
    if (wordCount < expectedWordCount * 0.5 || wordCount > expectedWordCount * 2) {
      console.warn(`Word count ${wordCount} is outside expected range of ${expectedWordCount}`);
    }
  }

  /**
   * Get health status of the service
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    availableModels: number;
    lastChecked: string;
  }> {
    try {
      const isConnected = await this.client.testConnection();
      const availableModels = isConnected ? this.models.length : 0;
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        availableModels,
        lastChecked: new Date().toISOString()
      };
    } catch {
      return {
        status: 'unhealthy',
        availableModels: 0,
        lastChecked: new Date().toISOString()
      };
    }
  }
}