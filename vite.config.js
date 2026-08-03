import { defineConfig } from "vite";

export default defineConfig({
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.webp"],
  build: {
    assetsInlineLimit: 0, // Never inline assets as base64 — always emit as files
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api.iongeyser.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1.0"),
      },
    },
  },
});
