import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import deepmerge from 'deepmerge';
import type { UserConfig } from 'vite';

export const getContentScriptEntries = (matchesDir: string) => {
  const entryPoints: Record<string, string> = {};
  const entries = readdirSync(matchesDir);

  entries.forEach((folder: string) => {
    const filePath = resolve(matchesDir, folder);
    const isFolder = statSync(filePath).isDirectory();
    const haveIndexTsFile = readdirSync(filePath).includes('index.ts');
    const haveIndexTsxFile = readdirSync(filePath).includes('index.tsx');

    if (isFolder && !(haveIndexTsFile || haveIndexTsxFile)) {
      throw new Error(`${folder} in \`matches\` doesn't have index.ts or index.tsx file`);
    } else {
      entryPoints[folder] = resolve(filePath, haveIndexTsFile ? 'index.ts' : 'index.tsx');
    }
  });

  return entryPoints;
};

export const withPageConfig = (config: UserConfig) =>
  defineConfig(
    deepmerge(
      {
        plugins: [react(), nodePolyfills()],
        build: {
          sourcemap: process.env.NODE_ENV === 'development',
          minify: process.env.NODE_ENV === 'production',
          reportCompressedSize: process.env.NODE_ENV === 'production',
          emptyOutDir: false,
          rollupOptions: {
            external: ['chrome'],
          },
        },
      },
      config,
    ),
  );