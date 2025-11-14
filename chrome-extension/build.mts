import { resolve } from 'node:path';
import { build } from 'vite';
import { withPageConfig } from './lib/utils.js';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');

// Build the content script
const contentConfig = withPageConfig({
  mode: process.env.NODE_ENV === 'development' ? 'development' : undefined,
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  build: {
    lib: {
      name: 'content',
      formats: ['iife'],
      entry: resolve(srcDir, 'content', 'matches', 'all', 'index.ts'),
      fileName: () => 'content.js',
    },
    outDir: resolve(rootDir, 'dist'),
  },
});

// @ts-expect-error This is hidden property into vite's resolveConfig()
contentConfig.configFile = false;

await build(contentConfig);