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
    build: {
        minify: 'esbuild',
        sourcemap: true,
    },
    optimizeDeps: {
        include: ['pdfjs-dist']
    },
    server: {
        hmr: {
            timeout: 5000,
            overlay: true,
            clientPort: 5173,
            // host: true, // This line is removed
        }
    }
});
