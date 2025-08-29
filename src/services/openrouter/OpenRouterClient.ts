import type {
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterError as OpenRouterErrorType,
  OpenRouterModelId
} from '../../types/openrouter';
import { OPENROUTER_MODELS } from '../../types/openrouter';

/**
 * OpenRouter API Client
 * Handles authentication and communication with OpenRouter API
 */
export class OpenRouterClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    apiKey: string = import.meta.env.OPENROUTER_API_KEY,
    baseUrl: string = import.meta.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    timeout: number = parseInt(import.meta.env.STORY_TIMEOUT_MS || '30000', 10)
  ) {
    if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
      throw new Error('OpenRouter API key is required. Please set OPENROUTER_API_KEY in your environment variables.');
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Make a chat completion request to OpenRouter
   */
  async chatCompletion(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': import.meta.env.SITE_URL || 'http://localhost:9000',
          'X-Title': 'The Vaughan Storyteller'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: OpenRouterErrorType = await response.json();
        throw new OpenRouterError(
          errorData.error.message,
          errorData.error.code,
          errorData.error.type,
          response.status
        );
      }

      return await response.json() as OpenRouterResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof OpenRouterError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new OpenRouterError(
          `Request timeout after ${this.timeout}ms`,
          408,
          'timeout_error',
          408
        );
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new OpenRouterError(
          'Network error: Unable to connect to OpenRouter API',
          0,
          'network_error',
          0
        );
      }

      throw new OpenRouterError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'unknown_error',
        500
      );
    }
  }

  /**
   * Get available models from OpenRouter
   */
  async getModels(): Promise<OpenRouterModelId[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json() as { data?: Array<{ id: string }> };
      return (data.data?.map((model) => model.id) || []) as OpenRouterModelId[];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      // Return fallback models if API call fails
      return Object.values(OPENROUTER_MODELS);
    }
  }

  /**
   * Test API connection and authentication
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Custom error class for OpenRouter API errors
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: number,
    public type: string,
    public status: number
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }

  get isRateLimitError(): boolean {
    return this.code === 429;
  }

  get isModelUnavailable(): boolean {
    return this.code === 503 || this.type === 'model_unavailable';
  }

  get isAuthError(): boolean {
    return this.code === 401 || this.code === 403;
  }

  get isRetryable(): boolean {
    return this.isRateLimitError || this.isModelUnavailable || this.status >= 500;
  }
}