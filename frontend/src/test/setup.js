import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

import { vi } from 'vitest';

vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        get: vi.fn(() => Promise.reject(new Error('Network request forbidden in tests'))),
        post: vi.fn(() => Promise.reject(new Error('Network request forbidden in tests'))),
        put: vi.fn(() => Promise.reject(new Error('Network request forbidden in tests'))),
        delete: vi.fn(() => Promise.reject(new Error('Network request forbidden in tests'))),
        patch: vi.fn(() => Promise.reject(new Error('Network request forbidden in tests'))),
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
      }),
    },
  };
});

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
    subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
    publish: vi.fn(),
  })),
}));

vi.mock('sockjs-client', () => ({
  default: vi.fn(),
}));

import { server } from './mockServer.js';
import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
