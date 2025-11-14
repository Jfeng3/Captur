import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, cpSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(process.env.BUILD_TIMESTAMP || new Date().toISOString()),
  },
  plugins: [
    react(),
    nodePolyfills(),
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest
        copyFileSync('manifest.json', 'dist/manifest.json');

        // Copy Vite-built popup.html to root of dist
        if (existsSync('dist/public/popup.html')) {
          copyFileSync('dist/public/popup.html', 'dist/popup.html');
        }

        // Copy public assets except popup.html
        const publicFiles = readdirSync('public');
        publicFiles.forEach((file) => {
          if (file !== 'popup.html') {
            const srcPath = join('public', file);
            const destPath = join('dist', file);
            if (statSync(srcPath).isFile()) {
              copyFileSync(srcPath, destPath);
            } else {
              cpSync(srcPath, destPath, { recursive: true });
            }
          }
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'public/popup.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: (chunkInfo) => {
          // Replace leading underscore with 'vendor-' prefix
          const name = chunkInfo.name.replace(/^_/, 'vendor-');
          return `${name}.js`;
        },
        assetFileNames: '[name].[ext]',
      },
      external: ['chrome'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});