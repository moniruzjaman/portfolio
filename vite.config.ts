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

// Content-Security-Policy as defence in depth (GitHub Pages cannot set headers).
// Deliberately minimal: no runtime network calls exist; images may come from any
// https host because app icons/brand images point at the apps' own domains; the
// Drive library preview is the only embedded frame. Dev is exempt — HMR needs
// the inline eval this policy forbids.
const CSP =
  "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; " +
  "img-src 'self' data: https:; font-src 'self'; connect-src 'self'; " +
  "frame-src https://drive.google.com https://docs.google.com; " +
  "object-src 'none'; base-uri 'self'; form-action 'none'";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    // index.html carries __SITE_URL__ so canonical/OG URLs match the real deployment.
    {
      name: "site-url",
      transformIndexHtml: {
        handler(html, ctx) {
          const withUrl = html.replaceAll("__SITE_URL__", SITE_URL);
          if (ctx.server) return withUrl;
          return withUrl.replace(
            "</head>",
            `    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n  </head>`,
          );
        },
      },
    },
  ],
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
