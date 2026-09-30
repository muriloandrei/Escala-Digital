import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: '/nova/',
  plugins: [react()],
  build: {
    outDir: '../dist/react',
    emptyOutDir: true,
  },
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
});
