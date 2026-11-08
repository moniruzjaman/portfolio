/**
 * ui-audit.mjs — real-browser audit of every route at phone and desktop width.
 *
 *   node scripts/ui-audit.mjs http://localhost:4173/portfolio
 *
 * Fails on: runtime errors, horizontal overflow, touch targets under 40px (phone),
 * and axe-core WCAG 2.x A/AA violations of serious/critical impact. Moderate/minor
 * axe findings are listed as warnings.
 *
 * Needs a browser, so it is NOT part of `npm test` or the deploy path (keeping those
 * fast). The ui-audit workflow installs the extras with `npm i --no-save`:
 *   puppeteer-core @sparticuz/chromium axe-core
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const base = (process.argv[2] || "http://localhost:4173/portfolio").replace(/\/$/, "");
const require = createRequire(import.meta.url);
const puppeteer = (await import("puppeteer-core")).default;
const chromium = (await import("@sparticuz/chromium")).default;
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const ROUTES = [
  "/",
  "/works",
  "/works/web-krishiai-live",
  "/library",
  "/expertise",
  "/notes",
  "/about",
];
const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, tap: true },
  { name: "desktop", width: 1280, height: 800, tap: false },
];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  args: [...chromium.args, "--no-sandbox"],
  executablePath: await chromium.executablePath(),
  headless: "shell",
});

const failures = [];
const warnings = [];
const origin = new URL(base).origin;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height });
  const errors = [];
  page.on("pageerror", (e) => errors.push(`runtime error: ${e.message}`));
  // Only first-party failures count: a blocked third-party host is the environment, not the site.
  page.on(
    "requestfailed",
    (r) => r.url().startsWith(origin) && errors.push(`failed request: ${r.url()}`),
  );
  page.on(
    "response",
    (r) =>
      r.url().startsWith(origin) && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`),
  );

  for (const route of ROUTES) {
    errors.length = 0;
    const where = `${vp.name} ${route}`;
    // Trailing slash: vite preview SPA-falls back to the home shell for
    // extension-less URLs, but production (GitHub Pages) serves the prerendered
    // directory file at exactly this URL form. The bare root keeps its slash.
    await page.goto(`${base}${route === "/" ? "/" : `${route}/`}`, {
      waitUntil: "load",
      timeout: 60_000,
    });
    await wait(1200);
    for (const e of errors) failures.push(`${where}: ${e}`);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    if (overflow > 0) failures.push(`${where}: page scrolls sideways by ${overflow}px`);

    if (vp.tap) {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll("a,button,select,input,textarea")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return (
              e.offsetParent !== null && r.width > 0 && !(e.textContent || "").startsWith("Skip")
            );
          })
          .map((e) => {
            const r = e.getBoundingClientRect();
            return {
              t: (
                e.innerText ||
                e.getAttribute("aria-label") ||
                e.getAttribute("href") ||
                e.tagName
              )
                .trim()
                .slice(0, 24),
              w: Math.round(r.width),
              h: Math.round(r.height),
            };
          })
          .filter((x) => x.h < 40 || x.w < 40),
      );
      for (const s of small) failures.push(`${where}: touch target "${s.t}" is ${s.w}x${s.h}px`);
    }

    await page.evaluate(axeSource);
    const result = await page.evaluate(() =>
      // eslint-disable-next-line no-undef
      axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      }),
    );
    for (const v of result.violations) {
      const line = `${where}: [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length}× e.g. ${v.nodes[0].target.join(" ")})`;
      (v.impact === "serious" || v.impact === "critical" ? failures : warnings).push(line);
    }
    console.log(`${(vp.name + " " + route).padEnd(34)} ok`);
  }
  await page.close();
}
await browser.close();

const uniq = (a) => [...new Set(a)];
if (warnings.length)
  console.log(`\n⚠ ${uniq(warnings).length} warning(s):\n  ` + uniq(warnings).join("\n  "));
if (failures.length) {
  console.error(`\n✖ ${uniq(failures).length} failure(s):\n  ` + uniq(failures).join("\n  "));
  process.exit(1);
}
console.log("\n✔ UI audit passed");
