import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { parseHtml, parseManifest, normaliseHex, probeBrand } from "../lib/brand-probe.mjs";
import { urlAllowed } from "../lib/hosts.mjs";
import { brandFor, FALLBACK_PALETTE, contrast, monogramOf } from "../../src/lib/brand.ts";

const BASE = "https://app.krishiai.live/";

test("parseHtml reads theme colour, touch icon, og image regardless of attribute order/quotes", () => {
  const html = `<head><title>Soil &amp; Media</title>
    <meta content='#1A5C32' name="theme-color">
    <link href="/icons/180.png" sizes="180x180" rel="apple-touch-icon">
    <link rel="icon" href="/favicon.ico">
    <meta property="og:image" content="/og.png">
    <link rel="manifest" href=/manifest.webmanifest></head>`;
  const r = parseHtml(html, BASE);
  assert.equal(r.themeColor, "#1a5c32");
  assert.equal(r.icon, "https://app.krishiai.live/icons/180.png");
  assert.equal(r.image, "https://app.krishiai.live/og.png");
  assert.equal(r.manifest, "https://app.krishiai.live/manifest.webmanifest");
  assert.equal(r.name, "Soil & Media");
});

test("off-allowlist icon hosts are dropped, not stored", () => {
  const r = parseHtml(`<link rel="icon" href="https://evil.example/i.png"><meta property="og:image" content="https://tracker.example/x.png">`, BASE);
  assert.equal(r.icon, null);
  assert.equal(r.image, null);
});

test("normaliseHex accepts only real hex colours", () => {
  assert.equal(normaliseHex("#abc"), "#aabbcc");
  for (const bad of ["red", "rgb(0,0,0)", "#12", "#gggggg", "", null, undefined, 5]) assert.equal(normaliseHex(bad), null);
});

test("parseManifest picks the smallest sharp icon, skips maskable, rejects non-manifests", () => {
  const m = parseManifest(
    { short_name: "Krishak", theme_color: "#0f5c6b", icons: [
      { src: "a-48.png", sizes: "48x48" }, { src: "a-192.png", sizes: "192x192" },
      { src: "a-512.png", sizes: "512x512" }, { src: "a-mask.png", sizes: "192x192", purpose: "maskable" } ] },
    "https://app.krishiai.live/manifest.json");
  assert.equal(m.icon, "https://app.krishiai.live/a-192.png");
  assert.equal(m.themeColor, "#0f5c6b");
  assert.equal(parseManifest({ nope: 1 }, BASE), null);
  assert.equal(parseManifest("<html>", BASE), null);
});

/* ── end-to-end against a local server ─────────────────────────────── */
function serve(routes) {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const r = routes[req.url];
      if (!r) { res.writeHead(404).end("nope"); return; }
      res.writeHead(r.status ?? 200, { "content-type": r.type ?? "text/html" }).end(r.body);
    }).listen(0, "127.0.0.1", () => ok({ s, url: `http://127.0.0.1:${s.address().port}` }));
  });
}
const any = { allowUrl: () => true };

test("probeBrand: manifest wins over <head>, source recorded", async () => {
  const { s, url } = await serve({
    "/": { body: `<meta name="theme-color" content="#111111"><link rel="manifest" href="/m.json"><link rel="icon" href="/f.png">` },
    "/m.json": { type: "application/json", body: JSON.stringify({ theme_color: "#1a5c32", icons: [{ src: "/i.png", sizes: "192x192" }] }) },
  });
  const b = await probeBrand(url + "/", any);
  s.close();
  assert.equal(b.source, "manifest");
  assert.equal(b.themeColor, "#1a5c32");
  assert.match(b.icon, /\/i\.png$/);
});

test("probeBrand: a 401 (Vercel deployment protection) is NOT read as the app's brand", async () => {
  const { s, url } = await serve({ "/": { status: 401, body: `<meta name="theme-color" content="#000000"><link rel="icon" href="/vercel-logo.svg">` } });
  const b = await probeBrand(url + "/", any);
  s.close();
  assert.equal(b, null);
});

test("probeBrand: broken manifest degrades to <head>, never throws", async () => {
  const { s, url } = await serve({
    "/": { body: `<meta name="theme-color" content="#3b4a8c"><link rel="manifest" href="/m.json">` },
    "/m.json": { type: "application/json", body: "{not json" },
  });
  const b = await probeBrand(url + "/", any);
  s.close();
  assert.equal(b.source, "html");
  assert.equal(b.themeColor, "#3b4a8c");
});

test("probeBrand: refuses off-allowlist URLs by default (SSRF / wrong-host guard)", async () => {
  assert.equal(await probeBrand("http://127.0.0.1:1/"), null);
  assert.equal(urlAllowed("https://x.vercel.app/"), true);
  assert.equal(urlAllowed("https://x.pages.dev/"), true);
  assert.equal(urlAllowed("https://vercel.com/login"), false);
});

/* ── front-end fallback ────────────────────────────────────────────── */
test("every fallback colour clears 4.5:1 with white text", () => {
  for (const c of FALLBACK_PALETTE) assert.ok(contrast(c, "#ffffff") >= 4.5, `${c} = ${contrast(c, "#ffffff").toFixed(2)}`);
});

test("brandFor: deterministic, never blank, honest about derived colours", () => {
  const a = brandFor("krishak-card"), b = brandFor("krishak-card");
  assert.deepEqual(a, b);
  assert.equal(a.derived, true);
  assert.equal(brandFor("x", { themeColor: "#ffffff", source: "html" }).derived, true, "near-white is unusable as a band colour");
  const real = brandFor("x", { themeColor: "#1a5c32", icon: "https://a.vercel.app/i.png", source: "manifest" });
  assert.equal(real.derived, false);
  assert.equal(real.color, "#1a5c32");
  assert.equal(real.icon, "https://a.vercel.app/i.png");
  // chosen foreground always readable
  for (const c of ["#1a5c32", "#e3ba45", "#f0f0f0", "#000000"]) {
    const x = brandFor("n", { themeColor: c, source: "html" });
    assert.ok(contrast(x.color, x.fg) >= 4.5, `${c}`);
  }
});

test("monogramOf", () => {
  assert.equal(monogramOf("web.krishiai.live"), "WK");
  assert.equal(monogramOf("krishak"), "KR");
  assert.equal(monogramOf("পেস্টি"), "?");
});
