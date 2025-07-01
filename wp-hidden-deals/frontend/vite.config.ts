import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: path.resolve(__dirname, '../build'),
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: 'static/js/main.js',
                assetFileNames: 'static/[ext]/[name].[ext]'
            }
        }
    }
});