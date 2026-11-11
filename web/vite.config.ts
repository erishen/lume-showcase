import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 开发模式：/api 代理到 lume-core 后端（bin/lume-core server.lume·:18793）。
// 生产：web/dist 由 lume-core server docroot 静态服务（同源·无 CORS）。
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
