/**
 * App branding.
 *
 * `RawBrand` is what scripts/lib/brand-probe.mjs read from the app itself (PWA
 * manifest + <head>). It is absent for apps that could not be probed — deployment
 * protection, offline, or no manifest. `brandFor` always returns something
 * renderable, so a card never has a blank hole:
 *
 *   real theme colour  → used as-is (unless it is near-white, which would vanish)
 *   otherwise          → a deterministic colour from the palette below, keyed on
 *                        the repo name, so the same app is the same colour forever
 *   no icon            → a monogram
 *
 * `derived: true` marks a fallback, so the UI never presents an invented colour as
 * the app's own brand.
 *
 * No imports: this file is unit-tested directly by node (scripts/__tests__).
 */

export type RawBrand = {
  name?: string;
  themeColor?: string;
  icon?: string;
  image?: string;
  source: "manifest" | "html";
};

export type Brand = {
  color: string;
  /** Text colour that passes contrast on `color`. */
  fg: string;
  monogram: string;
  icon: string | null;
  image: string | null;
  derived: boolean;
};

/** Every entry clears 4.5:1 against white (asserted in the tests). */
export const FALLBACK_PALETTE = [
  "#1a5c32", // forest
  "#0f5c6b", // teal
  "#3b4a8c", // indigo
  "#8a4b14", // umber
  "#7a2e4d", // plum
  "#2b4f6e", // slate
  "#5c4a12", // olive
  "#6b3a2e", // clay
] as const;

const INK = "#0a2e1a";
const WHITE = "#ffffff";

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

/** FNV-1a — small, stable, no dependency. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** "web.krishiai.live" → "WK", "AgriChem-Guide-Pest…" → "AG", "krishak" → "KR". */
export function monogramOf(name: string): string {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0] ?? "?").slice(0, 2).toUpperCase();
}

export function readableOn(bg: string): string {
  return contrast(bg, WHITE) >= contrast(bg, INK) ? WHITE : INK;
}

export function brandFor(repoName: string, raw?: RawBrand | null): Brand {
  const real = raw && isHex(raw.themeColor) ? raw.themeColor.toLowerCase() : null;
  // A near-white theme colour (very common: #ffffff) would make the card band
  // invisible against the cream page, so treat it as "no usable colour".
  const usable = real && luminance(real) < 0.8 ? real : null;
  const color = usable ?? FALLBACK_PALETTE[hash(repoName) % FALLBACK_PALETTE.length];
  return {
    color,
    fg: readableOn(color),
    monogram: monogramOf(repoName),
    icon: raw?.icon ?? null,
    image: raw?.image ?? null,
    derived: !usable,
  };
}
