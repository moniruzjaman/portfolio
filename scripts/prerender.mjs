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
const { routePaths, routeMeta, canonicalFor, canonicalForLang, ogImageFor } =
  await vite.ssrLoadModule("/src/lib/seo.ts");
const { renderOgCard } = await import("./lib/og-card.mjs");

const template = readFileSync("dist/index.html", "utf8");

// The shell's own title/description/canonical/og values are home-page defaults
// and the Person JSON-LD lived in index.html — all of that is replaced by the
// per-route values (each route gets its own generated og:image card).
// og:site_name / twitter:card / fonts / icons stay.
const stripShellMeta = (html) =>
  html
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, "")
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/i, "")
    .replace(/<link\s+rel="canonical"[^>]*>/i, "")
    .replace(/<meta\s+property="og:(?:title|description|url|type|image)"[^>]*>/g, "");

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
// "what is routable" must agree, in BOTH languages, or one of them is lying.
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const sitemapPaths = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].slice(SITE.length - 1)),
);
const routeSet = new Set(
  routePaths.flatMap((p) => {
    const clean = p === "/" ? "" : p;
    return [clean, clean === "" ? "/bn" : `/bn${clean}`];
  }),
);
const onlySitemap = [...sitemapPaths].filter((p) => p !== "/" && !routeSet.has(p));
const onlyRoutes = [...routeSet].filter((p) => p !== "" && !sitemapPaths.has(p));
if (onlySitemap.length || onlyRoutes.length) {
  console.error("prerender: sitemap and route list disagree", { onlySitemap, onlyRoutes });
  process.exit(1);
}

let failed = 0;
let pagesWritten = 0;
// Titles are keyed per language: the uniqueness contract is "distinguishable
// within one language's URL set" — a bn page falling back to its en title when
// the content has no Bangla title is legitimate, not a duplicate.
const titles = new Map();
for (const pass of [
  { lang: "en", dir: "", htmlLang: "en" },
  { lang: "bn", dir: "bn/", htmlLang: "bn" },
]) {
for (const path of routePaths) {
  const cleanPath = path === "" ? "/" : path;
  const m = routeMeta(path, pass.lang);
  // A routable path that resolves to the 404 fallback meta is exactly the bug
  // this script once shipped live: the page body rendered Home while every
  // crawler got "Page not found" for the site's root URL.
  if (m.title === "Page not found — Abu Md. Moniruzjaman") {
    console.error(`✖ ${pass.lang} ${path || "/"} — routable path resolved to the 404 meta`);
    failed++;
  }
  const raw = renderAt(`${BASE}${pass.dir}${path.replace(/^\//, "")}`);
  // React 19 hoists <link rel="preload"> for srcset images to the top of the
  // renderToString output. They belong in <head> — left inside the root div
  // they would break hydration (the client tree has them in the head).
  const hoisted = [...new Set([...raw.matchAll(/<link rel="preload"[^>]*>/g)].map((x) => x[0]))];
  const markup = raw.replace(/<link rel="preload"[^>]*>/g, "");
  const text = markup.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&");
  const canonical = canonicalForLang(pass.lang, cleanPath);

  if (markup.length < 500) {
    console.error(`✖ ${pass.lang} ${path || "/"} — suspiciously short render (${markup.length} chars)`);
    failed++;
  }
  if (text.includes("This page does not exist") || text.includes("এই পাতাটি নেই")) {
    // NotFound renders bilingually — both spellings mean a real route failed
    // to match. This check exists because that exact bug shipped once (en).
    console.error(`✖ ${pass.lang} ${path || "/"} — rendered Not Found for a real route`);
    failed++;
  }
  const titleKey = `${pass.lang}:${m.title}`;
  if (titles.has(titleKey)) {
    console.error(
      `✖ duplicate title "${m.title}" at ${pass.lang} ${path || "/"} and ${titles.get(titleKey)}`,
    );
    failed++;
  }
  titles.set(titleKey, `${pass.lang} ${path || "/"}`);

  // Open Graph card: generated per route (brief 2.3), referenced as og:image.
  // Rendered once in the en pass — the bn page reuses the same bilingual card.
  const ogRel = ogImageFor(path);
  if (pass.lang === "en") {
    const ogFile = `dist/${ogRel}`;
    try {
      const png = await renderOgCard({
        title: m.ogTitle || m.title,
        bnTitle: m.bnTitle,
        description: m.description,
        site: SITE.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      });
      mkdirSync(dirname(ogFile), { recursive: true });
      writeFileSync(ogFile, png);
    } catch (e) {
      console.error(`✖ ${path || "/"} — OG card failed: ${e.message}`);
      failed++;
    }
  }

  const ogAbs = `${SITE}${ogRel}`;
  // ogTitle already leads with the name on identity pages — only append the
  // name when the title doesn't carry it, or the alt reads it twice.
  const altBase = m.ogTitle || m.title;
  const ogAlt = altBase.startsWith("Abu Md. Moniruzjaman")
    ? altBase
    : `${altBase} — Abu Md. Moniruzjaman`;
  // bn pages announce themselves before React boots.
  const langShell =
    pass.lang === "bn" ? shell.replace('<html lang="en">', '<html lang="bn">') : shell;
  if (pass.lang === "bn" && !langShell.includes('<html lang="bn">')) {
    console.error("prerender: could not set html[lang=bn] on the shell");
    process.exit(1);
  }
  const alternates = [
    `    <link rel="alternate" hreflang="en" href="${esc(canonicalForLang("en", cleanPath))}" />`,
    `    <link rel="alternate" hreflang="bn" href="${esc(canonicalForLang("bn", cleanPath))}" />`,
    `    <link rel="alternate" hreflang="x-default" href="${esc(canonicalForLang("en", cleanPath))}" />`,
  ];
  const html = langShell
    .replace("__PRERENDERED__", markup)
    .replace(
      "</head>",
      [
        `    <title>${esc(m.title)}</title>`,
        `    <meta name="description" content="${esc(m.description)}" />`,
        `    <link rel="canonical" href="${esc(canonical)}" />`,
        ...alternates,
        `    <meta property="og:title" content="${esc(m.title)}" />`,
        `    <meta property="og:description" content="${esc(m.description)}" />`,
        `    <meta property="og:url" content="${esc(canonical)}" />`,
        `    <meta property="og:type" content="${m.ogType}" />`,
        `    <meta property="og:image" content="${esc(ogAbs)}" />`,
        `    <meta property="og:image:width" content="1200" />`,
        `    <meta property="og:image:height" content="630" />`,
        `    <meta property="og:image:alt" content="${esc(ogAlt)}" />`,
        `    <meta name="twitter:title" content="${esc(m.title)}" />`,
        `    <meta name="twitter:description" content="${esc(m.description)}" />`,
        `    <meta name="twitter:image" content="${esc(ogAbs)}" />`,
        `    <meta name="twitter:image:alt" content="${esc(ogAlt)}" />`,
        ...hoisted,
        ...m.jsonLd.map(jsonld),
        "  </head>",
      ].join("\n"),
    );

  const file =
    path === "" ? `dist/${pass.dir}index.html` : `dist/${pass.dir}${path}/index.html`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  pagesWritten++;
  console.log(`✔ ${pass.lang} ${path || "/"}`);
}
}

// ── Atom feed of the notes registry (brief 2.5) ──────────────────────────────
// Full summaries, absolute URLs, year-precision publication dates (the
// registry records the year only — real dates are an owner question).
const { notes } = await vite.ssrLoadModule("/src/content/notes.ts");
const xmlEsc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const entries = [...notes]
  .sort((a, b) => (b.datePublished ?? "").localeCompare(a.datePublished ?? ""))
  .map((n) => {
    const url = canonicalFor(`/notes/${n.slug}`);
    return [
      "  <entry>",
      `    <id>${url}</id>`,
      `    <link rel="alternate" href="${url}" />`,
      `    <title>${xmlEsc(n.title)}</title>`,
      `    <summary>${xmlEsc(n.summary)}</summary>`,
      `    <published>${n.datePublished}</published>`,
      `    <updated>${n.datePublished}</updated>`,
      "    <author><name>Abu Md. Moniruzjaman</name></author>",
      "  </entry>",
    ].join("\n");
  })
  .join("\n");
writeFileSync(
  "dist/feed.xml",
  `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE}</id>
  <title>Writing — Abu Md. Moniruzjaman</title>
  <subtitle>Field guides, policy briefs and method notes on agricultural extension in Bangladesh.</subtitle>
  <link rel="alternate" href="${SITE}" />
  <link rel="self" href="${SITE}feed.xml" />
  <updated>${new Date().toISOString()}</updated>
  <author><name>Abu Md. Moniruzjaman</name></author>
${entries}
</feed>
`,
);
console.log(`✔ feed.xml — ${notes.length} entries`);
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
  `\n✔ prerendered ${pagesWritten} pages (en + bn × ${routePaths.length} routes) · ${titles.size} unique (lang,title) pairs · canonicals + sitemap agree`,
);
