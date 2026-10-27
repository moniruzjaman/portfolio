import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateKeyPairSync, createVerify } from "node:crypto";
import { kindOf, titleOf, signJwt, mergeWithoutCredentials, run } from "../sync-drive.mjs";

const FOLDER = "application/vnd.google-apps.folder";
const id = (n) => `file_${String(n).padStart(12, "0")}`; // passes the 10+ char id check

/** Mock Drive: tree[parentId] = files. Records requests. */
function mockDrive(tree, { status = {} } = {}) {
  const seen = [];
  const s = http.createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    seen.push({ path: u.pathname, q: u.searchParams.get("q"), key: u.searchParams.get("key"), auth: req.headers.authorization });
    if (u.pathname === "/token") {
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ access_token: "tok123" }));
      return;
    }
    const parent = u.searchParams.get("q")?.match(/'([^']+)' in parents/)?.[1];
    if (status[parent]) { res.writeHead(status[parent]).end("{}"); return; }
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ files: tree[parent] || [] }));
  });
  return new Promise((ok) => s.listen(0, "127.0.0.1", () => ok({ s, seen, url: `http://127.0.0.1:${s.address().port}` })));
}

async function setup(config, prev) {
  const dir = await mkdtemp(join(tmpdir(), "lib-"));
  const paths = { config: join(dir, "c.json"), out: join(dir, "out.json"), skipped: join(dir, "skip.json") };
  await writeFile(paths.config, JSON.stringify(config));
  if (prev) await writeFile(paths.out, JSON.stringify(prev));
  return paths;
}
const col = (key, folderId) => ({ key, title: key, titleBn: key, description: "", descriptionBn: "", folderId });
const quiet = async (fn) => { const l = console.log; console.log = () => {}; try { return await fn(); } finally { console.log = l; } };

test("kindOf / titleOf", () => {
  assert.equal(kindOf("application/pdf"), "pdf");
  assert.equal(kindOf("application/octet-stream", "talk.PPTX"), "slides");
  assert.equal(kindOf("application/vnd.google-apps.presentation"), "slides");
  assert.equal(kindOf("application/vnd.google-apps.document"), "doc");
  assert.equal(kindOf("x/y"), "other");
  assert.equal(titleOf("NPK_Guide-2025_final.pdf"), "NPK Guide – 2025 final");
  assert.equal(titleOf("মাটি স্বাস্থ্য.pdf"), "মাটি স্বাস্থ্য");
});

test("service-account JWT is a valid RS256 signature over the right claims", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  const jwt = signJwt({ client_email: "sa@p.iam.gserviceaccount.com", private_key: privateKey }, 1000);
  const [h, c, sig] = jwt.split(".");
  assert.ok(createVerify("RSA-SHA256").update(`${h}.${c}`).verify(publicKey, Buffer.from(sig, "base64url")));
  const claim = JSON.parse(Buffer.from(c, "base64url"));
  assert.equal(claim.iss, "sa@p.iam.gserviceaccount.com");
  assert.equal(claim.scope, "https://www.googleapis.com/auth/drive.readonly");
  assert.equal(claim.exp - claim.iat, 3300);
});

test("api-key mode: recurses sub-folders, records path, skips shortcuts, writes no secret", async () => {
  const m = await mockDrive({
    ROOTFOLDER01: [
      { id: id(1), name: "Brief_2026.pdf", mimeType: "application/pdf", modifiedTime: "2026-03-01T00:00:00Z", size: "2048" },
      { id: id(2), name: "Decks", mimeType: FOLDER },
      { id: id(3), name: "link", mimeType: "application/vnd.google-apps.shortcut" },
    ],
    [id(2)]: [{ id: id(4), name: "Training.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", modifiedTime: "2026-05-01T00:00:00Z" }],
  });
  const paths = await setup({ collections: [col("pdf", "ROOTFOLDER01")] });
  const out = await quiet(() => run({ GOOGLE_API_KEY: "KEY_SECRET_VALUE" }, { fetchImpl: fetch, base: m.url, tokenUrl: m.url + "/token", paths }));
  m.s.close();
  const items = out.collections[0].items;
  assert.deepEqual(items.map((i) => i.title), ["Training", "Brief 2026"], "newest first");
  assert.deepEqual(items[0].path, ["Decks"]);
  assert.equal(items[0].kind, "slides");
  assert.ok(m.seen.every((r) => r.key === "KEY_SECRET_VALUE"));
  assert.equal(JSON.parse(await readFile(paths.skipped)).skipped[0].reason, "shortcut (target not followed)");
  assert.ok(!(await readFile(paths.out, "utf8")).includes("KEY_SECRET_VALUE"), "key must never reach the output file");
});

test("service-account mode FAILS CLOSED: private and unverifiable files are skipped", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  const m = await mockDrive({
    ROOTFOLDER01: [
      { id: id(1), name: "public.pdf", mimeType: "application/pdf", permissions: [{ type: "anyone", role: "reader" }] },
      { id: id(2), name: "private.pdf", mimeType: "application/pdf", permissions: [{ type: "user", role: "owner" }] },
      { id: id(3), name: "unknown.pdf", mimeType: "application/pdf" },
    ],
  });
  const paths = await setup({ collections: [col("pdf", "ROOTFOLDER01")] });
  const sa = JSON.stringify({ client_email: "sa@p.iam.gserviceaccount.com", private_key: privateKey });
  const out = await quiet(() => run({ GOOGLE_SERVICE_ACCOUNT_JSON: sa }, { fetchImpl: fetch, base: m.url, tokenUrl: m.url + "/token", paths }));
  m.s.close();
  assert.deepEqual(out.collections[0].items.map((i) => i.name), ["public.pdf"]);
  const skipped = JSON.parse(await readFile(paths.skipped)).skipped.map((s) => s.reason);
  assert.deepEqual(skipped.sort(), ["not shared publicly", "permissions not readable — failing closed"]);
  assert.ok(m.seen.some((r) => r.auth === "Bearer tok123"));
  const written = await readFile(paths.out, "utf8");
  assert.ok(!written.includes("PRIVATE KEY") && !written.includes("iam.gserviceaccount"));
});

test("an unreadable folder ABORTS and leaves the previous data untouched", async () => {
  const m = await mockDrive({}, { status: { ROOTFOLDER01: 404 } });
  const prev = { generatedAt: "2026-01-01T00:00:00Z", mode: "api-key", collections: [{ ...col("pdf", "ROOTFOLDER01"), items: [{ id: id(1), title: "kept" }] }] };
  const paths = await setup({ collections: [col("pdf", "ROOTFOLDER01")] }, prev);
  await assert.rejects(() => quiet(() => run({ GOOGLE_API_KEY: "k" }, { fetchImpl: fetch, base: m.url, tokenUrl: m.url, paths })), /not readable \(404\)/);
  m.s.close();
  assert.equal(JSON.parse(await readFile(paths.out)).collections[0].items[0].title, "kept");
});

test("a populated collection collapsing to zero files refuses to overwrite", async () => {
  const m = await mockDrive({ ROOTFOLDER01: [] });
  const items = Array.from({ length: 6 }, (_, n) => ({ id: id(n), title: `t${n}` }));
  const prev = { generatedAt: "x", mode: "api-key", collections: [{ ...col("pdf", "ROOTFOLDER01"), items }] };
  const paths = await setup({ collections: [col("pdf", "ROOTFOLDER01")] }, prev);
  await assert.rejects(() => quiet(() => run({ GOOGLE_API_KEY: "k" }, { fetchImpl: fetch, base: m.url, tokenUrl: m.url, paths })), /Refusing to overwrite/);
  m.s.close();
});

test("a malformed folderId is a config error, not a silent skip", async () => {
  const paths = await setup({ collections: [col("pdf", "bad id!")] });
  await assert.rejects(() => quiet(() => run({ GOOGLE_API_KEY: "k" }, { fetchImpl: fetch, base: "http://127.0.0.1:1", tokenUrl: "", paths })), /does not look like a Drive id/);
});

test("no credentials: links folders, keeps items only for an unchanged folder, never fails", async () => {
  const prev = { generatedAt: "t", mode: "api-key", collections: [
    { ...col("pdf", "ROOTFOLDER01"), items: [{ id: id(1) }] },
    { ...col("pptx", "OLDFOLDER0001"), items: [{ id: id(2) }] } ] };
  const merged = mergeWithoutCredentials(prev, { collections: [col("pdf", "ROOTFOLDER01"), col("pptx", "NEWFOLDER0001"), col("research", null)] });
  assert.equal(merged.collections[0].items.length, 1, "same folder keeps its index");
  assert.equal(merged.collections[1].items.length, 0, "changed folder drops stale files");
  assert.equal(merged.collections[2].folderId, null);
  const paths = await setup({ collections: [col("pdf", "ROOTFOLDER01")] });
  const out = await quiet(() => run({}, { fetchImpl: () => { throw new Error("no network expected"); }, base: "", tokenUrl: "", paths }));
  assert.equal(out.collections[0].folderId, "ROOTFOLDER01");
});

/* ── single root folder, sorted automatically ───────────────────────── */
import { assignCollection } from "../sync-drive.mjs";

test("assignCollection: research folder wins, then type, then other", () => {
  const re = /research|paper|গবেষণা/i;
  assert.equal(assignCollection(["Research 2025"], "pdf", re), "research", "a PDF inside a research folder is research, not pdf");
  assert.equal(assignCollection(["গবেষণা"], "doc", re), "research", "Bangla folder name matches");
  assert.equal(assignCollection([], "pdf", re), "pdf");
  assert.equal(assignCollection(["Trainings"], "slides", re), "pptx");
  assert.equal(assignCollection([], "sheet", re), "other");
  assert.equal(assignCollection(["Misc", "Research"], "pdf", re), "pdf", "only the TOP-level folder name decides");
});

test("root mode: one folder is crawled once and sorted into collections", async () => {
  const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  const m = await mockDrive({
    ROOTFOLDER01: [
      { id: id(1), name: "Loose.pdf", mimeType: "application/pdf", modifiedTime: "2026-01-01T00:00:00Z" },
      { id: id(2), name: "Research", mimeType: FOLDER },
      { id: id(3), name: "Talks", mimeType: FOLDER },
      { id: id(4), name: "budget.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    ],
    [id(2)]: [{ id: id(5), name: "Trial.pdf", mimeType: "application/pdf", modifiedTime: "2026-02-01T00:00:00Z" }],
    [id(3)]: [{ id: id(6), name: "Deck.pptx", mimeType: PPTX, modifiedTime: "2026-03-01T00:00:00Z" }],
  });
  const config = { kinds: ["pdf", "slides", "doc", "sheet"], root: { folderId: "ROOTFOLDER01", researchPattern: "research" }, collections: ["research", "pdf", "pptx", "other"].map((k) => col(k, null)) };
  const paths = await setup(config);
  const out = await quiet(() => run({ GOOGLE_API_KEY: "k" }, { fetchImpl: fetch, base: m.url, tokenUrl: "", paths }));
  m.s.close();
  const by = Object.fromEntries(out.collections.map((c) => [c.key, c.items.map((i) => i.title)]));
  assert.deepEqual(by, { research: ["Trial"], pdf: ["Loose"], pptx: ["Deck"], other: ["budget"] });
  assert.equal(out.root.folderId, "ROOTFOLDER01");
  assert.equal(m.seen.filter((r) => r.q?.includes("'ROOTFOLDER01'")).length, 1, "root listed once, not once per collection");
});

test("root mode, no credentials: root is kept so the site can embed the folder", () => {
  const config = { root: { folderId: "ROOTFOLDER01" }, collections: [col("pdf", null)] };
  const merged = mergeWithoutCredentials(null, config);
  assert.equal(merged.root.folderId, "ROOTFOLDER01");
  const kept = mergeWithoutCredentials({ root: { folderId: "ROOTFOLDER01" }, collections: [{ ...col("pdf", null), items: [{ id: "a" }] }] }, config);
  assert.equal(kept.collections[0].items.length, 1, "same root keeps its index");
  const dropped = mergeWithoutCredentials({ root: { folderId: "OTHERFOLDER01" }, collections: [{ ...col("pdf", null), items: [{ id: "a" }] }] }, config);
  assert.equal(dropped.collections[0].items.length, 0, "changed root drops stale files");
});

/* ── publish documents only; never enter excluded folders ────────────── */
import { DEFAULT_KINDS } from "../sync-drive.mjs";

test("a project-dump folder publishes documents only, and counts what it skipped", async () => {
  const m = await mockDrive({
    ROOTFOLDER01: [
      { id: id(1), name: "Report.pdf", mimeType: "application/pdf", modifiedTime: "2026-01-01T00:00:00Z" },
      { id: id(2), name: "logo.png", mimeType: "image/png" },
      { id: id(3), name: "site.zip", mimeType: "application/zip" },
      { id: id(4), name: "index.html", mimeType: "text/html" },
      { id: id(5), name: "clip.mp4", mimeType: "video/mp4" },
      { id: id(6), name: "budget.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
      { id: id(7), name: "Notes.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", modifiedTime: "2026-02-01T00:00:00Z" },
    ],
  });
  const config = { root: { folderId: "ROOTFOLDER01" }, collections: ["research", "pdf", "pptx", "other"].map((k) => col(k, null)) };
  const paths = await setup(config);
  const out = await quiet(() => run({ GOOGLE_API_KEY: "k" }, { fetchImpl: fetch, base: m.url, tokenUrl: "", paths }));
  m.s.close();
  assert.deepEqual(DEFAULT_KINDS, ["pdf", "slides", "doc"]);
  const titles = out.collections.flatMap((c) => c.items.map((i) => i.title)).sort();
  assert.deepEqual(titles, ["Notes", "Report"], "images, zips, html, video and spreadsheets are not published");
  const audit = JSON.parse(await readFile(paths.skipped));
  assert.equal(audit.counts["file type not published: image"], 1);
  assert.equal(audit.counts["file type not published: sheet"], 1);
  assert.equal(audit.total, 0, "bulk type skips are counted, not listed file by file");
});

test("config.kinds can widen what is published", async () => {
  const m = await mockDrive({ ROOTFOLDER01: [{ id: id(1), name: "data.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }] });
  const config = { kinds: ["pdf", "sheet"], root: { folderId: "ROOTFOLDER01" }, collections: [col("other", null)] };
  const paths = await setup(config);
  const out = await quiet(() => run({ GOOGLE_API_KEY: "k" }, { fetchImpl: fetch, base: m.url, tokenUrl: "", paths }));
  m.s.close();
  assert.equal(out.collections[0].items.length, 1);
});

test("excludeFolders: matched case-insensitively at any depth and NEVER entered", async () => {
  const m = await mockDrive({
    ROOTFOLDER01: [
      { id: id(1), name: "Keep", mimeType: FOLDER },
      { id: id(2), name: "Private Stuff", mimeType: FOLDER },
    ],
    [id(1)]: [
      { id: id(3), name: "Nested", mimeType: FOLDER },
      { id: id(4), name: "ok.pdf", mimeType: "application/pdf" },
    ],
    [id(3)]: [{ id: id(5), name: "PRIVATE STUFF", mimeType: FOLDER }],
    [id(2)]: [{ id: id(6), name: "secret.pdf", mimeType: "application/pdf" }],
    [id(5)]: [{ id: id(7), name: "deep-secret.pdf", mimeType: "application/pdf" }],
  });
  const config = { excludeFolders: ["private stuff"], root: { folderId: "ROOTFOLDER01" }, collections: [col("pdf", null)] };
  const paths = await setup(config);
  const out = await quiet(() => run({ GOOGLE_API_KEY: "k" }, { fetchImpl: fetch, base: m.url, tokenUrl: "", paths }));
  m.s.close();
  assert.deepEqual(out.collections[0].items.map((i) => i.title), ["ok"]);
  const listed = m.seen.map((r) => r.q).join(" ");
  assert.ok(!listed.includes(id(2)) && !listed.includes(id(5)), "an excluded folder must never be listed from Drive at all");
  const audit = JSON.parse(await readFile(paths.skipped));
  assert.equal(audit.counts["folder excluded by config: Private Stuff"], 1);
  assert.equal(audit.counts["folder excluded by config: PRIVATE STUFF"], 1);
});
