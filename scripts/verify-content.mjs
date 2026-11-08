/**
 * verify-content.mjs — placeholders must never reach the published site.
 *
 * Case-study templates (brief 3.3) wait unregistered under src/content/notes/
 * with TODO(owner) markers. The moment a template is filled in and registered
 * in src/content/notes.ts, this gate demands the markers be gone: a published
 * page may not say TODO(owner), and a registered file may not still be a
 * template. Wired into `npm run build` before the typecheck.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const NOTES_DIR = "src/content/notes";
const REGISTRY = "src/content/notes.ts";
const MARKER = "TODO(owner)";

const files = readdirSync(NOTES_DIR).filter((f) => f.endsWith(".ts"));
const registrySrc = readFileSync(REGISTRY, "utf8");
const registered = new Set([...registrySrc.matchAll(/notes\/([A-Za-z0-9_-]+)"/g)].map((m) => m[1]));

let failed = 0;
for (const f of files) {
  const stem = f.replace(/\.ts$/, "");
  const src = readFileSync(join(NOTES_DIR, f), "utf8");
  if (!src.includes(MARKER)) continue;
  if (registered.has(stem)) {
    console.error(
      `✖ ${f} is registered for publication but still contains ${MARKER} — fill in the real values first.`,
    );
    failed++;
  } else {
    console.log(`• ${f} — template awaiting owner metrics (not published)`);
  }
}

if (failed) {
  console.error(`\n✖ verify-content: ${failed} placeholder file(s) registered for publication`);
  process.exit(1);
}
console.log(
  `\n✔ content gate: ${files.length} note files, ${registered.size} registered, no placeholders published`,
);
