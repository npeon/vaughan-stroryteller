// This file will be run before each test file

import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { server } from '../../src/mocks/node';

// Install Quasar plugin globally for all tests with minimal configuration
// This approach avoids the complex DOM mocking issues
installQuasarPlugin();

// Mock browser APIs that don't exist in test environment
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage,
  writable: true,
});

// Mock ResizeObserver with proper implementation
window.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Ensure ResizeObserver is available globally
global.ResizeObserver = window.ResizeObserver;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLElement.prototype.scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

// Setup MSW server for API mocking
beforeAll(() => {
  // Start the mock server before all tests
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  // Reset handlers after each test to ensure test isolation
  server.resetHandlers();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset localStorage mock
  mockStorage.clear.mockClear();
  mockStorage.getItem.mockClear();
  mockStorage.setItem.mockClear();
  mockStorage.removeItem.mockClear();
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