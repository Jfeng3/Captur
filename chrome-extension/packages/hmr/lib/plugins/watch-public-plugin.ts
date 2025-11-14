import { resolve } from 'node:path';
import { Dirent, readdirSync, statSync } from 'node:fs';
import type { PluginOption } from 'vite';

export const watchPublicPlugin = (): PluginOption => {
  return {
    name: 'watch-public',
    async buildStart() {
      const publicDir = resolve(process.cwd(), 'public');
      const allFiles: string[] = [];

      const readDirRecursive = (dirPath: string): void => {
        let files: Dirent[];
        try {
          files = readdirSync(dirPath, { withFileTypes: true });
        } catch {
          return;
        }

        for (const file of files) {
          const filePath = resolve(dirPath, file.name);
          if (file.isDirectory()) {
            readDirRecursive(filePath);
          } else {
            allFiles.push(filePath);
          }
        }
      };

      readDirRecursive(publicDir);

      for (const file of allFiles) {
        try {
          const stats = statSync(file);
          if (stats.isFile()) {
            this.addWatchFile(file);
          }
        } catch {
          // ignore errors
        }
      }
    },
  };
};