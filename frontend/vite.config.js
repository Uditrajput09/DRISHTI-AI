import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { reticle } from '@reticlehq/vite-plugin';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reticle(),react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
