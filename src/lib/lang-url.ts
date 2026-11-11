/**
 * Language ↔ URL mapping, shared by the app and the build scripts'
 * expectations (prerender.mjs / gen-static.mjs rebuild the same joins).
 *
 * English is the unprefixed default; Bangla lives under a /bn prefix:
 *   /portfolio/about   →  en
 *   /portfolio/bn/about → bn
 *
 * Paths here are BASE-stripped (what wouter's useLocation returns). Import
 * graph note: this module must stay dependency-light (only site.ts) — both
 * i18n.tsx and seo.ts sit on top of it, and neither may import the other.
 */
import { BASE_URL } from "@/lib/site";

export type Lang = "en" | "bn";

export const LANGS: Lang[] = ["en", "bn"];

/** Split a base-stripped path into its language and the clean route path. */
export const splitLangPath = (path: string): { lang: Lang; clean: string } => {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/bn" || p.startsWith("/bn/")) {
    return { lang: "bn", clean: p.slice(3) || "/" };
  }
  return { lang: "en", clean: p };
};

/** Join a language back onto a clean route path (base-stripped). */
export const joinLang = (lang: Lang, clean: string): string =>
  lang === "bn" ? `/bn${clean === "/" ? "/" : clean}` : clean;

/**
 * Absolute href for a language variant of a base-stripped path, used by the
 * nav switcher and the hreflang alternates. Mirrors canonicalForLang in
 * src/lib/seo.ts — both must produce the same URLs.
 */
export const hrefFor = (lang: Lang, cleanPath: string): string => {
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  const tail = cleanPath === "/" ? "" : cleanPath.slice(1);
  return `${base}${lang === "bn" ? "bn/" : ""}${tail}`;
};
