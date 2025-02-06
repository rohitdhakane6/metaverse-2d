import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@repo/design-system': path.resolve(__dirname, '../../packages/design-system')
    }
  }
});