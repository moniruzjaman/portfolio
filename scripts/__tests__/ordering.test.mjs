import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { byActivity, byCreation, isNew, NEW_WINDOW_DAYS } from "../../src/lib/ordering.ts";

const json = (p) => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), "utf8"));
const repos = json("src/data/repos.generated.json").repos;
const snapshotAt = Date.parse(json("src/data/repos.generated.json").generatedAt);

/**
 * These rules decide what a visitor sees first, so they are pinned here:
 * a regression in the ordering is invisible in a screenshot and obvious in
 * the order of the catalogue.
 */

test("byCreation: newest creation leads", () => {
  const list = [
    { name: "old", pushedAt: "2026-11-01T00:00:00Z", createdAt: "2025-01-01T00:00:00Z" },
    { name: "new", pushedAt: "2025-01-01T00:00:00Z", createdAt: "2026-11-01T00:00:00Z" },
  ];
  assert.deepEqual(
    [...list].sort(byCreation).map((r) => r.name),
    ["new", "old"],
  );
});

test("byCreation: a repo pushed today does not outrank one created today", () => {
  const list = [
    {
      name: "ancient-but-pushed",
      pushedAt: "2026-11-20T00:00:00Z",
      createdAt: "2024-01-01T00:00:00Z",
    },
    { name: "just-started", pushedAt: "2026-01-05T00:00:00Z", createdAt: "2026-11-19T00:00:00Z" },
  ];
  assert.deepEqual(
    [...list].sort(byCreation).map((r) => r.name),
    ["just-started", "ancient-but-pushed"],
  );
});

test("byCreation: a repo with no recorded creation falls back to push time", () => {
  const list = [
    { name: "no-date", pushedAt: "2026-11-20T00:00:00Z", createdAt: null },
    { name: "dated", pushedAt: "2026-01-05T00:00:00Z", createdAt: "2026-01-05T00:00:00Z" },
  ];
  // The dated repo still leads — it has a creation time, even if older.
  assert.deepEqual(
    [...list].sort(byCreation).map((r) => r.name),
    ["dated", "no-date"],
  );
});

test("byCreation: equal timestamps fall through to the name, so the order is total", () => {
  const a = { name: "a", pushedAt: "2026-01-01T00:00:00Z", createdAt: "2026-01-01T00:00:00Z" };
  const b = { name: "b", pushedAt: "2026-01-01T00:00:00Z", createdAt: "2026-01-01T00:00:00Z" };
  assert.ok(byCreation(a, b) < 0, "a sorts before b");
  assert.ok(byCreation(b, a) > 0, "b sorts after a");
  assert.deepEqual(
    [a, b].sort(byCreation).map((r) => r.name),
    ["a", "b"],
  );
});

test("byActivity: most recently pushed leads, name breaks ties", () => {
  const list = [
    { name: "b", pushedAt: "2026-01-01T00:00:00Z", createdAt: "2025-01-01T00:00:00Z" },
    { name: "a", pushedAt: "2026-01-01T00:00:00Z", createdAt: "2025-01-01T00:00:00Z" },
    { name: "c", pushedAt: "2026-06-01T00:00:00Z", createdAt: "2025-01-01T00:00:00Z" },
  ];
  assert.deepEqual(
    [...list].sort(byActivity).map((r) => r.name),
    ["c", "a", "b"],
  );
});

test("isNew: inside the window, and measured from the snapshot", () => {
  const base = Date.parse("2026-11-21T00:00:00Z");
  const inside = {
    name: "inside",
    pushedAt: "2026-11-01T00:00:00Z",
    createdAt: new Date(base - NEW_WINDOW_DAYS * 86_400_000 + 1000).toISOString(),
  };
  const outside = {
    name: "outside",
    pushedAt: "2026-11-01T00:00:00Z",
    createdAt: new Date(base - NEW_WINDOW_DAYS * 86_400_000 - 1000).toISOString(),
  };
  assert.equal(isNew(inside, base), true);
  assert.equal(isNew(outside, base), false);
});

test("isNew: a repo created after the snapshot is not 'new'", () => {
  const base = Date.parse("2026-11-21T00:00:00Z");
  const future = {
    name: "future",
    pushedAt: "2026-11-21T00:00:00Z",
    createdAt: new Date(base + 86_400_000).toISOString(),
  };
  assert.equal(isNew(future, base), false);
});

test("isNew: no creation date means not new", () => {
  assert.equal(isNew({ name: "x", pushedAt: "2026-11-21T00:00:00Z" }, snapshotAt), false);
});

test("the shipped catalogue carries a creation date for every repo", () => {
  const missing = repos.filter((r) => !r.createdAt).map((r) => r.name);
  assert.deepEqual(missing, [], "every repo needs createdAt for the newest-first order");
});

test("the shipped catalogue orders deterministically by creation", () => {
  const sorted = [...repos].sort(byCreation);
  const dates = sorted.map((r) => r.createdAt).filter(Boolean);
  for (let i = 1; i < dates.length; i++) {
    assert.ok(
      Date.parse(dates[i - 1]) >= Date.parse(dates[i]),
      `creation dates must descend: ${dates[i - 1]} then ${dates[i]}`,
    );
  }
});

test("the catalogue's newest creation is a real repo, not an empty one", () => {
  const newest = [...repos].sort(byCreation)[0];
  assert.ok(newest && newest.createdAt, "there must be a newest repo to showcase");
  assert.ok(newest.title || newest.name, "the showcased repo needs a name");
});
