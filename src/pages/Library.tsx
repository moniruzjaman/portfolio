import { useMemo, useState } from "react";
import { ExternalLink, FileText, FolderOpen, Presentation, Table2, File as FileIcon, Image as ImageIcon, Search } from "lucide-react";
import { PageHeader, Chip } from "@/components/Section";
import { DocPreview } from "@/components/DocPreview";
import { useI18n } from "@/lib/i18n";
import { libCurationFor, SHELF_LABEL, SHELVES } from "@/lib/curation";
import {
  folderEmbedUrl,
  folderUrl,
  formatBytes,
  KIND_LABEL,
  library,
  libraryItems,
  thumbUrl,
  type Kind,
  type LibItem,
} from "@/lib/library";

const PAGE = 24;

/** "Web upload " / "Pesticides_Crisis" → "Web upload" / "Pesticides Crisis". */
const topicLabel = (i: LibItem) => (i.path[0] ?? "").replace(/_/g, " ").trim();

/** Shelf + subjects per file, resolved once (curation is static). */
const CURATION = new Map(libraryItems.map((i) => [i.id, libCurationFor(i.id, i.path)]));
const shelfOf = (i: LibItem) => CURATION.get(i.id)!.shelf;
const subjectsOf = (i: LibItem) => CURATION.get(i.id)!.subjects;

const KIND_ICON: Record<Kind, typeof FileText> = {
  pdf: FileText,
  slides: Presentation,
  doc: FileText,
  sheet: Table2,
  image: ImageIcon,
  other: FileIcon,
};

function Thumb({ item }: { item: LibItem }) {
  const [failed, setFailed] = useState(false);
  const Icon = KIND_ICON[item.kind];
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-forest-300 bg-cream-200">
      <Icon size={36} className="text-moss-400" aria-hidden="true" />
      {!failed && (
        <img
          src={thumbUrl(item)}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function Library() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "title">("new");
  const [topic, setTopic] = useState("all");
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<LibItem | null>(null);
  // Any change to what is being filtered starts the list again from the top.
  const refilter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setLimit(PAGE);
  };

  const topics = useMemo(() => {
    const n = new Map<string, number>();
    for (const i of libraryItems) if (tab === "all" || shelfOf(i) === tab) n.set(topicLabel(i), (n.get(topicLabel(i)) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]);
  }, [tab]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return libraryItems
      .filter((i) => tab === "all" || shelfOf(i) === tab)
      .filter((i) => topic === "all" || topicLabel(i) === topic)
      .filter((i) => !needle || [i.title, i.path.join(" "), i.kind, subjectsOf(i).join(" ")].join(" ").toLowerCase().includes(needle))
      .sort((a, b) =>
        sort === "title" ? a.title.localeCompare(b.title) : (b.modified ?? "").localeCompare(a.modified ?? ""),
      );
  }, [tab, q, sort, topic]);
  const visible = shown.slice(0, limit);

  const linked = library.collections.filter((c) => c.folderId);
  const hasFolders = Boolean(library.root) || linked.length > 0;
  const indexed = libraryItems.length > 0;
  const tabs = [
    { key: "all", label: t("All", "সব"), n: libraryItems.length },
    ...SHELVES.map((k) => ({ key: k as string, label: SHELF_LABEL[k][lang], n: libraryItems.filter((i) => shelfOf(i) === k).length })).filter((x) => x.n > 0),
  ];

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn="Library"
        eyebrowBn="লাইব্রেরি"
        titleEn="Research, documents and presentations"
        titleBn="গবেষণা, নথি ও উপস্থাপনা"
        ledeEn="Open-access material from the field — read it here or open the original in Google Drive."
        ledeBn="মাঠ থেকে উন্মুক্ত উপকরণ — এখানে পড়ুন অথবা গুগল ড্রাইভে মূল ফাইল খুলুন।"
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="u-container">
          {indexed && (
            <>
              <div className="mb-8 flex flex-col gap-4 border-b border-forest-300 pb-6 lg:flex-row lg:items-center lg:justify-between">
                <div role="group" aria-label={t("Collections", "সংগ্রহ")} className="flex flex-wrap gap-2">
                  {tabs.map((x) => (
                    <button
                      key={x.key}
                      type="button"
                      aria-pressed={tab === x.key}
                      onClick={() => {
                        setTab(x.key);
                        setTopic("all");
                        setLimit(PAGE);
                      }}
                      className={`min-h-11 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                        tab === x.key ? "border-forest-900 bg-forest-900 text-cream-100" : "border-forest-300 text-moss-500 hover:border-forest-500"
                      }`}
                    >
                      {x.label} · {x.n}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="relative">
                    <span className="sr-only">{t("Search the library", "লাইব্রেরিতে খুঁজুন")}</span>
                    <Search size={14} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-moss-400" />
                    <input
                      value={q}
                      onChange={(e) => refilter(setQ)(e.target.value)}
                      placeholder={t("Search…", "খুঁজুন…")}
                      className="min-h-11 rounded-full border border-forest-300 bg-white py-1.5 pl-9 pr-4 text-sm text-forest-900 outline-none placeholder:text-moss-400"
                    />
                  </label>
                  {topics.length > 1 && (
                    <label>
                      <span className="sr-only">{t("Topic", "বিষয়")}</span>
                      <select
                        value={topic}
                        onChange={(e) => refilter(setTopic)(e.target.value)}
                        className="min-h-11 max-w-[14rem] rounded-full border border-forest-300 bg-white px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-moss-500"
                      >
                        <option value="all">{t("All topics", "সব বিষয়")}</option>
                        {topics.map(([name, n]) => (
                          <option key={name || "general"} value={name}>
                            {(name || t("General", "সাধারণ")) + ` · ${n}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    <span className="sr-only">{t("Sort", "সাজান")}</span>
                    <select
                      value={sort}
                      onChange={(e) => refilter(setSort)(e.target.value as "new" | "title")}
                      className="min-h-11 rounded-full border border-forest-300 bg-white px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-moss-500"
                    >
                      <option value="new">{t("Newest", "নতুন আগে")}</option>
                      <option value="title">{t("Title A–Z", "শিরোনাম")}</option>
                    </select>
                  </label>
                </div>
              </div>

              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.14em] text-moss-500" aria-live="polite">
                {visible.length} {t("of", "/")} {shown.length} {t("shown", "দেখানো হচ্ছে")}
                {library.generatedAt && ` · ${t("indexed", "সূচিবদ্ধ")} ${library.generatedAt.slice(0, 10)}`}
              </p>

              {shown.length === 0 ? (
                <p className="py-16 text-center text-moss-500">{t("Nothing matches that search.", "এই অনুসন্ধানে কিছু মেলেনি।")}</p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visible.map((i) => (
                    <li key={i.id}>
                      <button
                        type="button"
                        onClick={() => setOpen(i)}
                        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-forest-400 bg-white text-left transition-all duration-200 hover:-translate-y-1 hover:border-forest-300 hover:shadow-[0_16px_40px_rgba(10,46,26,0.1)]"
                      >
                        <Thumb item={i} />
                        <span className="flex flex-1 flex-col p-4">
                          <span className="mb-2 flex flex-wrap items-center gap-1.5">
                            <Chip>{KIND_LABEL[i.kind][lang]}</Chip>
                            {(subjectsOf(i).length ? subjectsOf(i).slice(0, 2) : [topicLabel(i)]).filter(Boolean).map((x) => (
                              <Chip key={x}>{x}</Chip>
                            ))}
                          </span>
                          <span className="line-clamp-3 font-serif text-base font-black leading-snug text-forest-900">{i.title}</span>
                          <span className="mt-auto pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-moss-500">
                            {[i.modified?.slice(0, 4), formatBytes(i.size)].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {shown.length > visible.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setLimit((n) => n + PAGE * 2)}
                    className="min-h-11 rounded-full border border-forest-900/25 px-6 text-sm font-bold text-forest-900 hover:bg-cream-100"
                  >
                    {t(`Show more (${shown.length - visible.length} left)`, `আরও দেখুন (${shown.length - visible.length}টি বাকি)`)}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Linked folders. With no files indexed this IS the content: Drive's own
              folder view, loaded only when asked. With files indexed it is a footer. */}
          {hasFolders && (
            <div className={indexed ? "mt-16 border-t border-forest-300 pt-10" : ""}>
              <p className="u-eyebrow mb-5 text-gold-600">{t("Browse the Drive folder", "ড্রাইভ ফোল্ডার ঘুরে দেখুন")}</p>
              <div className={library.root ? "grid gap-5" : "grid gap-5 lg:grid-cols-3"}>
                {library.root && (
                  <FolderCard
                    folderId={library.root.folderId}
                    title={t("Resource library", "রিসোর্স লাইব্রেরি")}
                    description={t(
                      "The complete shared folder — research, PDFs and presentations — in Google Drive.",
                      "সম্পূর্ণ শেয়ার্ড ফোল্ডার — গবেষণা, পিডিএফ ও উপস্থাপনা — গুগল ড্রাইভে।",
                    )}
                    wide
                  />
                )}
                {!library.root &&
                  linked.map((c) => (
                    <FolderCard key={c.key} folderId={c.folderId!} title={lang === "bn" ? c.titleBn : c.title} description={lang === "bn" ? c.descriptionBn : c.description} />
                  ))}
              </div>
            </div>
          )}

          {!indexed && !hasFolders && (
            <div className="mx-auto max-w-xl py-16 text-center">
              <FolderOpen size={36} className="mx-auto text-moss-400" aria-hidden="true" />
              <h2 className="mt-5 font-serif text-2xl font-black text-forest-900">{t("The library is being prepared", "লাইব্রেরি প্রস্তুত করা হচ্ছে")}</h2>
              <p className="mt-3 text-moss-500">
                {t("Research papers, PDFs and presentations will appear here.", "গবেষণাপত্র, পিডিএফ ও উপস্থাপনা এখানে প্রকাশিত হবে।")}
              </p>
            </div>
          )}
        </div>
      </section>

      <DocPreview item={open} onClose={() => setOpen(null)} />
    </>
  );
}

function FolderCard({ folderId, title, description, wide = false }: { folderId: string; title: string; description: string; wide?: boolean }) {
  const { t } = useI18n();
  // Open by default for the single root folder: with no files indexed it IS the page.
  // Still click-to-load otherwise, so no request reaches Google until asked.
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col rounded-2xl border border-forest-400 bg-white p-5">
      <h2 className="font-serif text-xl font-black text-forest-900">{title}</h2>
      <p className="mt-1 text-sm text-moss-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={folderUrl(folderId)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-900 px-4 text-xs font-bold text-cream-100 hover:bg-forest-600"
        >
          <ExternalLink size={13} aria-hidden="true" /> {t("Open in Drive", "ড্রাইভে খুলুন")}
          <span className="sr-only">{t("(opens in a new tab)", "(নতুন ট্যাবে খুলবে)")}</span>
        </a>
        {!shown && (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest-900/25 px-4 text-xs font-bold text-forest-900 hover:bg-cream-100"
          >
            <FolderOpen size={13} aria-hidden="true" /> {t("Browse here", "এখানে দেখুন")}
          </button>
        )}
      </div>
      {shown && (
        <iframe
          title={title}
          src={folderEmbedUrl(folderId)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className={`mt-4 w-full rounded-xl border border-forest-300 bg-white ${wide ? "h-[560px]" : "h-[420px]"}`}
        />
      )}
    </div>
  );
}
