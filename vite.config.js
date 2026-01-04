import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://api.chothuetatca.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
