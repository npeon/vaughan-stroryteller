import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from '../../../../../src/mocks/node';
import { http, HttpResponse } from 'msw';
import { StoryGenerator } from '../../../../../src/services/openrouter/StoryGenerator';
import { OpenRouterClient, OpenRouterError } from '../../../../../src/services/openrouter/OpenRouterClient';
import type { StoryGenerationRequest, StoryGenerationResponse } from '../../../../../src/types/openrouter';

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    OPENROUTER_API_KEY: 'test-api-key',
    OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
    OPENROUTER_PRIMARY_MODEL: 'openai/gpt-4o-mini',
    OPENROUTER_FALLBACK_MODEL: 'openai/gpt-4-turbo',
    OPENROUTER_TERTIARY_MODEL: 'meta-llama/llama-3.1-70b-instruct',
    STORY_DEFAULT_WORD_COUNT: '300',
    STORY_VOCABULARY_PERCENTAGE: '10',
    STORY_MAX_RETRIES: '3',
    STORY_TIMEOUT_MS: '30000',
    SITE_URL: 'http://localhost:9000'
  },
  writable: true
});

describe('StoryGenerator', () => {
  let storyGenerator: StoryGenerator;

  beforeEach(() => {
    // Create a mock client with the test API key
    const mockClient = new OpenRouterClient('test-api-key');
    storyGenerator = new StoryGenerator(mockClient);
  });

  describe('generateStory', () => {
    const mockRequest: StoryGenerationRequest = {
      level: 'B1',
      genre: 'adventure',
      wordCount: 300,
      theme: 'daily life'
    };

    const mockStructuredResponse: StoryGenerationResponse = {
      story: {
        title: 'The Hidden Key',
        content: 'Tom finds a mysterious key in his garden. He wonders what it opens. Tom looks everywhere in his house. Finally, he finds a small wooden box in the attic. The key opens the box. Inside, there are old photos of his grandfather as a young man. Tom realizes the photos show places he has never seen before. Each photo has a date and location written on the back. Tom decides to research these places and discovers they are all connected to a historical treasure hunt that his grandfather participated in during his youth.',
        level: 'B1',
        genre: 'adventure',
        word_count: 87,
        reading_time_minutes: 1
      },
      vocabulary: [
        {
          word: 'mysterious',
          partOfSpeech: 'adjective',
          definition: 'Strange and not easily understood',
          definition_spanish: 'misterioso',
          pronunciation_english: 'MIS-te-ri-us',
          example: 'He found a mysterious key in the garden.',
          difficulty: 'B1',
          difficulty_score: 5
        },
        {
          word: 'research',
          partOfSpeech: 'verb',
          definition: 'To study something carefully',
          definition_spanish: 'investigar',
          pronunciation_english: 'in-VES-ti-geit',
          example: 'Tom decided to research these places.',
          difficulty: 'B1',
          difficulty_score: 6
        }
      ],
      metadata: {
        generated_at: '2025-01-01T00:00:00.000Z',
        model_used: 'openai/gpt-4o-mini',
        total_words: 87,
        vocabulary_percentage: 2
      }
    };

    it('should generate story successfully with primary model', async () => {
      // Override MSW to return structured response
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json({
            id: 'test-id',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'openai/gpt-4o-mini',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify(mockStructuredResponse)
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
          });
        })
      );

      const result = await storyGenerator.generateStory(mockRequest);

      expect(result).toEqual(mockStructuredResponse);
    });

    it('should use fallback model when primary fails', async () => {
      let callCount = 0;
      
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
          const body = await request.json() as any;
          callCount++;
          
          if (callCount === 1 && body.model === 'openai/gpt-4o-mini') {
            // Primary model fails
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
          }
          
          // Fallback model succeeds
          return HttpResponse.json({
            id: 'test-id-fallback',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: body.model,
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify(mockStructuredResponse)
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
          });
        })
      );

      const result = await storyGenerator.generateStory(mockRequest);

      expect(result).toEqual(mockStructuredResponse);
    });

    it('should use tertiary model when both primary and fallback fail', async () => {
      let callCount = 0;
      
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
          const body = await request.json() as any;
          callCount++;
          
          if (callCount <= 2) {
            // First two models fail
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
          }
          
          // Tertiary model succeeds
          return HttpResponse.json({
            id: 'test-id-tertiary',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: body.model,
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify(mockStructuredResponse)
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
          });
        })
      );

      const result = await storyGenerator.generateStory(mockRequest);

      expect(result).toEqual(mockStructuredResponse);
    });

    it('should throw error when all models fail', async () => {
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

      await expect(storyGenerator.generateStory(mockRequest))
        .rejects.toThrow('Failed to generate story after trying 3 models');
    });

    it('should not retry on authentication error', async () => {
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

      await expect(storyGenerator.generateStory(mockRequest))
        .rejects.toThrow('Unauthorized');
    });

    it('should handle empty response', async () => {
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json({
            id: 'test-id',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'openai/gpt-4o-mini',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: ''
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 }
          });
        })
      );

      await expect(storyGenerator.generateStory(mockRequest))
        .rejects.toThrow('Empty response from OpenRouter API');
    });

    it('should handle invalid JSON response', async () => {
      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json({
            id: 'test-id',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'openai/gpt-4o-mini',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: 'Invalid JSON content'
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
          });
        })
      );

      await expect(storyGenerator.generateStory(mockRequest))
        .rejects.toThrow('Failed to parse JSON response');
    });

    it('should validate response structure', async () => {
      const invalidResponse = {
        story: {
          title: 'Test Title'
          // Missing content and other required fields
        }
      };

      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json({
            id: 'test-id',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'openai/gpt-4o-mini',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify(invalidResponse)
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
          });
        })
      );

      await expect(storyGenerator.generateStory(mockRequest))
        .rejects.toThrow('Invalid response: missing story content or title');
    });

    it('should validate vocabulary has Spanish translations', async () => {
      const responseWithoutSpanish = {
        ...mockStructuredResponse,
        vocabulary: [
          {
            word: 'test',
            partOfSpeech: 'noun',
            definition: 'A test word',
            // Missing definition_spanish and pronunciation_english
            example: 'This is a test.',
            difficulty: 'B1',
            difficulty_score: 5
          }
        ]
      };

      server.use(
        http.post('https://openrouter.ai/api/v1/chat/completions', () => {
          return HttpResponse.json({
            id: 'test-id',
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'openai/gpt-4o-mini',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify(responseWithoutSpanish)
              },
              finish_reason: 'stop'
            }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
          });
        })
      );

      await expect(storyGenerator.generateStory(mockRequest))
        .rejects.toThrow('Invalid response: vocabulary missing Spanish translations');
    });

    it('should generate stories for different CEFR levels', async () => {
      const levels: Array<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      
      for (const level of levels) {
        const levelRequest = { ...mockRequest, level };
        const levelResponse = { ...mockStructuredResponse, story: { ...mockStructuredResponse.story, level } };
        
        server.use(
          http.post('https://openrouter.ai/api/v1/chat/completions', () => {
            return HttpResponse.json({
              id: `test-id-${level}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: 'openai/gpt-4o-mini',
              choices: [{
                index: 0,
                message: {
                  role: 'assistant',
                  content: JSON.stringify(levelResponse)
                },
                finish_reason: 'stop'
              }],
              usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
            });
          })
        );

        const result = await storyGenerator.generateStory(levelRequest);
        expect(result.story.level).toBe(level);
      }
    });

    it('should generate stories for different genres', async () => {
      const genres: Array<'adventure' | 'mystery' | 'romance' | 'fantasy'> = ['adventure', 'mystery', 'romance', 'fantasy'];
      
      for (const genre of genres) {
        const genreRequest = { ...mockRequest, genre };
        
        server.use(
          http.post('https://openrouter.ai/api/v1/chat/completions', () => {
            return HttpResponse.json({
              id: `test-id-${genre}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: 'openai/gpt-4o-mini',
              choices: [{
                index: 0,
                message: {
                  role: 'assistant',
                  content: JSON.stringify(mockStructuredResponse)
                },
                finish_reason: 'stop'
              }],
              usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
            });
          })
        );

        await storyGenerator.generateStory(genreRequest);
      }
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when connection works', async () => {
      server.use(
        http.get('https://openrouter.ai/api/v1/models', () => {
          return HttpResponse.json({ data: [] });
        })
      );

      const status = await storyGenerator.getHealthStatus();

      expect(status.status).toBe('healthy');
      expect(status.availableModels).toBe(3);
      expect(status.lastChecked).toBeDefined();
    });

    it('should return unhealthy status when connection fails', async () => {
      server.use(
        http.get('https://openrouter.ai/api/v1/models', () => {
          return new Response(null, { status: 500, statusText: 'Internal Server Error' });
        })
      );

      const status = await storyGenerator.getHealthStatus();

      expect(status.status).toBe('unhealthy');
      expect(status.availableModels).toBe(0);
    });

    it('should return unhealthy status on connection error', async () => {
      server.use(
        http.get('https://openrouter.ai/api/v1/models', () => {
          return new Response(null, { status: 0, statusText: 'Network Error' });
        })
      );

      const status = await storyGenerator.getHealthStatus();

      expect(status.status).toBe('unhealthy');
      expect(status.availableModels).toBe(0);
    });
  });
});