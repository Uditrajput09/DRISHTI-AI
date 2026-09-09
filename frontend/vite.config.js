import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
        configure: (proxy) => {
          proxy.on('error', (err) => {
            // Silently ignore benign socket aborts caused by tab refresh / navigation
            if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET') {
              return;
            }
            console.warn('[vite ws proxy]', err.message);
          });
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-maps': ['leaflet', 'react-leaflet', 'leaflet.heat'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable']
        }
      }
    }
  }
});
