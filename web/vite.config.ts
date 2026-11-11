import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev mode: proxy /api to the lume-core backend (bin/lume-core server.lume · :18793).
// Production: web/dist is served statically by the lume-core server docroot (same-origin · no CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:18793',
        changeOrigin: true,
      },
    },
  },
});
