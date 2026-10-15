/**
 * gen-sitemap.mjs — writes public/sitemap.xml from the same sources the site
 * renders from (generated repo list + note files), so it cannot drift.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const SITE = "https://moniruzjaman.github.io";
const repos = JSON.parse(readFileSync("src/data/repos.generated.json", "utf8")).repos;
const noteSlugs = readdirSync("src/content/notes")
  .filter((f) => f.endsWith(".ts"))
  .map((f) => readFileSync(`src/content/notes/${f}`, "utf8").match(/slug:\s*"([^"]+)"/)?.[1])
  .filter(Boolean);

const paths = [
  "/", "/works", "/expertise", "/notes", "/about",
  ...repos.map((r) => `/works/${r.slug}`),
  ...noteSlugs.map((s) => `/notes/${s}`),
];
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n") +
  `\n</urlset>\n`;
writeFileSync("public/sitemap.xml", xml);
console.log(`sitemap: ${paths.length} URLs`);
