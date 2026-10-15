import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// The repo is `moniruzjaman/portfolio`, a project site, so the deploy root is
// `/portfolio/`. Change BASE and the 404.html shim in `public/` together — they
// must agree or every deep link breaks. Override with BASE_PATH for other hosts.
const BASE = process.env.BASE_PATH || "/portfolio/";

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss()],
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
