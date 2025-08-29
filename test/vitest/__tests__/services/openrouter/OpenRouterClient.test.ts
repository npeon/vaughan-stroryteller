import { describe, it, expect, vi } from 'vitest';
import { server } from '../../../../../src/mocks/node';
import { http, HttpResponse } from 'msw';
import { OpenRouterClient, OpenRouterError } from '../../../../../src/services/openrouter/OpenRouterClient';
import type { OpenRouterRequest } from '../../../../../src/types/openrouter';

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    OPENROUTER_API_KEY: 'test-api-key',
    OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
    STORY_TIMEOUT_MS: '5000',
    SITE_URL: 'http://localhost:9000'
  },
  writable: true
});

describe('OpenRouterClient', () => {
  let client: OpenRouterClient;

  beforeEach(() => {
    client = new OpenRouterClient('test-api-key');
  });

  describe('Constructor', () => {
    it('should create client with valid API key', () => {
      expect(() => new OpenRouterClient('valid-key')).not.toThrow();
    });

    it('should throw error with invalid API key', () => {
      expect(() => new OpenRouterClient('')).toThrow('OpenRouter API key is required');
      expect(() => new OpenRouterClient('your-openrouter-api-key-here')).toThrow('OpenRouter API key is required');
    });

    it('should use default values for optional parameters', () => {
      const defaultClient = new OpenRouterClient('test-key');
      expect(defaultClient).toBeDefined();
    });
  });

  describe('chatCompletion', () => {
    const mockRequest: OpenRouterRequest = {
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Generate a B1 level adventure story' }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    it('should make successful API call', async () => {
      // MSW will handle this request automatically with the default handler
      const result = await client.chatCompletion(mockRequest);

      expect(result).toBeDefined();
      expect(result.choices).toBeDefined();
      expect(result.choices.length).toBeGreaterThan(0);
      expect(result.model).toBe('openai/gpt-4o-mini');
    });

    it('should handle rate limit error (429)', async () => {
      // Override MSW to simulate rate limit error
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json(
            {
              error: {
                code: 429,
                message: 'Rate limit exceeded',
                type: 'rate_limit_exceeded'
              }
            },
            { status: 429 }
          );
        })
      );

      await expect(client.chatCompletion(mockRequest))
        .rejects.toThrow(OpenRouterError);

      try {
        await client.chatCompletion(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        const openRouterError = error as OpenRouterError;
        expect(openRouterError.code).toBe(429);
        expect(openRouterError.isRateLimitError).toBe(true);
        expect(openRouterError.isRetryable).toBe(true);
      }
    });

    it('should handle model unavailable error (503)', async () => {
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json(
            {
              error: {
                code: 503,
                message: 'Model unavailable',
                type: 'model_unavailable'
              }
            },
            { status: 503 }
          );
        })
      );

      await expect(client.chatCompletion(mockRequest))
        .rejects.toThrow(OpenRouterError);

      try {
        await client.chatCompletion(mockRequest);
      } catch (error) {
        const openRouterError = error as OpenRouterError;
        expect(openRouterError.isModelUnavailable).toBe(true);
        expect(openRouterError.isRetryable).toBe(true);
      }
    });

    it('should handle authentication error (401)', async () => {
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json(
            {
              error: {
                code: 401,
                message: 'Unauthorized',
                type: 'authentication_error'
              }
            },
            { status: 401 }
          );
        })
      );

      try {
        await client.chatCompletion(mockRequest);
      } catch (error) {
        const openRouterError = error as OpenRouterError;
        expect(openRouterError.isAuthError).toBe(true);
        expect(openRouterError.isRetryable).toBe(false);
      }
    });

    it('should handle network timeout', async () => {
      const shortTimeoutClient = new OpenRouterClient('test-key', 'https://openrouter.ai/api/v1', 100);
      
      // Override to simulate slow response
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          return HttpResponse.json({ data: 'response' });
        })
      );

      await expect(shortTimeoutClient.chatCompletion(mockRequest))
        .rejects.toThrow('Request timeout after 100ms');
    });

    it('should handle network error', async () => {
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.error();
        })
      );

      await expect(client.chatCompletion(mockRequest))
        .rejects.toThrow('Network error: Unable to connect to OpenRouter API');
    });

    it('should handle JSON schema request', async () => {
      const schemaRequest = {
        ...mockRequest,
        response_format: {
          type: 'json_schema' as const,
          json_schema: {
            name: 'story_generation',
            schema: { type: 'object' }
          }
        }
      };

      const result = await client.chatCompletion(schemaRequest);
      expect(result.choices[0]?.message.content).toBeDefined();
    });
  });

  describe('getModels', () => {
    it('should fetch available models', async () => {
      // Override MSW for models endpoint
      server.use(
        http.get('https://openrouter.ai/api/v1/models', () => {
          return HttpResponse.json({
            data: [
              { id: 'openai/gpt-4o-mini' },
              { id: 'openai/gpt-4-turbo' },
              { id: 'meta-llama/llama-3.1-70b-instruct' }
            ]
          });
        })
      );

      const models = await client.getModels();
      
      expect(models).toEqual([
        'openai/gpt-4o-mini',
        'openai/gpt-4-turbo',
        'meta-llama/llama-3.1-70b-instruct'
      ]);
    });

    it('should return fallback models on API error', async () => {
      server.use(
        http.get('https://openrouter.ai/api/v1/models', () => {
          return HttpResponse.error();
        })
      );

      const models = await client.getModels();
      expect(models).toEqual([
        'openai/gpt-4o-mini',
        'openai/gpt-4-turbo',
        'meta-llama/llama-3.1-70b-instruct'
      ]);
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      server.use(
        http.get('https://openrouter.ai/api/v1/models', () => {
          return HttpResponse.json({ data: [] });
        })
      );

      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      server.use(
        http.get('https://openrouter.ai/api/v1/models', () => {
          return new Response(null, { status: 500, statusText: 'Internal Server Error' });
        })
      );

      const result = await client.testConnection();
      expect(result).toBe(false);
    });
  });
});

describe('OpenRouterError', () => {
  it('should create error with correct properties', () => {
    const error = new OpenRouterError('Test message', 429, 'rate_limit', 429);
    
    expect(error.message).toBe('Test message');
    expect(error.code).toBe(429);
    expect(error.type).toBe('rate_limit');
    expect(error.status).toBe(429);
    expect(error.name).toBe('OpenRouterError');
  });

  it('should correctly identify error types', () => {
    const rateLimitError = new OpenRouterError('Rate limit', 429, 'rate_limit', 429);
    const modelError = new OpenRouterError('Model unavailable', 503, 'model_unavailable', 503);
    const authError = new OpenRouterError('Unauthorized', 401, 'auth_error', 401);
    const serverError = new OpenRouterError('Server error', 500, 'server_error', 500);

    expect(rateLimitError.isRateLimitError).toBe(true);
    expect(modelError.isModelUnavailable).toBe(true);
    expect(authError.isAuthError).toBe(true);
    
    expect(rateLimitError.isRetryable).toBe(true);
    expect(modelError.isRetryable).toBe(true);
    expect(authError.isRetryable).toBe(false);
    expect(serverError.isRetryable).toBe(true);
  });
});