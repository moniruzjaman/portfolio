import { useEffect } from "react";
import { repos } from "@/lib/data";
import { summaryFor, titleFor } from "@/lib/curation";
import { notes } from "@/content/notes";
import { BASE_URL } from "@/lib/site";

/**
 * Route metadata in one place — titles, descriptions, canonicals, OG tags and
 * JSON-LD. scripts/prerender.mjs injects this into the static HTML of every
 * route at build time, and useDocumentMeta applies it again on client-side
 * navigation, so crawlers and SPA navigation always agree.
 *
 * Descriptions here are authored copy, not computed claims (design-system §7
 * is about numbers); anything that CAN be computed, is.
 */

const ORIGIN = import.meta.env.VITE_SITE_ORIGIN || "https://moniruzjaman.github.io";
export const SITE = `${ORIGIN}${BASE_URL}`;

export const canonicalFor = (path: string): string =>
  `${SITE}${path === "/" ? "" : path.replace(/^\//, "")}`;

const AUTHOR = {
  name: "Abu Md. Moniruzjaman",
  url: SITE,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: AUTHOR.name,
  jobTitle: "Additional Deputy Director (Horticulture)",
  worksFor: {
    "@type": "GovernmentOrganization",
    name: "Department of Agricultural Extension (DAE), Government of Bangladesh",
  },
  url: SITE,
  email: "mailto:mithun.hstu@gmail.com",
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Hajee Mohammad Danesh Science and Technology University",
    },
    { "@type": "CollegeOrUniversity", name: "North South University" },
  ],
  knowsAbout: [
    "Agricultural Extension",
    "Horticulture",
    "Integrated Pest Management",
    "CABI Plantwise",
    "Digital Agriculture",
    "Farmer Field Schools",
  ],
  image: `${SITE}portrait.jpg`,
  sameAs: [
    "https://github.com/moniruzjaman",
    "https://www.linkedin.com/in/abu-md-moniruzjaman-a55b5034/",
    "https://www.facebook.com/moniruzjaman2021",
    "https://www.youtube.com/@AgriWisdomBd",
  ],
};

const breadcrumb = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: canonicalFor(item.path),
  })),
});

const workBySlug = (slug: string) => repos.find((r) => r.slug === slug);
const noteBySlug = (slug: string) => notes.find((n) => n.slug === slug);

type RouteMeta = {
  title: string;
  description: string;
  /** og:type — "website" everywhere except notes, which are articles. */
  ogType: "website" | "article";
  /** JSON-LD objects, injected as one <script type="application/ld+json"> each. */
  jsonLd: object[];
  /** Clean card title for the generated OG image (no site suffix). */
  ogTitle?: string;
  /** Bangla card title, when the content has one. */
  bnTitle?: string;
};

const STATIC_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Abu Md. Moniruzjaman — Portfolio · Agricultural Extension & Digital Tools",
    description:
      "Portfolio of Abu Md. Moniruzjaman — Additional Deputy Director (Horticulture), DAE Bangladesh, and builder of digital tools for smallholder farmers. Selected work, career, and field writing.",
  },
  "/works": {
    title: "Work — Abu Md. Moniruzjaman",
    description:
      "The live ecosystem of digital tools for agricultural extension — every published repository with a real deployment channel, generated daily, never hand-maintained.",
  },
  "/topics": {
    title: "Research topics — Abu Md. Moniruzjaman",
    description:
      "The catalogue grouped into research themes — crop diagnosis, soil health, pesticide regulation and the Bengali-first Krishi AI platform, each linked to the notes that document its method.",
  },
  "/library": {
    title: "Library — Abu Md. Moniruzjaman",
    description:
      "Research, documents, presentations and videos from the author's Google Drive — indexed at sync time, previewable in place.",
  },
  "/expertise": {
    title: "Expertise — Abu Md. Moniruzjaman",
    description:
      "An expertise map built from real field systems — the published repositories translated into working agricultural workflows.",
  },
  "/notes": {
    title: "Writing — Abu Md. Moniruzjaman",
    description:
      "Field guides, policy briefs and method notes on agricultural extension, soil health and digital tools for Bangladesh.",
  },
  "/about": {
    title: "About — Abu Md. Moniruzjaman",
    description:
      "Abu Md. Moniruzjaman — Additional Deputy Director (Horticulture), DAE Kurigram. Career, education and the thinking behind the tools.",
  },
};

/** Metadata for a router-relative path ("/works/krishi-ai"). */
export function routeMeta(path: string): RouteMeta {
  // routePaths spells the home route "" (dist/index.html has no directory),
  // while the router, STATIC_META and the client all call it "/" — normalize
  // here so a caller's spelling can't silently resolve to the 404 fallback.
  const p = path === "" ? "/" : path;
  const staticMeta = STATIC_META[p];
  if (staticMeta) {
    // The Person record belongs on the two identity pages only (brief 2.2).
    const jsonLd = p === "/" || p === "/about" ? [personJsonLd] : [];
    const ogTitle = staticMeta.title.split(" — Abu Md. Moniruzjaman")[0];
    return { ...staticMeta, ogType: "website", jsonLd, ogTitle };
  }

  if (path.startsWith("/works/")) {
    const r = workBySlug(path.slice("/works/".length));
    if (r) {
      const title = `${titleFor(r, "en") || r.name} — Work`;
      const cleanTitle = titleFor(r, "en") || r.name;
      const description = summaryFor(r, "en") || r.description || r.name;
      const url = canonicalFor(path);
      return {
        title,
        description,
        ogType: "website",
        ogTitle: cleanTitle,
        bnTitle: titleFor(r, "bn") || undefined,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: titleFor(r, "en") || r.name,
            alternateName: titleFor(r, "bn") || undefined,
            description,
            url,
            applicationCategory: r.live ? "WebApplication" : "SoftwareApplication",
            operatingSystem: "Web",
            inLanguage: ["en", "bn"],
            author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
          },
          breadcrumb([
            { name: "Work", path: "/works" },
            { name: titleFor(r, "en") || r.name, path },
          ]),
        ],
      };
    }
  }

  if (path.startsWith("/notes/")) {
    const n = noteBySlug(path.slice("/notes/".length));
    if (n) {
      const title = `${n.title} — Writing`;
      const url = canonicalFor(path);
      return {
        title,
        description: n.summary,
        ogType: "article",
        ogTitle: n.title,
        bnTitle: n.titleBn || undefined,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: n.title,
            alternateHeadline: n.titleBn || undefined,
            description: n.summary,
            // Year-precision (registry derives YYYY-01-01); real dates pending.
            datePublished: n.datePublished || `${n.year}-01-01`,
            author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
            mainEntityOfPage: url,
            inLanguage: ["en", "bn"],
          },
          breadcrumb([
            { name: "Writing", path: "/notes" },
            { name: n.title, path },
          ]),
        ],
      };
    }
  }

  // Unknown paths render Not Found; noindex comes from 404.html + robots.
  return {
    title: "Page not found — Abu Md. Moniruzjaman",
    description: "This page does not exist.",
    ogType: "website",
    jsonLd: [],
  };
}

/**
 * The generated OG card for a route, relative to SITE (brief 2.3). The image
 * itself is produced by scripts/prerender.mjs with satori at build time.
 */
export const ogImageFor = (path: string): string =>
  `og/${path === "/" || path === "" ? "home" : path.replace(/^\//, "")}.png`;

/** Every routable path, for the prerenderer. Must agree with public/sitemap.xml. */
export const routePaths: string[] = [
  "",
  "/works",
  "/topics",
  "/library",
  "/expertise",
  "/notes",
  "/about",
  ...repos.map((r) => `/works/${r.slug}`),
  ...notes.map((n) => `/notes/${n.slug}`),
];

/**
 * Client-side navigation happens after the static HTML is already in the
 * document — apply the same metadata the prerenderer injected.
 */
export function useDocumentMeta(location: string): void {
  useEffect(() => {
    const m = routeMeta(location);
    const url = canonicalFor(location);
    document.title = m.title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [type, name] = attr.split("=");
        el.setAttribute(type, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };
    setMeta('meta[name="description"]', "name=description", m.description);
    setMeta('meta[property="og:title"]', "property=og:title", m.title);
    setMeta('meta[property="og:description"]', "property=og:description", m.description);
    setMeta('meta[property="og:url"]', "property=og:url", url);
    setMeta('meta[property="og:type"]', "property=og:type", m.ogType);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [location]);
}
