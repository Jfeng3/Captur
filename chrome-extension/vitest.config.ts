import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/build.mts'
      ]
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
