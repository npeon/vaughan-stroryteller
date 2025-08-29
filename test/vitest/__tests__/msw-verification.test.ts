// MSW Verification Tests
// Tests to verify that MSW is properly configured and working

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupMSWTest, mswTestUtils, mockOverrides, mswAssertions } from '../../../src/test-utils/msw';
import type { OpenRouterRequest, OpenRouterResponse } from '../../../src/types/openrouter';
import type { ElevenLabsTTSRequest, ElevenLabsTTSResponse } from '../../../src/types/elevenlabs';
import type { WordsApiWord } from '../../../src/types/wordsapi';

describe('MSW Configuration Verification', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const setup = setupMSWTest();
    cleanup = setup.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  describe('OpenRouter API Mocking', () => {
    it('should intercept OpenRouter chat completions request', async () => {
      const requestBody: OpenRouterRequest = {
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Generate a B1 level adventure story of about 100 words.'
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: JSON.stringify(requestBody)
      });

      // Debug response if it's not OK
      if (!response.ok) {
        const errorText = await response.text();
        console.log('OpenRouter response error:', response.status, errorText);
      }

      expect(response.ok).toBe(true);
      
      const data = await response.json() as OpenRouterResponse;
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('object', 'chat.completion');
      expect(data).toHaveProperty('choices');
      expect(data.choices).toHaveLength(1);
      expect(data.choices[0]).toHaveProperty('message');
      expect(data.choices[0]?.message).toHaveProperty('content');
      expect(data.choices[0]?.message?.content).toBeTypeOf('string');
      expect(data.choices[0]?.message?.content?.length).toBeGreaterThan(0);
      expect(data).toHaveProperty('usage');
      expect(data.usage).toHaveProperty('total_tokens');

      // Verify the request was intercepted
      mswAssertions.expectApiWasCalled('openrouter');
    });

    it('should simulate rate limiting error', async () => {
      // Override with rate limit error
      mockOverrides.mockOpenRouterRateLimit();

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: 'Test' }]
        })
      });

      expect(response.status).toBe(429);
      
      const errorData = await response.json();
      expect(errorData).toHaveProperty('error');
      expect(errorData.error).toHaveProperty('code', 429);
      expect(errorData.error).toHaveProperty('type', 'rate_limit_exceeded');
    });

    it('should handle different story parameters', async () => {
      const requestBody: OpenRouterRequest = {
        model: 'openai/gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: 'Generate an A2 level mystery story of about 50 words.'
          }
        ]
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json() as OpenRouterResponse;
      
      expect(response.ok).toBe(true);
      expect(data.choices[0]?.message?.content).toBeTypeOf('string');
      expect(data.model).toBe('openai/gpt-4-turbo');
    });
  });

  describe('ElevenLabs API Mocking', () => {
    it('should intercept ElevenLabs text-to-speech request', async () => {
      const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
      const requestBody: ElevenLabsTTSRequest = {
        text: 'Hello, this is a test of the text-to-speech system.',
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      };

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'test-key'
        },
        body: JSON.stringify(requestBody)
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json() as ElevenLabsTTSResponse;
      expect(data).toHaveProperty('audio_url');
      expect(data).toHaveProperty('audio_duration_seconds');
      expect(data).toHaveProperty('characters_used');
      expect(data).toHaveProperty('voice_id', voiceId);
      expect(data.audio_url).toMatch(/^https:\/\/mock-/);
      expect(data.characters_used).toBe(requestBody.text.length);
      expect(data.audio_duration_seconds).toBeGreaterThan(0);

      // Verify the request was intercepted
      mswAssertions.expectApiWasCalled('elevenlabs');
    });

    it('should fetch available voices', async () => {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': 'test-key' }
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('voices');
      expect(Array.isArray(data.voices)).toBe(true);
      expect(data.voices.length).toBeGreaterThan(0);
      
      const firstVoice = data.voices[0];
      expect(firstVoice).toHaveProperty('voice_id');
      expect(firstVoice).toHaveProperty('name');
      expect(firstVoice).toHaveProperty('settings');
    });

    it('should simulate quota exceeded error', async () => {
      mockOverrides.mockElevenLabsQuotaExceeded();

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Test' })
      });

      expect(response.status).toBe(402);
      
      const errorData = await response.json();
      expect(errorData).toHaveProperty('detail');
      expect(errorData.detail).toHaveProperty('status', 'quota_exceeded');
    });

    it('should handle invalid voice ID', async () => {
      const invalidVoiceId = 'invalid-voice-id';
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${invalidVoiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Test' })
      });

      expect(response.status).toBe(404);
      
      const errorData = await response.json();
      expect(errorData).toHaveProperty('detail');
      expect(errorData.detail.message).toContain('not found');
    });
  });

  describe('WordsAPI Mocking', () => {
    it('should intercept WordsAPI word lookup request', async () => {
      const response = await fetch('https://wordsapiv1.p.rapidapi.com/words/adventure', {
        headers: {
          'X-RapidAPI-Key': 'test-key',
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });

      // Log response details for debugging
      if (!response.ok) {
        const errorText = await response.text();
        console.log('WordsAPI response error:', response.status, errorText);
      }

      expect(response.ok).toBe(true);
      
      const data = await response.json() as WordsApiWord;
      expect(data).toHaveProperty('word', 'adventure');
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results!.length).toBeGreaterThan(0);
      
      const firstResult = data.results![0];
      expect(firstResult).toHaveProperty('definition');
      expect(firstResult).toHaveProperty('partOfSpeech');
      expect(firstResult?.definition).toBeTypeOf('string');
      expect(firstResult?.partOfSpeech).toBeTypeOf('string');

      // Verify the request was intercepted
      mswAssertions.expectApiWasCalled('wordsapi');
    });

    it('should handle word not found', async () => {
      const response = await fetch('https://wordsapiv1.p.rapidapi.com/words/nonexistentword', {
        headers: {
          'X-RapidAPI-Key': 'test-key',
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });

      expect(response.status).toBe(404);
      
      const errorData = await response.json();
      expect(errorData).toHaveProperty('success', false);
      expect(errorData).toHaveProperty('message');
      expect(errorData.message).toContain('nonexistentword');
    });

    it('should fetch word definitions', async () => {
      const response = await fetch('https://wordsapiv1.p.rapidapi.com/words/beautiful/definitions', {
        headers: {
          'X-RapidAPI-Key': 'test-key',
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('word', 'beautiful');
      expect(data).toHaveProperty('definitions');
      expect(Array.isArray(data.definitions)).toBe(true);
      expect(data.definitions.length).toBeGreaterThan(0);
      
      const firstDefinition = data.definitions[0];
      expect(firstDefinition).toHaveProperty('definition');
      expect(firstDefinition).toHaveProperty('partOfSpeech');
    });

    it('should fetch word synonyms', async () => {
      const response = await fetch('https://wordsapiv1.p.rapidapi.com/words/beautiful/synonyms', {
        headers: {
          'X-RapidAPI-Key': 'test-key',
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('word', 'beautiful');
      expect(data).toHaveProperty('synonyms');
      expect(Array.isArray(data.synonyms)).toBe(true);
      expect(data.synonyms.length).toBeGreaterThan(0);
      expect(data.synonyms).toContain('lovely');
    });

    it('should handle pronunciation request', async () => {
      const response = await fetch('https://wordsapiv1.p.rapidapi.com/words/understand/pronunciation', {
        headers: {
          'X-RapidAPI-Key': 'test-key',
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('word', 'understand');
      expect(data).toHaveProperty('pronunciation');
      expect(data.pronunciation).toHaveProperty('all');
      expect(data.pronunciation.all).toBeTypeOf('string');
    });
  });

  describe('MSW Utilities', () => {
    it('should track API calls correctly', async () => {
      // Clear any previous logs
      mswTestUtils.clearLogs();

      // Make requests to different APIs
      await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: 'test',
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      await fetch('https://api.elevenlabs.io/v1/voices');
      await fetch('https://wordsapiv1.p.rapidapi.com/words/test');

      // Check tracking
      expect(mswTestUtils.wasApiCalled('openrouter')).toBe(true);
      expect(mswTestUtils.wasApiCalled('elevenlabs')).toBe(true);
      expect(mswTestUtils.wasApiCalled('wordsapi')).toBe(true);

      expect(mswTestUtils.getApiCallCount('openrouter')).toBe(1);
      expect(mswTestUtils.getApiCallCount('elevenlabs')).toBe(1);
      expect(mswTestUtils.getApiCallCount('wordsapi')).toBe(1);

      // Check request logs
      const requests = mswTestUtils.getRequests();
      expect(requests).toHaveLength(3);
    });

    it('should wait for specific requests', async () => {
      // Start a delayed request
      const requestPromise = fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: 'test',
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      // Wait for the request to be intercepted
      const interceptedRequest = await mswTestUtils.waitForRequest('openrouter.ai', 3000);
      
      expect(interceptedRequest).not.toBeNull();
      expect(interceptedRequest!.url).toContain('openrouter.ai');
      expect(interceptedRequest!.method).toBe('POST');

      await requestPromise;
    });

    it('should handle request patterns', async () => {
      await fetch('https://wordsapiv1.p.rapidapi.com/words/adventure/definitions');
      await fetch('https://wordsapiv1.p.rapidapi.com/words/mystery/synonyms');

      const wordsApiRequests = mswTestUtils.getRequestsByPattern(/wordsapiv1/);
      expect(wordsApiRequests).toHaveLength(2);

      const definitionRequests = mswTestUtils.getRequestsByPattern(/definitions/);
      expect(definitionRequests).toHaveLength(1);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network failures', async () => {
      mockOverrides.mockNetworkFailure('openrouter');

      try {
        await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          body: JSON.stringify({ model: 'test', messages: [] })
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Network error should be thrown
        expect(error).toBeDefined();
      }
    });

    it('should simulate slow responses', async () => {
      mockOverrides.mockSlowResponse('elevenlabs', 300); // Reduced delay for faster test

      const startTime = Date.now();
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // The delay should be at least close to what we set, accounting for execution overhead
      expect(duration).toBeGreaterThan(250); 
      expect(response.ok).toBe(true);
    });
  });
});