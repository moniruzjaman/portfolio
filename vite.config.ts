import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// The repo is `moniruzjaman/portfolio`, a project site, so the deploy root is
// `/portfolio/`. Override with BASE_PATH (e.g. "/" for a user site or custom
// domain). The router, 404.html shim, sitemap and canonical URL all derive from it.
const BASE = process.env.BASE_PATH || "/portfolio/";
// Absolute public URL (canonical, og:image, JSON-LD). Keep defaults identical to
// scripts/gen-static.mjs; override both with SITE_ORIGIN / BASE_PATH.
const SITE_URL = `${process.env.SITE_ORIGIN || "https://moniruzjaman.github.io"}${BASE}`;

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    // index.html carries __SITE_URL__ so canonical/OG URLs match the real deployment.
    { name: "site-url", transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", SITE_URL) },
  ],
  server: {
    allowedHosts: [".monkeycode-ai.live"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the shell small. Repo READMEs and note bodies are large and must not
        // land in the entry chunk or the first paint suffers on a 3G connection.
        manualChunks(id) {
          if (id.includes("/src/content/")) return "content";
          if (id.includes("/src/data/")) return "data";
        },
      },
    },
  },
});
