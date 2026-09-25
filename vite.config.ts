import { resolve } from "node:path";
import { defineConfig } from "vite";

// Multi-page static app: the editor shell, the popup fullscreen viewer, and the
// query-string-driven embeddable renderer all ship as separate HTML entry points.
export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        fullscreen: resolve(__dirname, "fullscreen.html"),
        render: resolve(__dirname, "render.html")
      }
    }
  },
  server: {
    port: 5173
  }
});
