import raw from "../../content-data/apps.json";
import libRaw from "../../content-data/library-curation.json";
import type { Repo } from "./data";
import type { Lang } from "./i18n";

/**
 * Curation layer over the generated catalogue.
 *
 * `src/data/repos.generated.json` is machine-owned and rewritten daily by the sync
 * workflow; hand edits there are lost. `content-data/apps.json` is human-owned: it
 * is the single place where a title, summary, audience or type is written by a
 * person, keyed by repo name so a renamed repo simply falls back to generated data.
 *
 * Nothing in here changes a count. Counts stay computed (design-system §7); this
 * only adds words and grouping.
 */

export type AppType = "app" | "report" | "ebook" | "dataset" | "source";
export type Audience = "farmer" | "officer" | "policy" | "learning";

export const APP_TYPES: AppType[] = ["app", "report", "ebook", "dataset", "source"];
export const AUDIENCES: Audience[] = ["farmer", "officer", "policy", "learning"];

export const TYPE_LABEL: Record<AppType, { en: string; bn: string }> = {
  app: { en: "App", bn: "অ্যাপ" },
  report: { en: "Report", bn: "প্রতিবেদন" },
  ebook: { en: "E-book", bn: "ই-বুক" },
  dataset: { en: "Dataset", bn: "ডেটাসেট" },
  source: { en: "Source", bn: "সোর্স" },
};

export const AUDIENCE_LABEL: Record<Audience, { en: string; bn: string }> = {
  farmer: { en: "Farmers", bn: "কৃষক" },
  officer: { en: "Field officers", bn: "মাঠ কর্মকর্তা" },
  policy: { en: "Policy", bn: "নীতিপর্যায়ে" },
  learning: { en: "Learning", bn: "শিখতে" },
};

/** One-line description of who each audience is — used on filters and detail pages. */
export const AUDIENCE_BLURB: Record<Audience, { en: string; bn: string }> = {
  farmer: { en: "Use it yourself in the field", bn: "মাঠে নিজে ব্যবহার করুন" },
  officer: { en: "Collect, report and advise", bn: "তথ্য সংগ্রহ, প্রতিবেদন ও পরামর্শ" },
  policy: { en: "Reform papers and blueprints", bn: "সংস্কার নথি ও নীতি নকশা" },
  learning: { en: "Courses, games and reference", bn: "কোর্স, খেলা ও রেফারেন্স" },
};

type CuratedEntry = {
  type?: AppType;
  audiences?: Audience[];
  titleEn?: string;
  titleBn?: string;
  summaryEn?: string;
  summaryBn?: string;
  notesEn?: string;
  notesBn?: string;
};

const CURATED = (raw.apps ?? {}) as Record<string, CuratedEntry>;

export type CatalogueItem = {
  repo: Repo;
  /** Human display title; falls back to the generated (GitHub) title. */
  title: string;
  titleBn: string;
  /** One-line summary; falls back to the generated description. */
  summary: string;
  summaryBn: string;
  type: AppType;
  audiences: Audience[];
  /** Longer paragraph shown on the detail page only. */
  notes?: string;
  notesBn?: string;
  curated: boolean;
};

const titleOf = (r: Repo): string => r.title || r.name;

export function catalogueItem(r: Repo): CatalogueItem {
  const c = CURATED[r.name];
  return {
    repo: r,
    title: c?.titleEn || titleOf(r),
    titleBn: c?.titleBn || titleOf(r),
    summary: c?.summaryEn || r.description || "",
    summaryBn: c?.summaryBn || r.description || "",
    // Uncurated repos are apps until someone says otherwise — the generator has no type.
    type: c?.type ?? "app",
    audiences: c?.audiences ?? [],
    notes: c?.notesEn,
    notesBn: c?.notesBn,
    curated: Boolean(c),
  };
}

const cache = new Map<string, CatalogueItem>();

/** Memoised per repo name — the catalogue is static at runtime. */
export function itemOf(r: Repo): CatalogueItem {
  let it = cache.get(r.name);
  if (!it) {
    it = catalogueItem(r);
    cache.set(r.name, it);
  }
  return it;
}

export const titleFor = (r: Repo, lang: Lang): string => {
  const it = itemOf(r);
  return lang === "bn" ? it.titleBn : it.title;
};

export const summaryFor = (r: Repo, lang: Lang): string => {
  const it = itemOf(r);
  return lang === "bn" ? it.summaryBn : it.summary;
};

export const notesFor = (r: Repo, lang: Lang): string | undefined => {
  const it = itemOf(r);
  return lang === "bn" ? (it.notesBn ?? it.notes) : it.notes;
};

export const audiencesOf = (r: Repo): Audience[] => itemOf(r).audiences;
export const typeOf = (r: Repo): AppType => itemOf(r).type;

/** An app can be opened and used; a report/ebook/source cannot. */
export const isLaunchable = (r: Repo): boolean => typeOf(r) === "app" || typeOf(r) === "dataset";

/* ── library shelves ─────────────────────────────────────────────────────── */

export type Shelf = "research" | "report" | "ebook" | "guide" | "training" | "other";

export const SHELF_LABEL: Record<Shelf, { en: string; bn: string }> = {
  research: { en: "Research", bn: "গবেষণা" },
  report: { en: "Reports", bn: "প্রতিবেদন" },
  ebook: { en: "E-books", bn: "ই-বুক" },
  guide: { en: "Field guides", bn: "মাঠ নির্দেশিকা" },
  training: { en: "Training", bn: "প্রশিক্ষণ" },
  other: { en: "Other files", bn: "অন্যান্য ফাইল" },
};

type LibCuration = { shelf: Shelf; subjects: string[]; titleBn?: string };

const LIB = libRaw as unknown as {
  default: LibCuration;
  byPath: Record<string, Omit<LibCuration, "titleBn">>;
  entries: Record<string, Partial<LibCuration>>;
};

/** Resolve a Drive file's shelf + subject chips from its id and folder path. */
export function libCurationFor(id: string, path: string[]): LibCuration {
  const explicit = LIB.entries[id];
  const top = path[0]?.toLowerCase();
  const byPath = top ? Object.entries(LIB.byPath).find(([k]) => k.toLowerCase() === top)?.[1] : undefined;
  return { ...LIB.default, ...(byPath ?? {}), ...(explicit ?? {}) } as LibCuration;
}
