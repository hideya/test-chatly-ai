/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/client/src',
      '@db': '/db'
    },
  },
  test: {
    globals: true,
    environment: process.env.TEST_ENV === 'server' ? 'node' : 'jsdom',
    setupFiles: process.env.TEST_ENV === 'server' 
      ? ['./server/test/setup.ts']
      : ['./client/src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
