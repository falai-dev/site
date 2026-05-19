import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  server: {
    open: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: true,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["falai.dev"],
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@falai/agent/docs",
          dest: "content",
        },
        {
          src: "node_modules/@falai/agent/examples",
          dest: "content",
        },
        {
          src: "node_modules/@falai/agent/README.md",
          dest: "content",
        },
      ],
    }),
  ],
});
