/**
 * render-smoke.mjs — server-renders real routes through Vite and asserts on the output.
 *
 * Exists because the sub-path routing bug (every route, including "/", rendering
 * Not Found under /portfolio/) passed the typecheck, the build AND the secrets
 * gate. Only rendering the app at its real base path can catch that class of bug.
 *
 * Runs at both a sub-path and the root, since the deployment target may change.
 * When dist/ exists (after a build), it also audits the prerendered files:
 * every route file must have a unique <title> and a meta description.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createServer } from "vite";

const CASES = [
  // [base, route, must contain, must NOT contain]
  ["/portfolio/", "", "I build digital tools", "This page does not exist"],
  ["/portfolio/", "works", "The live ecosystem", "This page does not exist"],
  ["/portfolio/", "works/web-krishiai-live", "web.krishiai.live", "This page does not exist"],
  ["/portfolio/", "topics", "Research topics", "This page does not exist"],
  [
    "/portfolio/",
    "library",
    "Research, documents, presentations and videos",
    "This page does not exist",
  ],
  ["/portfolio/", "definitely-not-a-page", "This page does not exist", null],
  // Bangla URLs: the /bn/ prefix must render the Bangla prerender, not the
  // English page at a wrong path, and unknown bn paths must 404 like en ones.
  // (Body strings, deliberately not nav labels — the nav is Bangla on every
  // bn page, so a nav string would pass even when the body 404s.)
  ["/portfolio/", "bn/", "আমি ডিজিটাল টুল তৈরি করি", "This page does not exist"],
  ["/portfolio/", "bn/about", "যোগাযোগ", "এই পাতাটি নেই"],
  ["/portfolio/", "bn/works/web-krishiai-live", "web.krishiai.live", "এই পাতাটি নেই"],
  ["/portfolio/", "bn/definitely-not-a-page", "এই পাতাটি নেই", null],
  ["/", "works", "The live ecosystem", "This page does not exist"],
  ["/", "topics", "Research topics", "This page does not exist"],
  ["/", "library", "Research, documents, presentations and videos", "This page does not exist"],
];

let failed = 0;
for (const base of [...new Set(CASES.map((c) => c[0]))]) {
  process.env.BASE_PATH = base;
  const vite = await createServer({
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });
  const { renderAt } = await vite.ssrLoadModule("/src/test/ssr-probe.tsx");
  for (const [b, route, want, unwanted] of CASES.filter((c) => c[0] === base)) {
    const html = renderAt(b + route)
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&");
    const ok = html.includes(want) && (!unwanted || !html.includes(unwanted));
    if (!ok) failed++;
    console.log(
      `${ok ? "✔" : "✖"} base ${b.padEnd(11)} /${route.padEnd(26)} ${ok ? "" : `expected "${want}"`}`,
    );
  }
  await vite.close();
}
if (failed) {
  console.error(`\n✖ ${failed} render check(s) failed`);
  process.exit(1);
}
console.log("\n✔ all routes render at their base path");

// ── Prerendered-output audit (only meaningful after `npm run build`) ─────────
// The deploy workflow builds before it tests, so CI exercises this too.
if (existsSync("dist/index.html")) {
  const files = readdirSync("dist", { recursive: true }).filter(
    (f) => f.endsWith("index.html") && f !== "404.html",
  );
  const titles = new Map();
  let prerenderFailed = 0;
  for (const f of files) {
    const html = readFileSync(`dist/${f}`, "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    if (!title) {
      console.error(`✖ ${f}: no <title>`);
      prerenderFailed++;
      continue;
    }
    // Uniqueness is per language: a bn page may legitimately fall back to its
    // en title when the content has no Bangla title.
    const titleKey = `${f.startsWith("bn/") ? "bn" : "en"}:${title}`;
    if (titles.has(titleKey)) {
      console.error(
        `✖ duplicate <title> "${title}" — ${f} and ${titles.get(titleKey)}`,
      );
      prerenderFailed++;
    }
    titles.set(titleKey, f);
    if (!html.includes('name="description"')) {
      console.error(`✖ ${f}: no meta description`);
      prerenderFailed++;
    }
    if (!html.includes('<div id="root">')) {
      console.error(`✖ ${f}: root div missing`);
      prerenderFailed++;
    }
  }
  if (prerenderFailed) {
    console.error(`\n✖ ${prerenderFailed} prerendered-page check(s) failed`);
    process.exit(1);
  }
  console.log(
    `\n✔ prerender audit: ${files.length} route files, ${titles.size} unique titles, all with descriptions`,
  );
}
