/**
 * prerender.mjs — writes real HTML for every route into dist/<route>/index.html.
 *
 * Before this, crawlers and social scrapers saw the home page for every URL and
 * deep links answered HTTP 404 (the 404.html shim). Now every routable page —
 * static pages, every /works/:slug, every /notes/:slug — is a real file with
 * its own title, description, canonical, OG tags and JSON-LD, all derived from
 * src/lib/seo.ts (the same source useDocumentMeta applies on client navigation).
 *
 * Runs after `vite build` (see the build script); hydrates via src/main.tsx.
 * The 404.html shim stays as the fallback for unknown paths.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createServer } from "vite";

const BASE = process.env.BASE_PATH || "/portfolio/";
const ORIGIN = (process.env.SITE_ORIGIN || "https://moniruzjaman.github.io").replace(/\/$/, "");
const SITE = `${ORIGIN}${BASE}`;

process.env.BASE_PATH = BASE;

const vite = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
  define: {
    // seo.ts reads the deployment origin through import.meta.env so the app
    // bundle and the prerenderer cannot disagree; deploy.yml sets SITE_ORIGIN.
    "import.meta.env.VITE_SITE_ORIGIN": JSON.stringify(ORIGIN),
  },
});

const { renderAt } = await vite.ssrLoadModule("/src/test/ssr-probe.tsx");
const { routePaths, routeMeta, canonicalFor } = await vite.ssrLoadModule("/src/lib/seo.ts");

const template = readFileSync("dist/index.html", "utf8");

// The shell's own title/description/canonical/og values are home-page defaults
// and the Person JSON-LD lived in index.html — all of that is replaced by the
// per-route values. og:image / og:site_name / twitter:card / fonts / icons stay.
const stripShellMeta = (html) =>
  html
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, "")
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/i, "")
    .replace(/<link\s+rel="canonical"[^>]*>/i, "")
    .replace(/<meta\s+property="og:(?:title|description|url|type)"[^>]*>/g, "");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const jsonld = (o) =>
  `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;

const shell = stripShellMeta(template).replace(
  '<div id="root"></div>',
  '<div id="root">__PRERENDERED__</div>',
);
if (!shell.includes("__PRERENDERED__")) {
  console.error('prerender: could not find <div id="root"></div> in dist/index.html');
  process.exit(1);
}

// Cross-check against the sitemap gen-static wrote: the two generated views of
// "what is routable" must agree, or one of them is lying.
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const sitemapPaths = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].slice(SITE.length - 1)),
);
const routeSet = new Set(routePaths.map((p) => (p === "/" ? "" : p)));
const onlySitemap = [...sitemapPaths].filter((p) => p !== "/" && !routeSet.has(p));
const onlyRoutes = [...routeSet].filter((p) => p !== "" && !sitemapPaths.has(p));
if (onlySitemap.length || onlyRoutes.length) {
  console.error("prerender: sitemap and route list disagree", { onlySitemap, onlyRoutes });
  process.exit(1);
}

let failed = 0;
const titles = new Map();
for (const path of routePaths) {
  const m = routeMeta(path);
  const markup = renderAt(`${BASE}${path.replace(/^\//, "")}`);
  const text = markup.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&");
  const canonical = canonicalFor(path);

  if (markup.length < 500) {
    console.error(`✖ ${path || "/"} — suspiciously short render (${markup.length} chars)`);
    failed++;
  }
  if (text.includes("This page does not exist")) {
    console.error(`✖ ${path || "/"} — rendered Not Found for a real route`);
    failed++;
  }
  if (titles.has(m.title)) {
    console.error(`✖ duplicate title "${m.title}" at ${path} and ${titles.get(m.title)}`);
    failed++;
  }
  titles.set(m.title, path);

  const html = shell
    .replace("__PRERENDERED__", markup)
    .replace(
      "</head>",
      [
        `    <title>${esc(m.title)}</title>`,
        `    <meta name="description" content="${esc(m.description)}" />`,
        `    <link rel="canonical" href="${esc(canonical)}" />`,
        `    <meta property="og:title" content="${esc(m.title)}" />`,
        `    <meta property="og:description" content="${esc(m.description)}" />`,
        `    <meta property="og:url" content="${esc(canonical)}" />`,
        `    <meta property="og:type" content="${m.ogType}" />`,
        ...m.jsonLd.map(jsonld),
        "  </head>",
      ].join("\n"),
    );

  const file = path === "" ? "dist/index.html" : `dist${path}/index.html`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`✔ ${path || "/"}`);
}
await vite.close();

if (failed) {
  console.error(`\n✖ prerender failed ${failed} check(s)`);
  process.exit(1);
}

// Every prerendered file must resolve its canonical to its own path.
let canonicalFails = 0;
const files = readdirSync("dist", { recursive: true }).filter(
  (f) => f.endsWith("index.html") && f !== "404.html",
);
for (const f of files) {
  const html = readFileSync(`dist/${f}`, "utf8");
  const match = html.match(/<link rel="canonical" href="([^"]+)"/);
  // "index.html" -> SITE (ends in "/"); "works/x/index.html" -> SITE + "works/x"
  const expect = `${ORIGIN}${BASE}${f.replace(/index\.html$/, "").replace(/\/$/, "")}`;
  if (!match || match[1] !== expect) {
    console.error(`✖ ${f}: canonical ${match?.[1]} != ${expect}`);
    canonicalFails++;
  }
}
if (canonicalFails) {
  console.error(`✖ canonical mismatch on ${canonicalFails} file(s)`);
  process.exit(1);
}

console.log(
  `\n✔ prerendered ${routePaths.length} routes · ${titles.size} unique titles · canonicals + sitemap agree`,
);
