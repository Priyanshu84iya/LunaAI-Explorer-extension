import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        content: r('src/content/contentScript.ts'),
        background: r('src/background/serviceWorker.ts'),
        popup: r('src/popup/index.html'),
        options: r('src/options/index.html'),
        explorer: r('src/explorer/index.html'),
      },
      output: {
        entryFileNames: (chunk) => {
          const name = chunk.name;
          if (name === 'content' || name === 'background') {
            return `${name}.js`;
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].css',
      },
    },
  },
});
