import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5188,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://api.iconsuniverse.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5188,
    strictPort: false,
  },
});
