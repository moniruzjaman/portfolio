#!/usr/bin/env node
/**
 * verify-no-secrets.mjs — enforces the "no API key" constraint mechanically.
 *
 * The constraint is architectural, so it gets a CI gate rather than a promise in
 * a README. A future contributor cannot quietly add a key: this fails the build.
 *
 * SCOPE (revised when the Google Drive library was added): the shipped site and
 * src/ contain no credentials, ever. Build-time scripts in scripts/ MAY read CI
 * secrets (GITHUB_TOKEN, GOOGLE_API_KEY, GOOGLE_SERVICE_ACCOUNT_JSON) to fetch
 * data into static JSON — the credential stays on the runner, the browser reads
 * the JSON. This gate is what proves none of it leaked into the output.
 *
 * Checks:
 *   1. no secret-shaped environment variables are referenced in src/
 *   2. no key-shaped literals in source, INCLUDING generated .json under src/
 *   3. no high-signal credential in the BUILT output (js/css/html/json)
 *   4. the built output references no host outside the allowlist
 *
 * Exit code 1 on any violation, with the offending file and line.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, process.argv[2] || "dist");
const SRC = resolve(ROOT, "src");

import { hostOf, hostAllowed } from "./lib/hosts.mjs";

/** Patterns that indicate a credential, wherever they appear. */
const SECRET_PATTERNS = [
  { re: /\bAIza[0-9A-Za-z_-]{35}\b/g, name: "Google API key" },
  { re: /\bsk-[A-Za-z0-9]{20,}\b/g, name: "OpenAI-style secret key" },
  { re: /\bghp_[A-Za-z0-9]{36}\b/g, name: "GitHub PAT" },
  { re: /\bgithub_pat_[A-Za-z0-9_]{50,}\b/g, name: "GitHub fine-grained PAT" },
  { re: /\bsupabase\.co\b/i, name: "Supabase project reference" },
  { re: /\bAKIA[0-9A-Z]{16}\b/g, name: "AWS access key id" },
  { re: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, name: "private key block" },
  { re: /\\?"private_key\\?"\s*:/g, name: "service-account private_key field" },
  { re: /[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com/gi, name: "service-account identity" },
];

/** Subset safe to run over minified bundles: no false positives on bundled library code. */
const BUNDLE_PATTERNS = SECRET_PATTERNS.filter(
  (p) => !["OpenAI-style secret key", "Supabase project reference"].includes(p.name),
);

const KEY_ENV_PATTERNS = [
  /import\.meta\.env\.[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/i,
  /process\.env\.[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/,
];

const problems = [];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", ".cache"].includes(entry.name)) continue;
      yield* walk(p);
    } else {
      yield p;
    }
  }
}

/* ── 1 + 2: source scan ─────────────────────────────────────── */

for await (const file of walk(SRC)) {
  const ext = extname(file);
  if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".html", ".json"].includes(ext)) continue;
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    // Ignore comment-only lines — prose about not using keys is not a violation.
    const isComment = /^\s*(\/\/|\/\*|\*|<!--)/.test(line);

    for (const { re, name } of SECRET_PATTERNS) {
      re.lastIndex = 0;
      if (re.test(line) && !isComment) {
        problems.push(`${relative(ROOT, file)}:${i + 1}  ${name} literal`);
      }
    }
    for (const re of KEY_ENV_PATTERNS) {
      if (re.test(line) && !isComment) {
        problems.push(`${relative(ROOT, file)}:${i + 1}  key-shaped env var reference`);
      }
    }
  });
}

/* ── 3: built-output host scan ──────────────────────────────── */

/**
 * Scan only positions that actually cause a network request at runtime:
 *   HTML   src= / href=
 *   CSS    url( / @import
 *   JS     fetch( / XMLHttpRequest / new Image( / importScripts(
 *
 * A naive "any https:// string" scan is useless here — it flags React's error
 * message links, Tailwind's source comments, and the JSON-LD context URI, none
 * of which are ever requested. Those are still surfaced, but as advisories, so a
 * genuinely new outbound host cannot hide behind a noisy report.
 */
const NETWORK_POSITIONS = [
  { ext: ".html", re: /(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)/gi, kind: "attr" },
  { ext: ".css", re: /url\(\s*["']?(https?:\/\/[^)"']+)/gi, kind: "css-url" },
  { ext: ".css", re: /@import\s+(?:url\()?["']?(https?:\/\/[^"')]+)/gi, kind: "css-import" },
  {
    ext: ".js",
    re: /\b(?:fetch|XMLHttpRequest\.open|importScripts|new\s+Image)\s*\(\s*["'`](https?:\/\/[^"'`]+)/gi,
    kind: "js-fetch",
  },
  { ext: ".js", re: /\bsrc\s*[:=]\s*["'`](https?:\/\/[^"'`]+)/gi, kind: "js-src" },
];

try {
  await stat(DIST);
} catch {
  console.error(`✖ ${relative(ROOT, DIST)} not found — run the build first.`);
  process.exit(1);
}

const advisories = new Set();

for await (const file of walk(DIST)) {
  const ext = extname(file);
  const text = await readFile(file, "utf8");
  const where = relative(ROOT, file);

  if ([".js", ".css", ".html", ".json", ".map"].includes(ext)) {
    for (const { re, name } of BUNDLE_PATTERNS) {
      re.lastIndex = 0;
      if (re.test(text)) problems.push(`${where}  ${name} in built output`);
    }
  }

  for (const pos of NETWORK_POSITIONS) {
    if (pos.ext !== ext) continue;
    pos.re.lastIndex = 0;
    let m;
    while ((m = pos.re.exec(text))) {
      const host = hostOf(m[1]);
      if (!host) continue;
      if (!hostAllowed(host)) {
        problems.push(`${where}  ${pos.kind} → off-allowlist host: ${host}`);
      }
    }
  }

  // Advisory pass: every other absolute URL, so a new host still shows up.
  if ([".js", ".html"].includes(ext)) {
    const anyUrl = /https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/gi;
    let m;
    while ((m = anyUrl.exec(text))) {
      const host = m[0].replace(/^https?:\/\//, "").toLowerCase();
      if (!hostAllowed(host)) advisories.add(host);
    }
  }
}

/* ── report ─────────────────────────────────────────────────── */

if (advisories.size) {
  console.log(`\n  advisory — non-requested hosts found in the bundle (not fetched):`);
  for (const h of [...advisories].sort().slice(0, 12)) console.log(`    ${h}`);
  console.log(`  If any of these should be requested, it belongs in ALLOWED_HOSTS (scripts/lib/hosts.mjs).`);
}

if (problems.length) {
  console.error(`\n✖ no-api-key check FAILED — ${problems.length} violation(s):\n`);
  for (const p of [...new Set(problems)].slice(0, 40)) console.error(`   ${p}`);
  console.error(`\n   This site is built to run with no credentials of any kind.`);
  console.error(`   If a host is legitimate, add it to ALLOWED_HOSTS in scripts/lib/hosts.mjs\n`);
  process.exit(1);
}

console.log("\n✔ no-api-key check passed — no credentials, no off-allowlist requests.");
