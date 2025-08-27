// MSW Server setup for Node.js/Vitest testing environment
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the mock server with all handlers
export const server = setupServer(...handlers);

// Server utilities for testing
export const serverUtils = {
  /**
   * Start the server with default configuration
   */
  start() {
    server.listen({
      onUnhandledRequest: 'error',
    });
  },

  /**
   * Stop the server
   */
  stop() {
    server.close();
  },

  /**
   * Reset all handlers to their initial state
   */
  reset() {
    server.resetHandlers();
  },

  /**
   * Add additional handlers at runtime
   */
  use(...newHandlers: Parameters<typeof server.use>) {
    server.use(...newHandlers);
  },

  /**
   * Override specific handlers for a test
   */
  override(...overrideHandlers: Parameters<typeof server.use>) {
    server.use(...overrideHandlers);
  },

  /**
   * Get server instance for advanced operations
   */
  getInstance() {
    return server;
  }
};

// Export the server instance as default
export default server;