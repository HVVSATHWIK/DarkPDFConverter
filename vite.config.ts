import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      timeout: 30000, // milliseconds
      host: 'localhost',
      protocol: 'ws'
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.min.js']
  },
  build: {
    minify: 'esbuild',
    sourcemap: true,
  },
});