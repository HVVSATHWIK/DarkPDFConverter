/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import path module
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
        reporters: ['verbose'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/main.tsx',
                'src/vite-env.d.ts',
                'src/pdfjs.d.ts',
                'src/types.ts', // Or any other type definition files
                'src/AppRoutes.tsx', // Usually not much logic to test here directly
                'src/components/auth/**', // Auth components might be tested differently or mocked
                'src/contexts/AuthContext.tsx', // Contexts might require specific test setups
                'src/test/setup.ts',
                'src/**/__tests__/**', // Exclude test files themselves
                'src/**/*.test.{ts,tsx}', // Exclude test files themselves
                'src/components/CarouselScene.tsx', // Excluding complex three.js components for now
                'src/components/MiniCarousel.tsx', // Excluding complex three.js components for now
                'src/components/layout/MainApplication.tsx' // Excluding complex three.js components for now
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
