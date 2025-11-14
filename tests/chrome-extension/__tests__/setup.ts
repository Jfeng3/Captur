/**
 * Test setup file for Vitest
 * Configures global mocks and test utilities
 */

import { vi } from 'vitest';

// Mock Chrome API
(globalThis as any).chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://fake-id/${path}`),
  },
  storage: {
    sync: {
      get: vi.fn((_keys: any, callback?: (items: any) => void) => {
        // Default mock: return empty object
        callback?.({});
      }),
      set: vi.fn((_items: any, callback?: () => void) => {
        callback?.();
      }),
    },
    local: {
      get: vi.fn((_keys: any, callback?: (items: any) => void) => {
        callback?.({});
      }),
      set: vi.fn((_items: any, callback?: () => void) => {
        callback?.();
      }),
    },
  },
} as any;

// Mock window.scrollX and window.scrollY
Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

// Mock requestAnimationFrame
(globalThis as any).requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  callback(0);
  return 0;
});
