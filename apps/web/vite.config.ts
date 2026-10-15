import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // The shared package is compiled to CommonJS for the server; the web reads its TypeScript source so named imports work.
      '@el7al/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'socket.io-client'],
  },
});
