import raw from "../data/repos.generated.json";

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
};

export const meta = {
  generatedAt: raw.generatedAt,
  source: raw.source,
  scanned: raw.scanned,
  channels: raw.channels as Record<string, number>,
};

export const repos: Repo[] = raw.repos as Repo[];

export const CHANNEL_LABEL: Record<Channel, { en: string; bn: string }> = {
  "custom-domain": { en: "Custom domain", bn: "কাস্টম ডোমেইন" },
  vercel: { en: "Vercel", bn: "ভার্সেল" },
  cloudflare: { en: "Cloudflare", bn: "ক্লাউডফ্লেয়ার" },
  "github-pages": { en: "GitHub Pages", bn: "গিটহাব পেজ" },
};

export const CHANNEL_COLOR: Record<Channel, string> = {
  "custom-domain": "var(--color-gold-400)",
  vercel: "var(--color-forest-400)",
  cloudflare: "var(--color-gold-300)",
  "github-pages": "var(--color-forest-300)",
};

export const bySlug = (slug: string): Repo | undefined =>
  repos.find((r) => r.slug === slug);

/** Counted live from the generated data, never hand-typed — see blueprint §10. */
export const stats = {
  repos: repos.length,
  live: repos.filter((r) => r.live || r.pages).length,
  languages: new Set(repos.map((r) => r.language).filter(Boolean)).size,
  scanned: meta.scanned,
};

export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
