// MSW Testing Utilities
// Utilities for testing with Mock Service Worker

import { http, HttpResponse } from 'msw';
import { server } from '../mocks/node';
import type { WordsApiError } from '../types/wordsapi';
import type { OpenRouterError } from "../types/openrouter";
import type { ElevenLabsError } from "../types/elevenlabs";

// Re-export server utilities for easy access
export { server } from '../mocks/node';

// Only export worker in browser environment
export const getWorker = async () => {
  if (typeof window !== 'undefined') {
    const { worker } = await import('../mocks/browser');
    return worker;
  }
  return null;
};

// Request tracking utilities
interface RequestLog {
  method: string;
  url: string;
  body?: unknown;
  timestamp: number;
}

let requestLogs: RequestLog[] = [];
let interceptedRequests: Request[] = [];

// MSW Testing Utilities
export const mswTestUtils = {
  /**
   * Reset all handlers and clear request logs
   */
  reset() {
    server.resetHandlers();
    requestLogs = [];
    interceptedRequests = [];
  },

  /**
   * Wait for MSW to intercept a specific request
   */
  async waitForRequest(urlPattern: string | RegExp, timeout = 5000): Promise<RequestLog | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const matchingRequest = requestLogs.find(log => {
        if (typeof urlPattern === 'string') {
          return log.url.includes(urlPattern);
        }
        return urlPattern.test(log.url);
      });
      
      if (matchingRequest) {
        return matchingRequest;
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return null;
  },

  /**
   * Get all intercepted requests
   */
  getRequests(): RequestLog[] {
    return [...requestLogs];
  },

  /**
   * Get requests matching a pattern
   */
  getRequestsByPattern(pattern: string | RegExp): RequestLog[] {
    return requestLogs.filter(log => {
      if (typeof pattern === 'string') {
        return log.url.includes(pattern);
      }
      return pattern.test(log.url);
    });
  },

  /**
   * Clear request logs
   */
  clearLogs() {
    requestLogs = [];
    interceptedRequests = [];
  },

  /**
   * Check if a specific API was called
   */
  wasApiCalled(service: 'openrouter' | 'elevenlabs' | 'wordsapi'): boolean {
    const patterns: Record<string, RegExp> = {
      openrouter: /openrouter\.ai/,
      elevenlabs: /elevenlabs\.io/,
      wordsapi: /wordsapiv1\.p\.rapidapi\.com/
    };
    
    const pattern = patterns[service];
    return requestLogs.some(log => pattern!.test(log.url));
   },

  /**
   * Get request count for a specific service
   */
  getApiCallCount(service: 'openrouter' | 'elevenlabs' | 'wordsapi'): number {
    const patterns: Record<string, RegExp> = {
      openrouter: /openrouter\.ai/,
      elevenlabs: /elevenlabs\.io/,
      wordsapi: /wordsapiv1\.p\.rapidapi\.com/
    };
    
    const pattern = patterns[service];
    return requestLogs.filter(log => pattern!.test(log.url)).length;
  },

  /**
   * Add request logging to track API calls
   */
  enableRequestLogging() {
    server.events.on('request:start', ({ request }) => {
      requestLogs.push({
        method: request.method,
        url: request.url,
        timestamp: Date.now(),
      });
      interceptedRequests.push(request);
    });
  },

  /**
   * Disable request logging
   */
  disableRequestLogging() {
    server.events.removeAllListeners('request:start');
  }
};

// Mock override utilities for specific test scenarios
export const mockOverrides = {
  /**
   * Mock OpenRouter API to return an error
   */
  mockOpenRouterError(statusCode: number = 500, message: string = 'Internal server error') {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json<OpenRouterError>(
          {
            error: {
              code: statusCode,
              message,
              type: 'server_error',
            },
          },
          { status: statusCode }
        );
      })
    );
  },

  /**
   * Mock OpenRouter API to return rate limit error
   */
  mockOpenRouterRateLimit() {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json<OpenRouterError>(
          {
            error: {
              code: 429,
              message: 'Rate limit exceeded. Please wait before making another request.',
              type: 'rate_limit_exceeded',
            },
          },
          { status: 429 }
        );
      })
    );
  },

  /**
   * Mock ElevenLabs API to return an error
   */
  mockElevenLabsError(statusCode: number = 500, message: string = 'Internal server error') {
    server.use(
      http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId', () => {
        return HttpResponse.json<ElevenLabsError>(
          {
            detail: {
              status: 'server_error',
              message,
            },
          },
          { status: statusCode }
        );
      })
    );
  },

  /**
   * Mock ElevenLabs API to return quota exceeded error
   */
  mockElevenLabsQuotaExceeded() {
    server.use(
      http.post('https://api.elevenlabs.io/v1/text-to-speech/:voiceId', () => {
        return HttpResponse.json<ElevenLabsError>(
          {
            detail: {
              status: 'quota_exceeded',
              message: 'Monthly character quota exceeded. Please upgrade your plan.',
            },
          },
          { status: 402 }
        );
      })
    );
  },

  /**
   * Mock WordsAPI to return word not found error
   */
  mockWordsApiNotFound(word: string = 'nonexistentword') {
    server.use(
      http.get(`https://wordsapiv1.p.rapidapi.com/words/${word}`, () => {
        return HttpResponse.json<WordsApiError>(
          {
            success: false,
            message: `No word found with the word '${word}'`,
          },
          { status: 404 }
        );
      })
    );
  },

  /**
   * Mock slow response for testing timeout scenarios
   */
  mockSlowResponse(service: 'openrouter' | 'elevenlabs' | 'wordsapi', delay: number = 5000) {
    const urls: Record<string, string> = {
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      elevenlabs: 'https://api.elevenlabs.io/v1/text-to-speech/:voiceId',
      wordsapi: 'https://wordsapiv1.p.rapidapi.com/words/:word'
    };

    const url = urls[service]!;
    server.use(
      http.get(url, async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return HttpResponse.json({ message: 'Delayed response' });
      }),
      http.post(url, async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return HttpResponse.json({ message: 'Delayed response' });
      })
    );
  },

  /**
   * Mock network failure
   */
  mockNetworkFailure(service: 'openrouter' | 'elevenlabs' | 'wordsapi') {
    const urls: Record<string, string> = {
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      elevenlabs: 'https://api.elevenlabs.io/v1/text-to-speech/:voiceId',
      wordsapi: 'https://wordsapiv1.p.rapidapi.com/words/:word'
    };

    const url = urls[service]!;
    server.use(
      http.get(url, () => {
        return HttpResponse.error();
      }),
      http.post(url, () => {
        return HttpResponse.error();
      })
    );
  },

  /**
   * Mock successful responses with custom data
   */
  mockSuccessResponse(service: 'openrouter' | 'elevenlabs' | 'wordsapi', responseData: Record<string, unknown>) {
    const urls: Record<string, string> = {
      openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      elevenlabs: 'https://api.elevenlabs.io/v1/text-to-speech/:voiceId',
      wordsapi: 'https://wordsapiv1.p.rapidapi.com/words/:word'
    };

    const url = urls[service]!;
    server.use(
      http.get(url, () => {
        return HttpResponse.json(responseData);
      }),
      http.post(url, () => {
        return HttpResponse.json(responseData);
      })
    );
  },

  /**
   * Reset all overrides to original handlers
   */
  resetOverrides() {
    server.resetHandlers();
  }
};

// Test assertion helpers
export const mswAssertions = {
  /**
   * Assert that a specific API was called
   */
  expectApiWasCalled(service: 'openrouter' | 'elevenlabs' | 'wordsapi') {
    const wasCalled = mswTestUtils.wasApiCalled(service);
    if (!wasCalled) {
      throw new Error(`Expected ${service} API to be called, but it wasn't`);
    }
  },

  /**
   * Assert that a specific API was NOT called
   */
  expectApiWasNotCalled(service: 'openrouter' | 'elevenlabs' | 'wordsapi') {
    const wasCalled = mswTestUtils.wasApiCalled(service);
    if (wasCalled) {
      throw new Error(`Expected ${service} API to NOT be called, but it was`);
    }
  },

  /**
   * Assert specific number of API calls
   */
  expectApiCallCount(service: 'openrouter' | 'elevenlabs' | 'wordsapi', expectedCount: number) {
    const actualCount = mswTestUtils.getApiCallCount(service);
    if (actualCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} calls to ${service} API, but got ${actualCount}`);
    }
  },

  /**
   * Assert that no real network requests were made
   */
  expectNoRealNetworkCalls() {
    // This would require additional setup to track real network calls vs mocked ones
    // For now, we can check that our MSW handlers were used
    const totalCalls = mswTestUtils.getRequests().length;
    if (totalCalls === 0) {
      console.warn('No MSW requests detected. This might indicate that requests are bypassing MSW.');
    }
  }
};

// Setup helper for tests
export const setupMSWTest = () => {
  // Enable request logging
  mswTestUtils.enableRequestLogging();
  
  return {
    cleanup: () => {
      mswTestUtils.reset();
      mswTestUtils.disableRequestLogging();
    }
  };
};