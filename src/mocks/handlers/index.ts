// MSW Handlers Index
// This file exports all API handlers for mocking external services

import { openRouterHandlers } from './openrouter';
import { elevenLabsHandlers } from './elevenlabs';
import { wordsApiHandlers } from './wordsapi';

// Combine all handlers into a single array
export const handlers = [
  ...openRouterHandlers,
  ...elevenLabsHandlers,
  ...wordsApiHandlers,
];

// Export individual handler groups for selective use in tests
export {
  openRouterHandlers,
  elevenLabsHandlers,
  wordsApiHandlers,
};

// Handler utilities for testing
export const handlerUtils = {
  /**
   * Get handlers for a specific service
   */
  getHandlersFor(service: 'openrouter' | 'elevenlabs' | 'wordsapi') {
    switch (service) {
      case 'openrouter':
        return openRouterHandlers;
      case 'elevenlabs':
        return elevenLabsHandlers;
      case 'wordsapi':
        return wordsApiHandlers;
      default:
        return [];
    }
  },

  /**
   * Get all handler URLs for debugging
   */
  getAllHandlerUrls() {
    return {
      openrouter: [
        'https://openrouter.ai/api/v1/chat/completions',
        'https://openrouter.ai/api/v1/completions',
      ],
      elevenlabs: [
        'https://api.elevenlabs.io/v1/voices',
        'https://api.elevenlabs.io/v1/voices/:voiceId',
        'https://api.elevenlabs.io/v1/text-to-speech/:voiceId',
        'https://api.elevenlabs.io/v1/text-to-speech/:voiceId/stream',
        'https://api.elevenlabs.io/v1/user',
        'https://api.elevenlabs.io/v1/models',
      ],
      wordsapi: [
        'https://wordsapiv1.p.rapidapi.com/words/:word',
        'https://wordsapiv1.p.rapidapi.com/words/:word/definitions',
        'https://wordsapiv1.p.rapidapi.com/words/:word/pronunciation',
        'https://wordsapiv1.p.rapidapi.com/words/:word/synonyms',
        'https://wordsapiv1.p.rapidapi.com/words/:word/antonyms',
        'https://wordsapiv1.p.rapidapi.com/words/:word/examples',
        'https://wordsapiv1.p.rapidapi.com/words/:word/frequency',
        'https://wordsapiv1.p.rapidapi.com/words/',
      ],
    };
  },
};