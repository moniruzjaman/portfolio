import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveShelf, norm } from "../../src/lib/shelf.ts";

const json = (p) => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), "utf8"));
const apps = json("content-data/apps.json").apps;
const lib = json("content-data/library-curation.json");
const repos = json("src/data/repos.generated.json").repos;
const lj = json("src/data/library.generated.json");

const DATA = {
  default: { shelf: "other", subjects: [] },
  byPath: {
    Pesticides_Crisis: { shelf: "research", subjects: ["pesticide"] },
    "Krishak Card": { shelf: "report", subjects: ["krishak-card"] },
    Gap: { shelf: "guide", subjects: ["gap"] },
    "Krishak Card Extra": { shelf: "training", subjects: ["x"] },
  },
  entries: { file_override_0001: { shelf: "ebook" } },
};

test("shelf: exact, case, underscore and stray-whitespace matching", () => {
  assert.equal(resolveShelf(DATA, "a", ["Pesticides_Crisis"]).shelf, "research");
  assert.equal(resolveShelf(DATA, "a", ["pesticides crisis "]).shelf, "research");
  assert.equal(resolveShelf(DATA, "a", [" GAP"]).shelf, "guide");
});

test("shelf: a key matches a folder that STARTS with it on a word boundary only", () => {
  assert.equal(resolveShelf(DATA, "a", ["Krishak card multimedia portal resources "]).shelf, "report");
  assert.equal(resolveShelf(DATA, "a", ["Gapminder"]).shelf, "other", "'Gap' must not swallow 'Gapminder'");
  assert.equal(resolveShelf(DATA, "a", ["Krishak cards"]).shelf, "other");
});

test("shelf: longest matching key wins; per-file entry overrides folder; unknown → default", () => {
  assert.equal(resolveShelf(DATA, "a", ["Krishak card extra stuff"]).shelf, "training");
  assert.equal(resolveShelf(DATA, "file_override_0001", ["Gap"]).shelf, "ebook");
  assert.deepEqual(resolveShelf(DATA, "a", ["Nope"]), DATA.default);
  assert.deepEqual(resolveShelf(DATA, "a", []), DATA.default);
});

test("norm", () => assert.equal(norm("  Web_upload  Files "), "web upload files"));

/* ── integrity of the human-owned files ─────────────────────────────── */
const TYPES = ["app", "report", "ebook", "dataset", "source"];
const AUD = ["farmer", "officer", "policy", "learning"];
const SHELVES = ["research", "report", "ebook", "guide", "training", "other"];

test("apps.json: every entry is well-formed (a typo in a hand-edited file must fail loudly)", () => {
  const bad = [];
  for (const [name, e] of Object.entries(apps)) {
    if (!TYPES.includes(e.type)) bad.push(`${name}: type "${e.type}"`);
    if (!Array.isArray(e.audiences) || !e.audiences.length || e.audiences.some((a) => !AUD.includes(a))) bad.push(`${name}: audiences ${JSON.stringify(e.audiences)}`);
    for (const f of ["titleEn", "titleBn", "summaryEn", "summaryBn"]) if (typeof e[f] !== "string" || !e[f].trim()) bad.push(`${name}: missing ${f}`);
  }
  assert.deepEqual(bad, []);
});

test("library-curation.json: only valid shelves", () => {
  assert.ok(SHELVES.includes(lib.default.shelf));
  for (const [k, v] of Object.entries(lib.byPath)) assert.ok(SHELVES.includes(v.shelf), `${k} → ${v.shelf}`);
});

test("coverage report (informational — never fails, because the daily sync adds/renames repos)", () => {
  const names = new Set(repos.map((r) => r.name));
  const orphans = Object.keys(apps).filter((k) => !names.has(k));
  const uncurated = repos.filter((r) => !apps[r.name]).map((r) => r.name);
  const items = lj.collections.flatMap((c) => c.items);
  const unmapped = {};
  for (const i of items) if (resolveShelf(lib, i.id, i.path).shelf === "other") unmapped[i.path[0]?.trim() || "(root)"] = (unmapped[i.path[0]?.trim() || "(root)"] || 0) + 1;
  console.log(`  curation: ${Object.keys(apps).length} entries · ${orphans.length} orphaned ${JSON.stringify(orphans)} · ${uncurated.length} repos uncurated ${JSON.stringify(uncurated)}`);
  console.log(`  library: ${items.length} files · unmapped folders → "Other": ${JSON.stringify(unmapped)}`);
  assert.ok(true);
});
