#!/usr/bin/env node
/**
 * sync-repos.mjs — build-time repository discovery for the portfolio.
 *
 * Fetches every public repo for the configured owner, applies the four-channel
 * inclusion contract, probes the live deployment, and writes a static JSON file
 * that ships with the site.
 *
 * WHY THIS RUNS IN CI AND NOT THE BROWSER
 * ---------------------------------------
 * Unauthenticated api.github.com is 60 requests/hour per IP. A DAE office or a
 * campus shares one NAT address, so the first visitor would exhaust the quota
 * and everyone behind them would get a broken page. In CI we use the
 * auto-minted GITHUB_TOKEN (5,000 req/hr) and the browser reads static JSON.
 * Net effect: zero API keys, zero client-side API calls, no visitor IP leak.
 *
 * The inclusion contract lives in INCLUSION below. Change it here and the
 * workflow picks the change up on its next run — no other file to touch.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { probeBrand } from "./lib/brand-probe.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const OWNER = process.env.REPO_OWNER || "moniruzjaman";
const OUT = resolve(ROOT, "src/data/repos.generated.json");
const EXCLUDED_OUT = resolve(ROOT, "src/data/excluded.generated.json");

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const API = "https://api.github.com";

/* ── the inclusion contract ────────────────────────────────────────────── */

/** Repos that must never be published, whatever their channels say. */
const HARD_EXCLUDE = {
  // Source material for this very build, not a portfolio piece.
  info: "AI Studio source file used to author this site",
  // Forks are not the author's own work.
  "open-lovable": "fork of an upstream template",
  PageIndex: "fork of an upstream project",
  // Committed before the identity work; the CV is now the source of truth.
  "cultivating-knowledge": "2019 stub, no content",
};

/** Marker files that prove a repo is deployed somewhere we surface. */
const CLOUDFLARE_MARKERS = [
  "wrangler.jsonc",
  "wrangler.toml",
  "worker.js",
  "_worker.js",
  "functions/api",
];

/** Marker files that prove a repo is served from GitHub Pages. */
const PAGES_MARKERS = [
  ".nojekyll",
  "CNAME",
  ".github/workflows/pages.yml",
  ".github/workflows/jekyll-gh-pages.yml",
  "public/CNAME",
  "docs/CNAME",
];

/* ── http ──────────────────────────────────────────────────────────────── */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class HttpError extends Error {
  constructor(status, path) {
    super(`GET ${path} → ${status}`);
    this.status = status;
    this.path = path;
  }
}

async function ghOnce(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new HttpError(res.status, path);
  return res.json();
}

/**
 * Fetch with backoff on rate limit / transient failure.
 *
 * This distinction is load-bearing. An earlier draft caught *every* tree error
 * and reported the repo as "default branch has no commits". When the anonymous
 * 60/hr quota ran out mid-run, 11 real repos were silently dropped from the site.
 * A portfolio that quietly loses projects is worse than one that fails to
 * build, so only a genuine 409 is treated as emptiness — everything else
 * retries, then aborts the run.
 */
async function gh(path, { retries = 4 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ghOnce(path);
    } catch (err) {
      const s = err instanceof HttpError ? err.status : 0;
      const retryable = s === 403 || s === 429 || s === 0 || s >= 500;
      if (!retryable || attempt >= retries) throw err;
      const wait = Math.min(2 ** attempt * 2000, 30_000);
      console.warn(`  ! ${s} on ${path} — retry ${attempt + 1}/${retries} in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

/** Probe a deployment URL. Resolving slowly is worse than not resolving at all. */
async function alive(url) {
  if (!url) return false;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "krishiai-hub-sync" },
    });
    // 401/403 (e.g. Vercel deployment protection) and 405 (HEAD refused) mean the
    // deployment exists; only a real failure should hide the link.
    return res.status < 400 || [401, 403, 405].includes(res.status);
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/* ── channel detection ─────────────────────────────────────────────────── */

/**
 * Resolve whether a repo is served from a krishiai.live subdomain.
 *
 * Three pieces of evidence, in descending order of reliability:
 *   1. the CNAME file's actual contents  (authoritative — this is what Pages serves)
 *   2. the repo homepage field
 *   3. the repo name, when it is itself a subdomain (web.krishiai.live)
 *
 * A bare "does a CNAME exist" check is wrong: plantation-tracker-app has a CNAME
 * pointing at surge.sh, which is not our domain. The file contents must be read.
 */
async function customDomainFor(repo, tree) {
  const home = repo.homepage || "";
  if (home.includes("krishiai.live")) return home;

  for (const node of tree) {
    if (!node.path.endsWith("CNAME")) continue;
    try {
      const f = await gh(`/repos/${OWNER}/${repo.name}/contents/${node.path}`);
      const text = Buffer.from(f.content, "base64").toString("utf8").trim();
      if (text.includes("krishiai.live")) return `https://${text}`;
    } catch {
      /* unreadable CNAME — fall through to the name check */
    }
  }

  // Repo named after the subdomain, e.g. "web.krishiai.live". Confirm the URL
  // actually answers before claiming the channel.
  if (/^[\w.-]+\.krishiai\.live$/.test(repo.name)) {
    const candidate = `https://${repo.name}`;
    if (await alive(candidate)) return candidate;
  }
  return null;
}

function channelsFor(repo, tree, customDomain) {
  const ch = [];
  const home = repo.homepage || "";
  const paths = tree.map((p) => p.path);
  const has = (m) => paths.some((p) => p === m || p.startsWith(m) || p.endsWith(m));

  if (customDomain) ch.push("custom-domain");
  if (home.endsWith(".vercel.app")) ch.push("vercel");
  // A Cloudflare Pages / Workers homepage is proof on its own; marker files cover
  // repos whose deployment URL is not recorded in the homepage field.
  if (/\.(pages|workers)\.dev\/?$/.test(home) || CLOUDFLARE_MARKERS.some(has)) ch.push("cloudflare");
  if (repo.has_pages || PAGES_MARKERS.some(has)) ch.push("github-pages");

  return [...new Set(ch)];
}

/* ── title ─────────────────────────────────────────────────────────────── */

/** Prefer the README's H1 over the repo name — repo names are often cryptic. */
async function titleFrom(readme, fallback) {
  if (!readme) return fallback;
  const h1 = readme.match(/^#\s+(.+)$/m);
  if (!h1) return fallback;
  const t = h1[1]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();
  return t.length > 2 && t.length < 90 ? t : fallback;
}

/* ── main ──────────────────────────────────────────────────────────────── */

async function main() {
  const t0 = Date.now();

  if (!TOKEN) {
    const rl = await gh("/rate_limit").catch(() => null);
    const core = rl?.resources?.core;
    console.log(
      `▸ syncing repos for ${OWNER} (anonymous — ${core ? `${core.remaining}/${core.limit} left` : "limit unknown"})`,
    );
    // Each repo costs ~3 calls (tree + readme) plus one per live-URL probe. With
    // 62 repos that is roughly 200 calls, so the anonymous 60/hr ceiling cannot
    // complete a run. Fail early and clearly rather than half-populating the site.
    if (core && core.remaining < 250) {
      throw new Error(
        `Anonymous rate limit has ${core.remaining} calls left; a full sync needs ~250. ` +
          `Set GITHUB_TOKEN to run this locally. In CI the token is injected automatically.`,
      );
    }
  } else {
    console.log(`▸ syncing repos for ${OWNER} (authenticated)`);
  }

  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await gh(`/users/${OWNER}/repos?per_page=100&page=${page}&sort=updated`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  console.log(`  fetched ${repos.length} public repos`);

  const included = [];
  const excluded = [];

  for (const repo of repos) {
    const name = repo.name;

    // ── exclusions, with a recorded reason ──────────────────────────
    let reason = null;
    if (repo.fork) reason = "fork";
    else if (HARD_EXCLUDE[name]) reason = HARD_EXCLUDE[name];
    else if (!repo.size) reason = "empty repository (no commits)";

    if (reason) {
      excluded.push({ name, reason, url: repo.html_url });
      continue;
    }

    // ── tree probe ────────────────────────────────────────────────
    // 409 is GitHub's answer for "this branch has no commits" — a genuinely
    // empty repo. Any other error is a transient/API problem and must not be
    // laundered into an exclusion.
    let tree = [];
    try {
      const t = await gh(
        `/repos/${OWNER}/${name}/git/trees/${repo.default_branch}?recursive=1`,
      );
      tree = (t.tree || []).filter((n) => n.type === "blob");
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        excluded.push({ name, reason: "empty repository (no commits)", url: repo.html_url });
        continue;
      }
      throw new Error(
        `Could not read the tree for "${name}" (${err.message}). ` +
          `Refusing to continue — classifying a repo we could not read would ` +
          `silently drop it from the site. Check GITHUB_TOKEN / rate limit, then re-run.`,
      );
    }

    const customDomain = await customDomainFor(repo, tree);
    const channels = channelsFor(repo, tree, customDomain);
    if (channels.length === 0) {
      excluded.push({
        name,
        reason: "no qualifying deployment channel",
        url: repo.html_url,
      });
      continue;
    }

    // ── readme, for a human title and an excerpt ───────────────────
    let readme = "";
    try {
      const r = await gh(`/repos/${OWNER}/${name}/readme`);
      readme = Buffer.from(r.content, "base64").toString("utf8");
    } catch {
      /* readme is optional */
    }

    const homepage = repo.homepage || null;
    const pagesUrl = `https://${OWNER}.github.io/${name}/`;
    const [homeAlive, pagesAlive] = await Promise.all([alive(homepage), alive(pagesUrl)]);

    // Branding comes from the app itself (PWA manifest + <head>). Cosmetic, so a
    // failed probe yields null and the site derives a monogram — it never aborts.
    const liveUrl = homeAlive ? homepage : customDomain || null;
    const brand = await probeBrand(liveUrl || (pagesAlive ? pagesUrl : null));

    included.push({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title: await titleFrom(readme, name),
      description: (repo.description || "").trim() || null,
      language: repo.language || null,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at,
      url: repo.html_url,
      live: liveUrl,
      customDomain,
      pages: pagesAlive ? pagesUrl : null,
      channels,
      readmeBytes: readme.length,
      brand,
      featured: false, // flagship order is curated in src/content/apps.ts
    });

    process.stdout.write(`  ✓ ${name}${brand ? `  [brand: ${brand.source}${brand.themeColor ? " " + brand.themeColor : ""}]` : ""}\n`);
  }

  // Deterministic order: most recently pushed first, then name.
  included.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt) || a.name.localeCompare(b.name));
  excluded.sort((a, b) => a.name.localeCompare(b.name));

  const counts = included.reduce((acc, r) => {
    for (const c of r.channels) acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generatedAt: new Date().toISOString(),
    source: OWNER,
    total: included.length,
    scanned: repos.length,
    channels: counts,
    repos: included,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await writeFile(
    EXCLUDED_OUT,
    JSON.stringify(
      {
        generatedAt: payload.generatedAt,
        note: "Audit trail — every repo that did not qualify, and why. See design-system.md §7.",
        total: excluded.length,
        excluded,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  const live = included.filter((r) => r.live || r.pages).length;
  const branded = included.filter((r) => r.brand).length;
  console.log(
    `\n✔ ${included.length} included · ${excluded.length} excluded · ${live} with a live URL · ${branded} branded from the app itself\n` +
      `  channels: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join("  ")}\n` +
      `  took ${((Date.now() - t0) / 1000).toFixed(1)}s → ${OUT.replace(ROOT + "/", "")}`,
  );
}

main().catch((err) => {
  console.error("✖ sync failed:", err.message);
  process.exit(1);
});
