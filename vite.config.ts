import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: './',
    root: path.join(__dirname, 'src/renderer'),
    build: {
        outDir: path.join(__dirname, 'dist/renderer'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.join(__dirname, 'src/renderer/index.html'),
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@/components': path.resolve(__dirname, 'src/renderer/components'),
            '@/pages': path.resolve(__dirname, 'src/renderer/pages'),
            '@/hooks': path.resolve(__dirname, 'src/renderer/hooks'),
            '@/utils': path.resolve(__dirname, 'src/renderer/utils'),
            '@/styles': path.resolve(__dirname, 'src/renderer/styles'),
            '@/shared': path.resolve(__dirname, 'src/shared'),
            '@/assets': path.resolve(__dirname, 'src/assets'),
        },
    },
    server: {
        port: 3000,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
}); 