import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'N8nChatWidget',
      fileName: (format) => {
        if (format === 'es') return 'widget.es.js';
        if (format === 'cjs') return 'widget.cjs.js';
        return 'widget.bundle.js';
      },
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name || '';
        },
      },
    },
  },
});
