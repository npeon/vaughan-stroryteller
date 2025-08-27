// MSW Browser setup for Cypress E2E testing and development
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the service worker with all handlers
export const worker = setupWorker(...handlers);

// Worker utilities for browser/Cypress testing
export const workerUtils = {
  /**
   * Start the service worker
   */
  async start() {
    if (typeof window !== 'undefined') {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
    }
  },

  /**
   * Stop the service worker
   */
  stop() {
    if (typeof window !== 'undefined') {
      return worker.stop();
    }
  },

  /**
   * Reset all handlers to their initial state
   */
  reset() {
    worker.resetHandlers();
  },

  /**
   * Add additional handlers at runtime
   */
  use(...newHandlers: Parameters<typeof worker.use>) {
    worker.use(...newHandlers);
  },

  /**
   * Override specific handlers for a test
   */
  override(...overrideHandlers: Parameters<typeof worker.use>) {
    worker.use(...overrideHandlers);
  },

  /**
   * Get worker instance for advanced operations
   */
  getInstance() {
    return worker;
  },

  /**
   * Check if worker is active
   */
  isActive() {
    return worker.listHandlers().length > 0;
  }
};

// Development-only: Start worker automatically if in development mode
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only start in development if explicitly enabled
  const enableMSW = localStorage.getItem('enableMSW') === 'true';
  if (enableMSW) {
    void workerUtils.start().then(() => {
      console.log('🔶 MSW enabled for development');
    });
  }
}

// Export the worker instance as default
export default worker;