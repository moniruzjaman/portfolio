/**
 * brand-probe.mjs — derive an app's real branding from the app itself.
 *
 * Every app in this portfolio is a PWA, so each one already publishes its own
 * brand: a web manifest (theme_color, icons) and <head> metadata. Reading those
 * means the portfolio shows the colour and icon the app actually ships with, and
 * it stays correct when an app is rebranded — no hand-maintained brand table.
 *
 * Failure policy (deliberately the opposite of sync-repos.mjs): brand is
 * cosmetic. If a probe fails, the site falls back to a deterministic monogram and
 * palette colour (src/lib/brand.ts). That is a degraded card, not a lie, so it
 * must never abort a sync.
 *
 * Two traps this guards against:
 *   - Vercel deployment protection answers 401 with Vercel's *own* login page.
 *     Reading that would brand an app with Vercel's logo. We require a 200 and a
 *     final URL that is still on an allowed host.
 *   - SPA hosts answer unknown paths with index.html or a 404 page. We only
 *     accept a manifest that parses as JSON with an `icons` array.
 */

import { urlAllowed } from "./hosts.mjs";

const UA = "krishiai-hub-sync (+https://github.com/moniruzjaman/portfolio)";
const MAX_HTML = 600_000;

/* ── tiny, dependency-free tag parsing ────────────────────────────────── */

function attrs(tag) {
  const out = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(tag.replace(/^<\w+/, "").replace(/\/?>$/, "")))) {
    out[m[1].toLowerCase()] = (m[2] ?? m[3] ?? m[4] ?? "").trim();
  }
  return out;
}

function tags(html, name) {
  const re = new RegExp(`<${name}\\b[^>]*>`, "gi");
  return (html.match(re) || []).map(attrs);
}

export function normaliseHex(v) {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  const m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (!m) return null;
  const h = m[1];
  return "#" + (h.length === 3 ? [...h].map((c) => c + c).join("") : h);
}

const resolve = (href, base, allow = urlAllowed) => {
  if (!href) return null;
  try {
    const u = new URL(href, base);
    return allow(u.href) ? u.href : null;
  } catch {
    return null;
  }
};

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

/** Largest declared size from "48x48 96x96", or 0 for "any"/missing. */
function maxSize(sizes) {
  if (!sizes) return 0;
  return Math.max(0, ...sizes.split(/\s+/).map((s) => Number(s.split("x")[0]) || 0));
}

/* ── <head> metadata ──────────────────────────────────────────────────── */

export function parseHtml(html, baseUrl, allow = urlAllowed) {
  const metas = tags(html, "meta");
  const links = tags(html, "link");
  const meta = (key) =>
    metas.find((m) => (m.name || m.property || "").toLowerCase() === key)?.content;

  const themeColor = metas
    .filter((m) => (m.name || "").toLowerCase() === "theme-color")
    .map((m) => normaliseHex(m.content))
    .find(Boolean) ?? null;

  const rels = (rel) => links.filter((l) => (l.rel || "").toLowerCase().split(/\s+/).includes(rel));

  // Prefer a real raster/touch icon (crisp on a card) over the favicon.
  const touch = rels("apple-touch-icon").sort((a, b) => maxSize(b.sizes) - maxSize(a.sizes))[0];
  const icons = [...rels("icon"), ...rels("shortcut")]
    .filter((l) => l.href)
    .sort((a, b) => maxSize(b.sizes) - maxSize(a.sizes));
  const svg = icons.find((l) => /svg/.test(l.type || "") || /\.svg(\?|$)/i.test(l.href));
  const iconHref = (touch || svg || icons[0])?.href;

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

  return {
    name: decode(meta("og:site_name") || meta("application-name") || titleTag || "") || null,
    description: decode(meta("og:description") || meta("description") || "") || null,
    themeColor,
    icon: resolve(iconHref, baseUrl, allow),
    image: resolve(meta("og:image"), baseUrl, allow),
    manifest: resolve(rels("manifest")[0]?.href, baseUrl, allow),
  };
}

/* ── web app manifest ─────────────────────────────────────────────────── */

export function parseManifest(json, manifestUrl, allow = urlAllowed) {
  if (!json || typeof json !== "object" || !Array.isArray(json.icons)) return null;
  const usable = json.icons
    .filter((i) => i && typeof i.src === "string" && !/maskable/.test(i.purpose || ""))
    .map((i) => ({ ...i, px: maxSize(i.sizes) }));
  // Pick the smallest icon that is still >=192px (sharp, but not a 1MB asset);
  // else the largest available.
  const sharp = usable.filter((i) => i.px >= 192).sort((a, b) => a.px - b.px)[0];
  const best = sharp || usable.sort((a, b) => b.px - a.px)[0];
  return {
    name: json.short_name || json.name || null,
    themeColor: normaliseHex(json.theme_color),
    backgroundColor: normaliseHex(json.background_color),
    icon: resolve(best?.src, manifestUrl, allow),
  };
}

/* ── fetch ────────────────────────────────────────────────────────────── */

async function get(url, fetchImpl, accept) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetchImpl(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: accept },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {string} url  a live deployment URL
 * @param {{fetchImpl?: typeof fetch, allowUrl?: (u:string)=>boolean}} [opts]
 * @returns {Promise<null | {name?:string, themeColor?:string, icon?:string, image?:string, source:"manifest"|"html"}>}
 */
export async function probeBrand(url, opts = {}) {
  const fetchImpl = opts.fetchImpl || fetch;
  const allow = opts.allowUrl || urlAllowed;
  if (!url || !allow(url)) return null;

  try {
    const res = await get(url, fetchImpl, "text/html");
    // 200 only: a 401 here is Vercel's login wall, not the app.
    if (res.status !== 200) return null;
    if (res.url && !allow(res.url)) return null; // bounced to an SSO/login host
    const html = (await res.text()).slice(0, MAX_HTML);
    const page = parseHtml(html, res.url || url, allow);

    let man = null;
    if (page.manifest) {
      try {
        const mres = await get(page.manifest, fetchImpl, "application/manifest+json,application/json");
        if (mres.status === 200) man = parseManifest(await mres.json(), mres.url || page.manifest, allow);
      } catch {
        /* a broken manifest is not fatal — the <head> still has brand data */
      }
    }

    const themeColor = man?.themeColor || page.themeColor || null;
    const icon = man?.icon || page.icon || null;
    const brand = {
      name: man?.name || page.name || undefined,
      themeColor: themeColor || undefined,
      icon: icon || undefined,
      image: page.image || undefined,
      source: man ? "manifest" : "html",
    };
    if (!brand.themeColor && !brand.icon && !brand.image) return null;
    return Object.fromEntries(Object.entries(brand).filter(([, v]) => v !== undefined));
  } catch {
    return null;
  }
}
