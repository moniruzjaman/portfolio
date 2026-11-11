import { useEffect } from "react";
import { repos } from "@/lib/data";
import { summaryFor, titleFor } from "@/lib/curation";
import { notes } from "@/content/notes";
import { BASE_URL } from "@/lib/site";
import { splitLangPath } from "@/lib/lang-url";
import { LANGS } from "@/lib/lang-url";
import type { Lang } from "@/lib/lang-url";

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

/**
 * Canonical URL of a language variant of a clean route path. Mirrors hrefFor
 * in lang-url.ts and the sitemap builder in gen-static.mjs — all three must
 * produce identical URLs, and prerender.mjs asserts that they do.
 */
export const canonicalForLang = (lang: Lang, cleanPath: string): string => {
  const root = SITE.replace(/\/$/, "");
  if (cleanPath === "/") return lang === "bn" ? `${root}/bn` : SITE;
  return `${root}${lang === "bn" ? "/bn" : ""}${cleanPath}`;
};

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

type StaticMeta = { title: string; description: string; titleBn?: string; descriptionBn?: string };

// Bangla copy is authored, same discipline as the en copy: describes the page
// in the language the /bn/ page actually renders.
const STATIC_META: Record<string, StaticMeta> = {
  "/": {
    title: "Abu Md. Moniruzjaman — Portfolio · Agricultural Extension & Digital Tools",
    description:
      "Portfolio of Abu Md. Moniruzjaman — Additional Deputy Director (Horticulture), DAE Bangladesh, and builder of digital tools for smallholder farmers. Selected work, career, and field writing.",
    titleBn: "আবু এম ডি মনিরুজ্জামান — পোর্টফোলিও · কৃষি সম্প্রসারণ ও ডিজিটাল টুলস",
    descriptionBn:
      "আবু এম ডি মনিরুজ্জামান — কৃষি সম্প্রসারণ অধিদপ্তর (ডিএই), বাংলাদেশ; ক্ষুদ্র কৃষকদের জন্য ডিজিটাল টুল নির্মাতা। নির্বাচিত কাজ, কর্মজীবন ও মাঠপর্যায়ের লেখা।",
  },
  "/works": {
    title: "Work — Abu Md. Moniruzjaman",
    description:
      "The live ecosystem of digital tools for agricultural extension — every published repository with a real deployment channel, generated daily, never hand-maintained.",
    titleBn: "কাজ — আবু এম ডি মনিরুজ্জামান",
    descriptionBn:
      "কৃষি সম্প্রসারণের জন্য ডিজিটাল টুলসের জীবন্ত বাস্তুতন্ত্র — প্রতিটি প্রকাশিত রিপোজিটরির সত্যিকারের ডিপ্লয়মেন্ট চ্যানেল, প্রতিদিন স্বয়ংক্রিয়ভাবে তৈরি, কখনো হাতে রক্ষণাবেক্ষণ করা হয় না।",
  },
  "/topics": {
    title: "Research topics — Abu Md. Moniruzjaman",
    description:
      "The catalogue grouped into research themes — crop diagnosis, soil health, pesticide regulation and the Bengali-first Krishi AI platform, each linked to the notes that document its method.",
    titleBn: "গবেষণা বিষয় — আবু এম ডি মনিরুজ্জামান",
    descriptionBn:
      "গবেষণা থিম অনুযায়ী সাজানো ক্যাটালগ — ফসল রোগ নির্ণয়, মাটির স্বাস্থ্য, কীটনাশক ব্যবস্থাপনা ও বাংলা-প্রথম কৃষি এআই প্ল্যাটফর্ম, প্রতিটি পদ্ধতি নথিভুক্তকারী নোটের সাথে সংযুক্ত।",
  },
  "/library": {
    title: "Library — Abu Md. Moniruzjaman",
    description:
      "Research, documents, presentations and videos from the author's Google Drive — indexed at sync time, previewable in place.",
    titleBn: "লাইব্রেরি — আবু এম ডি মনিরুজ্জামান",
    descriptionBn: "গুগল ড্রাইভে থাকা গবেষণা, নথি, উপস্থাপনা ও ভিডিও — সিঙ্কের সময় সূচিকৃত, সরাসরি প্রিভিউযোগ্য।",
  },
  "/expertise": {
    title: "Expertise — Abu Md. Moniruzjaman",
    description:
      "An expertise map built from real field systems — the published repositories translated into working agricultural workflows.",
    titleBn: "দক্ষতা — আবু এম ডি মনিরুজ্জামান",
    descriptionBn: "প্রকৃত মাঠপর্যায়ের সিস্টেম থেকে গড়া দক্ষতা ম্যাপ — প্রকাশিত রিপোজিটরিগুলো কৃষি কর্মপ্রবাহে রূপান্তরিত।",
  },
  "/notes": {
    title: "Writing — Abu Md. Moniruzjaman",
    description:
      "Field guides, policy briefs and method notes on agricultural extension, soil health and digital tools for Bangladesh.",
    titleBn: "লেখা — আবু এম ডি মনিরুজ্জামান",
    descriptionBn:
      "কৃষি সম্প্রসারণ, মাটির স্বাস্থ্য ও বাংলাদেশের ডিজিটাল টুলস নিয়ে মাঠ গাইড, নীতি সংক্ষেপ ও পদ্ধতি নোট।",
  },
  "/about": {
    title: "About — Abu Md. Moniruzjaman",
    description:
      "Abu Md. Moniruzjaman — Additional Deputy Director (Horticulture), DAE Kurigram. Career, education and the thinking behind the tools.",
    titleBn: "পরিচিতি — আবু এম ডি মনিরুজ্জামান",
    descriptionBn:
      "আবু এম ডি মনিরুজ্জামান — অতিরিক্ত উপ-পরিচালক (উদ্যান), ডিএই কুড়িগ্রাম। কর্মজীবন, শিক্ষা এবং টুলসের পেছনের ভাবনা।",
  },
};

/** Metadata for a router-relative path ("/works/krishi-ai"), per language. */
export function routeMeta(path: string, lang: Lang = "en"): RouteMeta {
  // Normalize spellings AND tolerate a /bn prefix a caller hands us (the
  // 404-shim replay produces one); callers normally pass clean paths + lang.
  const { lang: urlLang, clean } = splitLangPath(path === "" ? "/" : path);
  const p = clean;
  const l: Lang = lang === "en" && urlLang === "bn" ? "bn" : lang;
  const staticMeta = STATIC_META[p];
  if (staticMeta) {
    // The Person record belongs on the two identity pages only (brief 2.2).
    const jsonLd = p === "/" || p === "/about" ? [personJsonLd] : [];
    const title = l === "bn" ? (staticMeta.titleBn ?? staticMeta.title) : staticMeta.title;
    const description =
      l === "bn" ? (staticMeta.descriptionBn ?? staticMeta.description) : staticMeta.description;
    // The home title leads with the name (unlike "X — suffix"), so the generic
    // split is a no-op there; the OG card needs a short title — the full one
    // truncates awkwardly at the card's column width.
    const ogTitle =
      l === "bn"
        ? p === "/"
          ? "আবু এম ডি মনিরুজ্জামান — পোর্টফোলিও"
          : title.split(" — আবু এম ডি মনিরুজ্জামান")[0]
        : p === "/"
          ? "Abu Md. Moniruzjaman — Portfolio"
          : staticMeta.title.split(" — Abu Md. Moniruzjaman")[0];
    return { title, description, ogType: "website", jsonLd, ogTitle };
  }

  if (p.startsWith("/works/")) {
    const r = workBySlug(p.slice("/works/".length));
    if (r) {
      const title = `${titleFor(r, l) || r.name} — ${l === "bn" ? "কাজ" : "Work"}`;
      const cleanTitle = titleFor(r, l) || r.name;
      const description = summaryFor(r, l) || r.description || r.name;
      const url = canonicalForLang(l, p);
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

  if (p.startsWith("/notes/")) {
    const n = noteBySlug(p.slice("/notes/".length));
    if (n) {
      const title = `${(l === "bn" ? n.titleBn || n.title : n.title)} — ${l === "bn" ? "লেখা" : "Writing"}`;
      const url = canonicalForLang(l, p);
      return {
        title,
        description: n.summary,
        ogType: "article",
        ogTitle: l === "bn" ? n.titleBn || n.title : n.title,
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
 * document — apply the same metadata the prerenderer injected, for either
 * language variant of the location.
 */
export function useDocumentMeta(location: string): void {
  useEffect(() => {
    const { lang, clean } = splitLangPath(location);
    const m = routeMeta(clean, lang);
    const url = canonicalForLang(lang, clean);
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

    const setLink = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector<HTMLLinkElement>(selector);
      if (!el) {
        el = document.createElement("link");
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        document.head.appendChild(el);
      }
      return el;
    };

    const link = setLink('link[rel="canonical"]', { rel: "canonical" });
    link.href = url;

    // hreflang alternates: prerendered pages ship them in <head>; keep them
    // truthful across client navigation (both directions + x-default → en).
    for (const alt of LANGS) {
      setLink(`link[rel="alternate"][hreflang="${alt}"]`, {
        rel: "alternate",
        hreflang: alt,
      }).href = canonicalForLang(alt, clean);
    }
    setLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: "alternate",
      hreflang: "x-default",
    }).href = canonicalForLang("en", clean);
  }, [location]);
}
