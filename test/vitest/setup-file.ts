// This file will be run before each test file

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../../src/mocks/node';

// Setup MSW server for API mocking
beforeAll(() => {
  // Start the mock server before all tests
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  // Reset handlers after each test to ensure test isolation
  server.resetHandlers();
});

afterAll(() => {
  // Stop the mock server after all tests are done
  server.close();
});

// Add global fetch polyfill for Node.js environment if needed
// This ensures MSW can intercept fetch requests in tests
if (!globalThis.fetch) {
  const { fetch, Request, Response, Headers } = require('undici');
  Object.assign(globalThis, { fetch, Request, Response, Headers });
}
