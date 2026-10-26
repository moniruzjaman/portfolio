/**
 * render-smoke.mjs — server-renders real routes through Vite and asserts on the output.
 *
 * Exists because the sub-path routing bug (every route, including "/", rendering
 * Not Found under /portfolio/) passed the typecheck, the build AND the secrets
 * gate. Only rendering the app at its real base path can catch that class of bug.
 *
 * Runs at both a sub-path and the root, since the deployment target may change.
 */
import { createServer } from "vite";

const CASES = [
  // [base, route, must contain, must NOT contain]
  ["/portfolio/", "", "I build digital tools", "This page does not exist"],
  ["/portfolio/", "works", "The live ecosystem", "This page does not exist"],
  ["/portfolio/", "works/web-krishiai-live", "web.krishiai.live", "This page does not exist"],
  ["/portfolio/", "library", "Research, documents and presentations", "This page does not exist"],
  ["/portfolio/", "definitely-not-a-page", "This page does not exist", null],
  ["/", "works", "The live ecosystem", "This page does not exist"],
  ["/", "library", "Research, documents and presentations", "This page does not exist"],
];

let failed = 0;
for (const base of [...new Set(CASES.map((c) => c[0]))]) {
  process.env.BASE_PATH = base;
  const vite = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
  const { renderAt } = await vite.ssrLoadModule("/src/test/ssr-probe.tsx");
  for (const [b, route, want, unwanted] of CASES.filter((c) => c[0] === base)) {
    const html = renderAt(b + route).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&");
    const ok = html.includes(want) && (!unwanted || !html.includes(unwanted));
    if (!ok) failed++;
    console.log(`${ok ? "✔" : "✖"} base ${b.padEnd(11)} /${route.padEnd(26)} ${ok ? "" : `expected "${want}"`}`);
  }
  await vite.close();
}
if (failed) {
  console.error(`\n✖ ${failed} render check(s) failed`);
  process.exit(1);
}
console.log("\n✔ all routes render at their base path");
