import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// A function config because `build` runs twice: once for the browser bundle and once for the SSR
// bundle `scripts/prerender.ts` imports (`vite build --ssr src/entry-server.tsx`). The second one
// renders to strings and serves nobody, so copying half a megabyte of markdown next to it is pure
// waste — the prerender reads that content out of `dist/`, where the browser gets it too.
export default defineConfig(({ isSsrBuild }) => ({
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
    ...(isSsrBuild
      ? []
      : [
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
        ]),
  ],
}));
