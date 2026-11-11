// theme-shots.mjs — screenshot pages in light + dark for the dark-mode
// visual check. Reuses the repo's chromium resolution (hydration-probe.mjs).
// Usage: node /home/z/my-project/scripts/theme-shots.mjs <distDir> <outDir>
import chromium from "@sparticuz/chromium";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const puppeteer = (await import("puppeteer-core")).default;
const dist = process.argv[2];
const out = process.argv[3] ?? "/tmp/shots";
if (!dist || !existsSync(dist)) throw new Error(`no dist at ${dist}`);
mkdirSync(out, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml", ".json": "application/json" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.startsWith("/portfolio/")) p = p.slice("/portfolio".length);
  let f = join(dist, p === "/" ? "index.html" : p);
  if (!existsSync(f) || !p.includes(".")) f = join(dist, p, "index.html");
  try {
    res.setHeader("content-type", MIME[extname(f)] ?? "application/octet-stream");
    res.end(readFileSync(f));
  } catch {
    res.statusCode = 404;
    res.end("nope");
  }
});
await new Promise((r) => server.listen(4180, r));

const browser = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const routes = [["/", "home"], ["/works/", "works"], ["/works/cabi-diagnosis/", "work-detail"], ["/notes/soil-health-media-hub/", "note"]];
for (const theme of ["light", "dark"]) {
  // localStorage only — the page's inline boot script applies the class at
  // parse time (evaluateOnNewDocument runs before documentElement exists).
  await page.evaluateOnNewDocument((t) => {
    try { localStorage.setItem("theme", t); } catch { /* private mode — shots just run light */ }
  }, theme);
  for (const [route, name] of routes) {
    await page.goto(`http://localhost:4180/portfolio${route}`, { waitUntil: "networkidle0", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: join(out, `${name}-${theme}.png`) });
    console.log(`shot ${name}-${theme}`);
  }
}
await browser.close();
server.close();
