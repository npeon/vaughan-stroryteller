// MSW Handlers Index
// This file exports all API handlers for mocking external services

import { openRouterHandlers } from './openrouter';
import { elevenLabsHandlers } from './elevenlabs';

// Combine all handlers into a single array
export const handlers = [
  ...openRouterHandlers,
  ...elevenLabsHandlers,
];

// Export individual handler groups for selective use in tests
export {
  openRouterHandlers,
  elevenLabsHandlers,
};

// Handler utilities for testing
export const handlerUtils = {
  /**
   * Get handlers for a specific service
   */
  getHandlersFor(service: 'openrouter' | 'elevenlabs') {
    switch (service) {
      case 'openrouter':
        return openRouterHandlers;
      case 'elevenlabs':
        return elevenLabsHandlers;
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
    };
  },
};