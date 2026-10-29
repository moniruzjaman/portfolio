import raw from "../data/repos.generated.json";
import { brandFor, type Brand, type RawBrand } from "./brand";

export type Channel = "custom-domain" | "vercel" | "cloudflare" | "github-pages";

export type Repo = {
  name: string;
  slug: string;
  title: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  pushedAt: string;
  url: string;
  live: string | null;
  customDomain: string | null;
  pages: string | null;
  channels: Channel[];
  readmeBytes: number;
  featured: boolean;
  /** Read from the app's own manifest/<head> at sync time; absent until then. */
  brand?: RawBrand | null;
};

export const meta = {
  generatedAt: raw.generatedAt,
  source: raw.source,
  scanned: raw.scanned,
};

export const repos: Repo[] = raw.repos as Repo[];

export const CHANNELS: Channel[] = ["custom-domain", "vercel", "cloudflare", "github-pages"];

export const CHANNEL_LABEL: Record<Channel, { en: string; bn: string }> = {
  "custom-domain": { en: "krishiai.live", bn: "krishiai.live" },
  vercel: { en: "Vercel", bn: "ভার্সেল" },
  cloudflare: { en: "Cloudflare", bn: "ক্লাউডফ্লেয়ার" },
  "github-pages": { en: "GitHub Pages", bn: "গিটহাব পেজ" },
};

export const CHANNEL_BLURB: Record<Channel, { en: string; bn: string }> = {
  "custom-domain": { en: "Apps on their own krishiai.live address", bn: "নিজস্ব krishiai.live ঠিকানায় অ্যাপ" },
  vercel: { en: "Serverless apps on *.vercel.app", bn: "*.vercel.app-এ সার্ভারলেস অ্যাপ" },
  cloudflare: { en: "Workers and Pages deployments", bn: "ওয়ার্কার ও পেজ ডিপ্লয়মেন্ট" },
  "github-pages": { en: "Static sites on github.io", bn: "github.io-তে স্ট্যাটিক সাইট" },
};

export const CHANNEL_COLOR: Record<Channel, string> = {
  "custom-domain": "var(--color-gold-400)",
  vercel: "var(--color-forest-400)",
  cloudflare: "var(--color-gold-300)",
  "github-pages": "var(--color-forest-300)",
};

export const bySlug = (slug: string): Repo | undefined => repos.find((r) => r.slug === slug);

export const brandOf = (r: Repo): Brand => brandFor(r.name, r.brand);

/* ── endpoints ─────────────────────────────────────────────────────────── */

/** `label` is host + path ("moniruzjaman.github.io/soil-media-portal"): on GitHub Pages the host alone is shared by every site. */
export type Endpoint = { channel: Channel; url: string; host: string; label: string; short: string };

const hostOf = (u: string): string => {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return u;
  }
};

/** Which showcase channel a hostname belongs to. */
export function channelOfHost(host: string): Channel | null {
  if (host === "krishiai.live" || host.endsWith(".krishiai.live")) return "custom-domain";
  if (host.endsWith(".vercel.app")) return "vercel";
  if (host.endsWith(".pages.dev") || host.endsWith(".workers.dev")) return "cloudflare";
  if (host.endsWith(".github.io")) return "github-pages";
  return null;
}

/**
 * Every distinct address a repo is served from, derived from the generated URLs.
 * The sync only records a URL if it answered, so each of these was reachable at
 * `meta.generatedAt`. (That is "reachable at last sync", not uptime.)
 */
export function endpointsOf(r: Repo): Endpoint[] {
  const seen = new Set<string>();
  const out: Endpoint[] = [];
  const add = (url: string | null, fallback: Channel) => {
    if (!url) return;
    const host = hostOf(url);
    const label = host + new URL(url).pathname.replace(/\/$/, "");
    if (seen.has(label)) return;
    seen.add(label);
    const channel = channelOfHost(host) ?? fallback;
    // On GitHub Pages every site shares one host, so the PATH is the informative part.
    const path = new URL(url).pathname.replace(/\/$/, "");
    out.push({ channel, url, host, label, short: channel === "github-pages" && path ? path : host });
  };
  add(r.customDomain, "custom-domain");
  add(r.live, "vercel");
  add(r.pages, "github-pages");
  const order = (c: Channel) => CHANNELS.indexOf(c);
  return out.sort((a, b) => order(a.channel) - order(b.channel));
}

/** The address a card should show: own domain, then live app, then Pages. */
export const primaryEndpoint = (r: Repo): Endpoint | null => endpointsOf(r)[0] ?? null;

/* ── computed stats (never hand-typed — design-system §7) ──────────────── */

const allEndpoints = repos.flatMap((r) => endpointsOf(r).map((e) => ({ ...e, repo: r })));

export type PlatformStat = {
  channel: Channel;
  apps: number;
  endpoints: number;
  hosts: string[];
};

export const platformStats: PlatformStat[] = CHANNELS.map((channel) => {
  const eps = allEndpoints.filter((e) => e.channel === channel);
  const labels = [...new Set(eps.map((e) => e.label))];
  return {
    channel,
    apps: repos.filter((r) => r.channels.includes(channel)).length,
    endpoints: labels.length,
    hosts: labels,
  };
});

export const stats = {
  repos: repos.length,
  live: repos.filter((r) => r.live || r.pages).length,
  languages: new Set(repos.map((r) => r.language).filter(Boolean)).size,
  scanned: meta.scanned,
  addresses: new Set(allEndpoints.map((e) => e.label)).size,
  branded: repos.filter((r) => r.brand).length,
};

/** Flat directory for the endpoints view: one row per distinct host. */
export const endpointDirectory = allEndpoints
  .map((e) => ({ host: e.host, label: e.label, url: e.url, channel: e.channel, repo: e.repo }))
  .sort((a, b) => CHANNELS.indexOf(a.channel) - CHANNELS.indexOf(b.channel) || a.label.localeCompare(b.label));

export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
