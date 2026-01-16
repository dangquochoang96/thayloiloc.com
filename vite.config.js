import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://mobile.chothuetatca.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
