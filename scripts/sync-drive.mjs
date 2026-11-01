#!/usr/bin/env node
/**
 * sync-drive.mjs — build-time index of the public Google Drive library.
 *
 * Same architecture as sync-repos.mjs and for the same reasons: credentials live
 * only in CI, the browser reads a static JSON file, and no visitor ever calls a
 * Google API. The shipped site and src/ still contain zero credentials —
 * verify-no-secrets.mjs enforces that on the built output.
 *
 * THREE MODES (chosen by what is in the environment)
 *   GOOGLE_API_KEY                  anonymous API access. Can only ever see files
 *                                   shared "Anyone with the link", so a private file
 *                                   cannot leak through this path. RECOMMENDED.
 *   GOOGLE_SERVICE_ACCOUNT_JSON     can see anything shared with the account, so
 *                                   each file's permissions are checked and any file
 *                                   not publicly readable is SKIPPED (fail closed).
 *   neither                         no API call. Refreshes folder metadata from the
 *                                   config only; the site falls back to Drive's own
 *                                   embedded folder view. Never fails the workflow.
 *
 * SAFETY RULES (each learned from sync-repos.mjs, see design-system.md §9)
 *   - An API error on a configured folder ABORTS the run. Treating "could not read"
 *     as "empty" would silently delete the library from the site.
 *   - Existing data is never overwritten with less than what was fetched.
 *   - Only a validated file id and a few metadata fields are written; Drive's
 *     webViewLink / thumbnailLink are never stored. URLs are built in the app.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createSign } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
export const PATHS = {
  config: resolve(ROOT, "content/library.config.json"),
  out: resolve(ROOT, "src/data/library.generated.json"),
  skipped: resolve(ROOT, "src/data/library-skipped.generated.json"),
};

const DRIVE = "https://www.googleapis.com/drive/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const ID_RE = /^[A-Za-z0-9_-]{10,}$/;
const MAX_ITEMS = 2000;
/** Only these are published unless config.kinds says otherwise. A shared folder is often
 *  a working directory (images, zips, site source) — listing all of it publicly is a leak. */
export const DEFAULT_KINDS = ["pdf", "slides", "doc"];
const FOLDER = "application/vnd.google-apps.folder";
const SHORTCUT = "application/vnd.google-apps.shortcut";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── pure helpers (unit-tested) ────────────────────────────────────────── */

/** Map a MIME type to the small vocabulary the UI renders. */
export function kindOf(mime, name = "") {
  const ext = (name.match(/\.([A-Za-z0-9]+)$/)?.[1] || "").toLowerCase();
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    mime === "application/vnd.google-apps.presentation" ||
    mime.includes("presentationml") ||
    mime === "application/vnd.ms-powerpoint" ||
    ["ppt", "pptx", "odp"].includes(ext)
  )
    return "slides";
  if (
    mime === "application/vnd.google-apps.document" ||
    mime.includes("wordprocessingml") ||
    mime === "application/msword" ||
    ["doc", "docx", "odt", "rtf"].includes(ext)
  )
    return "doc";
  if (
    mime === "application/vnd.google-apps.spreadsheet" ||
    mime.includes("spreadsheetml") ||
    mime === "application/vnd.ms-excel" ||
    ["xls", "xlsx", "csv", "ods"].includes(ext)
  )
    return "sheet";
  if (mime.startsWith("image/")) return "image";
  return "other";
}

/** "NPK_Guide-2025_final.pdf" → "NPK Guide 2025 final". Bangla names pass through. */
export function titleOf(name) {
  return name
    .replace(/\.[A-Za-z0-9]{1,5}$/, "")
    .replace(/[_]+/g, " ")
    .replace(/\s*-\s*/g, " – ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Decide which collection a file in a single "root" folder belongs to.
 *  1. inside a top-level subfolder whose name matches researchPattern → research
 *  2. by file type: PDF → pdf, slides → pptx
 *  3. everything else → other
 * Pure and unit-tested, so the sorting rules are checkable without Drive.
 */
export function assignCollection(path, kind, researchRe) {
  if (path[0] && researchRe.test(path[0])) return "research";
  if (kind === "pdf") return "pdf";
  if (kind === "slides") return "pptx";
  return "other";
}

export function shapeItem(f, path, collection) {
  return {
    id: f.id,
    collection,
    name: f.name,
    title: titleOf(f.name),
    kind: kindOf(f.mimeType, f.name),
    mime: f.mimeType,
    modified: f.modifiedTime || null,
    size: f.size ? Number(f.size) : null,
    path,
    ...(f.resourceKey ? { resourceKey: f.resourceKey } : {}),
  };
}

export const isPublic = (f) =>
  Array.isArray(f.permissions) && f.permissions.some((p) => p.type === "anyone");

/* ── auth ──────────────────────────────────────────────────────────────── */

const b64url = (b) => Buffer.from(b).toString("base64url");

export function signJwt(sa, now = Math.floor(Date.now() / 1000), tokenUrl = TOKEN_URL) {
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: tokenUrl, iat: now, exp: now + 3300 }),
  );
  const sig = createSign("RSA-SHA256").update(`${head}.${claim}`).sign(sa.private_key);
  return `${head}.${claim}.${b64url(sig)}`;
}

async function bearerFor(sa, { fetchImpl, tokenUrl }) {
  const res = await fetchImpl(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signJwt(sa, undefined, tokenUrl),
    }),
  });
  if (!res.ok) throw new Error(`service-account token exchange failed (${res.status})`);
  return (await res.json()).access_token;
}

/* ── drive listing ─────────────────────────────────────────────────────── */

class DriveError extends Error {
  constructor(status, what) {
    super(`${what} → ${status}`);
    this.status = status;
  }
}

function makeClient({ apiKey, bearer, fetchImpl, base }) {
  async function once(url, extraHeaders) {
    const res = await fetchImpl(url, {
      headers: { Accept: "application/json", ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}), ...extraHeaders },
    });
    if (!res.ok) throw new DriveError(res.status, "Drive list");
    return res.json();
  }
  // Backoff only on rate-limit / transient. 404 and 401 are configuration errors.
  return async function list(params, extraHeaders = {}, retries = 4) {
    const q = new URLSearchParams({ ...params, ...(apiKey ? { key: apiKey } : {}) });
    const url = `${base}/files?${q}`;
    for (let attempt = 0; ; attempt++) {
      try {
        return await once(url, extraHeaders);
      } catch (err) {
        const s = err.status ?? 0;
        const retryable = s === 403 || s === 429 || s === 0 || s >= 500;
        if (!retryable || attempt >= retries) throw err;
        await sleep(Math.min(2 ** attempt * 1500, 20_000));
      }
    }
  };
}

/**
 * Walk one collection's folder tree. Returns { items, skipped }.
 * `verify` = true in service-account mode: skip anything not publicly readable.
 */
export async function crawl(list, col, { maxDepth, verify, kinds = null, excludeFolders = [] }) {
  const items = [];
  const skipped = [];
  // Bulk reasons are counted, not listed: 1,100 "image" lines would bury the ones that matter.
  const tally = {};
  const bump = (r) => (tally[r] = (tally[r] || 0) + 1);
  const excluded = new Set(excludeFolders.map((n) => String(n).trim().toLowerCase()));
  const headers = col.resourceKey ? { "X-Goog-Drive-Resource-Keys": `${col.folderId}/${col.resourceKey}` } : {};
  const fields =
    "nextPageToken,files(id,name,mimeType,modifiedTime,size,resourceKey" + (verify ? ",permissions(type,role)" : "") + ")";

  const queue = [{ id: col.folderId, path: [], depth: 0 }];
  while (queue.length) {
    const { id, path, depth } = queue.shift();
    let pageToken;
    do {
      let data;
      try {
        data = await list(
          {
            q: `'${id}' in parents and trashed = false`,
            fields,
            pageSize: "1000",
            orderBy: "name",
            supportsAllDrives: "true",
            includeItemsFromAllDrives: "true",
            ...(pageToken ? { pageToken } : {}),
          },
          headers,
        );
      } catch (err) {
        if (err.status === 404 || err.status === 401) {
          throw new Error(
            `Folder "${col.title}" (${id}) is not readable (${err.status}). ` +
              `Share it as "Anyone with the link: Viewer"` +
              (verify ? " or share it with the service account's client_email" : "") +
              `, then re-run. Refusing to publish an empty collection.`,
          );
        }
        throw new Error(`Could not read "${col.title}" (${err.message}). Aborting rather than dropping files from the site.`);
      }

      for (const f of data.files || []) {
        if (!ID_RE.test(f.id)) {
          skipped.push({ id: f.id, name: f.name, reason: "unexpected id format" });
          continue;
        }
        if (f.mimeType === FOLDER) {
          if (excluded.has(f.name.trim().toLowerCase())) bump(`folder excluded by config: ${f.name}`);
          else if (depth + 1 > maxDepth) bump(`folder deeper than maxDepth=${maxDepth}`);
          else queue.push({ id: f.id, path: [...path, f.name], depth: depth + 1 });
          continue;
        }
        if (f.mimeType === SHORTCUT) {
          skipped.push({ id: f.id, name: f.name, reason: "shortcut (target not followed)" });
          continue;
        }
        const kind0 = kindOf(f.mimeType, f.name);
        if (kinds && !kinds.includes(kind0)) {
          bump(`file type not published: ${kind0}`);
          continue;
        }
        if (verify && !isPublic(f)) {
          skipped.push({
            id: f.id,
            name: f.name,
            reason: f.permissions ? "not shared publicly" : "permissions not readable — failing closed",
          });
          continue;
        }
        if (items.length >= MAX_ITEMS) {
          skipped.push({ id: f.id, name: f.name, reason: `over the ${MAX_ITEMS}-file cap` });
          continue;
        }
        const kind = kindOf(f.mimeType, f.name);
        items.push(shapeItem(f, path, col.assign ? col.assign(path, kind) : col.key));
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
  }

  items.sort((a, b) => (b.modified || "").localeCompare(a.modified || "") || a.title.localeCompare(b.title));
  return { items, skipped, tally };
}

/* ── output assembly ───────────────────────────────────────────────────── */

function collectionMeta(c) {
  return {
    key: c.key,
    title: c.title,
    titleBn: c.titleBn,
    description: c.description,
    descriptionBn: c.descriptionBn,
    folderId: c.folderId && ID_RE.test(c.folderId) ? c.folderId : null,
  };
}

export function rootMeta(config) {
  const id = config.root?.folderId;
  return id && ID_RE.test(id) ? { folderId: id } : null;
}

/** No credentials: refresh metadata, keep any items that belong to the same folder. */
export function mergeWithoutCredentials(prev, config) {
  const prevByKey = new Map((prev?.collections || []).map((c) => [c.key, c]));
  return {
    generatedAt: prev?.generatedAt ?? null,
    mode: prev?.mode ?? "none",
    root: rootMeta(config),
    collections: config.collections.map((c) => {
      const meta = collectionMeta(c);
      const old = prevByKey.get(c.key);
      // Root mode: items are keyed to the root folder, so keep them only if it is unchanged.
      const sameRoot = rootMeta(config)?.folderId && prev?.root?.folderId === rootMeta(config).folderId;
      const keep = sameRoot ? (old?.items ?? []) : old && old.folderId === meta.folderId && meta.folderId ? old.items : [];
      return { ...meta, items: keep };
    }),
  };
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function write(path, obj) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

export async function run(env = process.env, io = { fetchImpl: fetch, base: DRIVE, tokenUrl: TOKEN_URL, paths: PATHS }) {
  const { fetchImpl, base, tokenUrl, paths } = io;
  const config = await readJson(paths.config);
  if (!config?.collections?.length) throw new Error(`${paths.config} is missing or has no collections`);
  const prev = await readJson(paths.out);
  const maxDepth = Number.isInteger(config.maxDepth) ? config.maxDepth : 4;

  const apiKey = (env.GOOGLE_API_KEY || "").trim();
  const saRaw = (env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim();
  const mode = saRaw ? "service-account" : apiKey ? "api-key" : "none";

  if (mode === "none") {
    const merged = mergeWithoutCredentials(prev, config);
    const configured = merged.root ? 1 : merged.collections.filter((c) => c.folderId).length;
    await write(paths.out, merged);
    console.log(
      configured
        ? `▸ no Drive credentials — ${configured} folder(s) linked, files not indexed. The site will offer Drive's own folder view.`
        : `▸ no Drive credentials and no folderId in content/library.config.json — library stays empty.`,
    );
    return merged;
  }

  let bearer = null;
  if (mode === "service-account") {
    let sa;
    try {
      sa = JSON.parse(saRaw);
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
    }
    if (!sa.client_email || !sa.private_key) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON lacks client_email / private_key");
    bearer = await bearerFor(sa, { fetchImpl, tokenUrl });
  }
  const list = makeClient({ apiKey: mode === "api-key" ? apiKey : null, bearer, fetchImpl, base });

  console.log(`▸ syncing Drive library (${mode})`);
  const collections = [];
  const skippedAll = [];
  let skipCounts = {};

  const root = rootMeta(config);
  if (config.root?.folderId && !root) throw new Error(`root.folderId "${config.root.folderId}" does not look like a Drive id`);

  if (root) {
    // One folder, sorted into the configured collections by assignCollection().
    const researchRe = new RegExp(config.root.researchPattern || "research", "i");
    const known = new Set(config.collections.map((c) => c.key));
    const { items, skipped, tally } = await crawl(
      list,
      {
        key: "root",
        title: "Drive library",
        folderId: root.folderId,
        resourceKey: config.root.resourceKey,
        assign: (path, kind) => {
          const k = assignCollection(path, kind, researchRe);
          return known.has(k) ? k : "other";
        },
      },
      {
        maxDepth,
        verify: mode === "service-account",
        kinds: Array.isArray(config.kinds) ? config.kinds : DEFAULT_KINDS,
        excludeFolders: config.excludeFolders || [],
      },
    );
    skippedAll.push(...skipped.map((s) => ({ collection: "root", ...s })));
    skipCounts = tally;
    for (const c of config.collections) {
      const mine = items.filter((i) => i.collection === c.key);
      collections.push({ ...collectionMeta(c), folderId: null, items: mine });
      console.log(`  ✓ ${c.key}: ${mine.length} file(s)`);
    }
    // Guard: a populated library must not silently collapse to nothing.
    const before = (prev?.root?.folderId === root.folderId ? prev.collections : []).reduce((n, c) => n + c.items.length, 0);
    if (before >= 5 && items.length === 0) {
      throw new Error(`The library had ${before} files and now returns 0. Refusing to overwrite — check sharing and the folder id.`);
    }
    const payload = { generatedAt: new Date().toISOString(), mode, root, collections };
    await write(paths.out, payload);
    await write(paths.skipped, {
      generatedAt: payload.generatedAt,
      note: "Audit trail — what was seen in the configured folder but NOT published, and why. 'counts' are bulk reasons; 'skipped' lists individual files.",
      counts: skipCounts,
      total: skippedAll.length,
      skipped: skippedAll,
    });
    for (const [r, n] of Object.entries(skipCounts).sort((a, b) => b[1] - a[1])) console.log(`  · ${n} × ${r}`);
    console.log(`\n✔ ${items.length} file(s) published · ${skippedAll.length} individually skipped`);
    return payload;
  }

  for (const c of config.collections) {
    const meta = collectionMeta(c);
    if (!meta.folderId) {
      if (c.folderId) throw new Error(`Collection "${c.key}": folderId "${c.folderId}" does not look like a Drive id`);
      collections.push({ ...meta, items: [] });
      console.log(`  · ${c.key}: no folderId — skipped`);
      continue;
    }
    const { items, skipped } = await crawl(list, { ...c, ...meta }, { maxDepth, verify: mode === "service-account" });
    collections.push({ ...meta, items });
    skippedAll.push(...skipped.map((s) => ({ collection: c.key, ...s })));
    console.log(`  ✓ ${c.key}: ${items.length} file(s), ${skipped.length} skipped`);

    // Guard: a previously populated collection must not silently collapse.
    const before = prev?.collections?.find((p) => p.key === c.key && p.folderId === meta.folderId)?.items.length ?? 0;
    if (before >= 5 && items.length === 0) {
      throw new Error(`"${c.key}" had ${before} files and now returns 0. Refusing to overwrite — check sharing and the folder id.`);
    }
  }

  const payload = { generatedAt: new Date().toISOString(), mode, root: null, collections };
  await write(paths.out, payload);
  await write(paths.skipped, {
    generatedAt: payload.generatedAt,
    note: "Audit trail — files seen in the configured folders but NOT published, and why.",
    total: skippedAll.length,
    skipped: skippedAll,
  });
  const n = collections.reduce((s, c) => s + c.items.length, 0);
  console.log(`\n✔ ${n} file(s) indexed · ${skippedAll.length} skipped`);
  return payload;
}

// Run only when executed directly, so tests can import the helpers.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    console.error(`::error::Drive sync failed: ${err.message}`);
    console.error("✖ Drive sync failed:", err.message);
    process.exit(1);
  });
}
