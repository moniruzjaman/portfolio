import { useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowUpRight, Mail, Phone, Sparkles, Radio, FileText } from "lucide-react";
import { socials } from "@/components/Socials";
import { expertiseGraphs, KnowledgeGraph } from "@/components/KnowledgeGraph";
import { repos, stats } from "@/lib/data";
import { FLAGSHIP_NAMES } from "@/content/apps";
import { AppCard } from "@/components/AppCard";
import { PlatformTiles } from "@/components/PlatformTiles";
import { libraryItems, KIND_LABEL } from "@/lib/library";
import { asset } from "@/lib/site";
import { notes } from "@/content/notes";
import { author, figures } from "@/lib/author";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "@/components/Section";
import { ConnectSection } from "@/components/ConnectSection";

/** Flagship order is curated in src/content/apps.ts; a renamed repo drops out silently. */
const FEATURED = FLAGSHIP_NAMES
  .map((n) => repos.find((r) => r.name === n))
  .filter((r): r is (typeof repos)[number] => Boolean(r));

export default function Home() {
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState(0);
  const graph = expertiseGraphs[selected];
  const featuredNotes = notes.filter((n) => n.featured).slice(0, 3);

  // Arrow-key navigation on the graph selector. The previous build shipped a
  // mouse-only selector and flagged keyboard support as an open next step.
  const onGraphKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setSelected((s) => (s + 1) % expertiseGraphs.length);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setSelected((s) => (s - 1 + expertiseGraphs.length) % expertiseGraphs.length);
    }
  };

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden px-5 pb-20 pt-36 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -right-24 -top-20 -z-10 h-[520px] w-[520px] rounded-full bg-gold-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 left-[-10%] -z-10 h-[540px] w-[540px] rounded-full bg-forest-400/10 blur-3xl" />

        <div className="u-container grid items-center gap-16 lg:grid-cols-[1.12fr_.88fr]">
          <div className="max-w-3xl">
            {/* On a phone the full portrait card sits far below the fold; show who this is immediately. */}
            <div className="mb-6 flex items-center gap-3.5 lg:hidden">
              <img
                src={asset("portrait.jpg")}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border-2 border-white bg-white object-cover object-top shadow-md"
              />
              <div>
                <p className="font-serif text-lg font-black leading-tight text-forest-900">{author.name}</p>
                <p className="text-xs text-moss-500">{author.role}</p>
              </div>
            </div>

            <div className="mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-forest-200 bg-white/50 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-forest-400" />
              <span className="u-eyebrow text-forest-500">{t("Portfolio", "পোর্টফোলিও")} · DAE Bangladesh</span>
            </div>

            <p className="mb-4 hidden font-mono text-xs font-bold uppercase tracking-[0.25em] text-gold-500 lg:block">
              {author.name}
            </p>

            <h1 tabIndex={-1} className="max-w-4xl outline-none font-serif text-5xl font-black leading-[0.98] tracking-[-0.04em] text-forest-900 sm:text-7xl">
              {t("I build digital tools for", "আমি ডিজিটাল টুল তৈরি করি")}{" "}
              <span className="italic text-forest-500">{t("agricultural extension.", "কৃষি সম্প্রসারণের জন্য।")}</span>
            </h1>

            <p className="mt-8 max-w-xl border-l-2 border-gold-400 pl-5 text-lg leading-relaxed text-moss-500 sm:text-xl">
              {t(
                `${author.role} at the Department of Agricultural Extension, ${author.location.split(",")[0]} — and the developer behind ${stats.repos} public tools for smallholder farmers and field officers.`,
                `কৃষি সম্প্রসারণ অধিদপ্তরের অতিরিক্ত উপপরিচালক (উদ্যান), কুড়িগ্রাম — এবং ক্ষুদ্র কৃষক ও মাঠ কর্মকর্তাদের জন্য ${stats.repos}টি উন্মুক্ত টুলের নির্মাতা।`,
              )}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#work"
                className="inline-flex items-center rounded-full bg-forest-900 px-5 py-3.5 text-sm sm:px-7 font-bold text-cream-100 shadow-xl shadow-forest-900/15 transition-transform hover:-translate-y-1 hover:bg-forest-600"
              >
                {t("See my work", "আমার কাজ দেখুন")} <ArrowDown className="ml-2" size={16} />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-full border border-forest-900/25 bg-white/40 px-5 py-3.5 text-sm sm:px-7 font-bold text-forest-900 transition-colors hover:bg-white"
              >
                {t("Get in touch", "যোগাযোগ করুন")} <Mail className="ml-2" size={16} />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5">
            <span className="u-eyebrow text-moss-400">{t("Follow:", "অনুসরণ করুন:")}</span>
            {socials.map(({ key, label, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className="inline-flex min-h-11 items-center text-sm font-bold text-moss-500 underline-offset-4 transition-colors hover:text-forest-900 hover:underline"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Live counts — computed from generated data, never hand-typed. */}
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-forest-300 pt-8">
              {[
                { n: stats.repos, l: t("published works", "প্রকাশিত কাজ") },
                { n: stats.live, l: t("live deployments", "সরাসরি চালু") },
                { n: figures.yearsField, l: t("years in the field", "বছর মাঠে") },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-serif text-3xl font-black text-forest-900">{s.n}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-[0.12em] text-moss-400">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Profile card */}
          <div className="relative mx-auto w-full max-w-[460px]">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-forest-400/20 via-transparent to-gold-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-forest-200/70 bg-forest-900 p-8 text-white shadow-[0_30px_80px_rgba(10,46,26,0.22)]">
              <img
                src={asset("portrait.jpg")}
                alt={author.name}
                width={720}
                height={693}
                className="-mx-8 -mt-8 mb-6 h-80 w-[calc(100%+4rem)] max-w-none bg-white object-cover object-top"
              />
              <div>
                <p className="font-serif text-2xl font-black leading-tight">{author.name}</p>
                <p className="mt-1 text-sm text-forest-200">{author.role}</p>
              </div>

              <dl className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm">
                {[
                  [t("Organisation", "প্রতিষ্ঠান"), lang === "bn" ? author.orgBn : author.org],
                  [t("Based in", "কর্মস্থল"), author.location],
                  [t("Service", "ক্যাডার"), author.cadre],
                  [t("Education", "শিক্ষা"), "MBA · B.Sc. Ag. (Hons.)"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-4">
                    <dt className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-gold-400">{k}</dt>
                    <dd className="text-forest-100">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {author.competencies.map((c) => (
                  <span key={c.group} className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-forest-200">
                    {lang === "bn" ? c.groupBn : c.group}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── featured works ───────────────────────────────────── */}
      <section id="work" className="scroll-mt-20 bg-cream-100 px-5 py-24 sm:px-8 lg:px-12">
        <div className="u-container">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="u-eyebrow mb-3 text-gold-500">
                {t("Selected work", "নির্বাচিত কাজ")}
              </p>
              <h2 className="font-serif text-4xl font-black text-forest-900 sm:text-5xl">
                {t("Built for the field, documented for the future.", "মাঠের জন্য তৈরি, ভবিষ্যতের জন্য নথিভুক্ত।")}
              </h2>
            </div>
            <Link
              href="/works"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest-500 transition-colors hover:text-forest-900"
            >
              {t(`All ${stats.repos} works`, `সব ${stats.repos}টি কাজ`)} <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED.map((repo) => (
              <AppCard key={repo.name} repo={repo} />
            ))}
          </div>

          <div className="mt-14">
            <p className="u-eyebrow mb-4 text-gold-600">
              {t(`Where it runs · ${stats.addresses} live addresses`, `যেখানে চলে · ${stats.addresses}টি চালু ঠিকানা`)}
            </p>
            <PlatformTiles />
          </div>
        </div>
      </section>

      {/* ── about ────────────────────────────────────────────── */}
      <section className="border-y border-forest-300 bg-white px-5 py-24 sm:px-8 lg:px-12">
        <div className="u-container grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
          <div>
            <SectionHeading
              en="A practical point of view"
              bn="বাস্তববাদী দৃষ্টিভঙ্গি"
              className="text-gold-500"
            />
            <h2 className="max-w-md font-serif text-4xl font-black leading-tight text-forest-900 sm:text-5xl">
              {t("Knowledge should travel as far as the farmer.", "জ্ঞান কৃষক পর্যন্ত পৌঁছে যেতে হবে।")}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <p className="text-lg leading-relaxed text-moss-500">
              {author.vision}
            </p>
            <div className="rounded-2xl bg-cream-100 p-6">
              <div className="mb-5 flex items-center gap-3 text-forest-500">
                <Sparkles size={18} />
                <span className="u-eyebrow">{t("The working principle", "কর্মপন্থা")}</span>
              </div>
              <p className="font-serif text-2xl font-bold leading-snug text-forest-900">
                {t("Make the invisible relationships visible.", "অদৃশ্য সম্পর্কগুলোকে দৃশ্যমান করুন।")}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-moss-400">
                {t(
                  "The map below connects each area of expertise to the field data, workflows, and trust signals behind it.",
                  "নিচের প্রতিটি গ্রাফ একটি দক্ষতাকে মাঠের তথ্য, কর্মপ্রবাহ ও বিশ্বাসযোগ্যতার সাথে যুক্ত করে।",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── journey ──────────────────────────────────────────── */}
      <section className="border-y border-forest-300 bg-white px-5 py-24 sm:px-8 lg:px-12">
        <div className="u-container">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="u-eyebrow mb-3 text-gold-500">{t("Journey", "পথচলা")}</p>
              <h2 className="max-w-2xl font-serif text-4xl font-black text-forest-900 sm:text-5xl">
                {t("From the haor to the river delta.", "হাওর থেকে নদীবিধৌত জনপদ।")}
              </h2>
            </div>
            <Link href="/about" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest-500 transition-colors hover:text-forest-900">
              {t("Full career & education", "পূর্ণ কর্মজীবন ও শিক্ষা")} <ArrowUpRight size={16} />
            </Link>
          </div>
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {author.career.filter((c) => c.role !== "Instructor, Agriculture Training Institute (ATI)").slice(0, 4).map((c) => (
              <li key={c.from + c.place} className="rounded-[1.5rem] border border-forest-300 bg-cream-50 p-6">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold-500">{c.from} — {c.to}</p>
                <h3 className="mt-3 font-serif text-lg font-black leading-snug text-forest-900">{c.role}</h3>
                <p className="mt-1 text-sm font-medium text-forest-500">{lang === "bn" ? c.placeBn : c.place}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── expertise graphs ─────────────────────────────────── */}
      <section id="graphs" className="bg-forest-900 px-5 py-24 text-white sm:px-8 lg:px-12">
        <div className="u-container">
          <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="u-eyebrow mb-4 text-gold-400">
                {t("What I work on", "যে ক্ষেত্রে কাজ করি")}
              </p>
              <h2 className="max-w-3xl font-serif text-4xl font-black leading-tight sm:text-6xl">
                {t("An expertise map built from real field systems.", "বাস্তব মাঠ ব্যবস্থা থেকে তৈরি দক্ষতার মানচিত্র।")}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-forest-200">
              {t(
                "Explore each node to see how the published repositories translate agricultural expertise into a working digital workflow.",
                "প্রতিটি নোড দেখুন — প্রকাশিত রিপোজিটরিগুলো কীভাবে কৃষি দক্ষতাকে কার্যকর ডিজিটাল ব্যবস্থায় রূপ দেয়।",
              )}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div
              role="tablist"
              aria-label={t("Expertise areas", "দক্ষতার ক্ষেত্র")}
              onKeyDown={onGraphKey}
              className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible"
            >
              {expertiseGraphs.map((item, index) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => setSelected(index)}
                  className={`group flex min-w-[190px] items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 lg:w-full ${
                    selected === index
                      ? "border-forest-200/40 bg-white/10 shadow-lg"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                  }`}
                >
                  <span className="font-mono text-xs text-gold-400">
                    {item.eyebrow.split(" /")[0]}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-forest-200">{item.bangla}</span>
                  </span>
                  <span
                    className={`ml-auto h-2 w-2 shrink-0 rounded-full transition-transform ${
                      selected === index ? "scale-125" : "opacity-50"
                    }`}
                    style={{ backgroundColor: item.color }}
                  />
                </button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <KnowledgeGraph graph={graph} />
              <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
                <div>
                  <p className="u-eyebrow text-gold-400">{graph.eyebrow}</p>
                  <h3 className="mt-4 font-serif text-3xl font-black leading-tight text-white">
                    {graph.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-forest-200">{graph.bangla}</p>
                  <p className="mt-6 text-sm leading-relaxed text-forest-200">{graph.summary}</p>
                </div>
                <Link
                  href="/expertise"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 border-t border-white/10 pt-3 text-xs font-bold text-gold-400 transition-colors hover:text-white"
                >
                  {t("All expertise", "সব দক্ষতা")} <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── library teaser: only when there is something real to show ── */}
      {libraryItems.length > 0 && (
        <section className="bg-cream-100 px-5 py-24 sm:px-8 lg:px-12">
          <div className="u-container">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="u-eyebrow mb-3 text-gold-500">{t("Library", "লাইব্রেরি")}</p>
                <h2 className="max-w-2xl font-serif text-4xl font-black text-forest-900 sm:text-5xl">
                  {t("Research, PDFs and slide decks.", "গবেষণা, পিডিএফ ও স্লাইড।")}
                </h2>
              </div>
              <Link href="/library" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest-500 transition-colors hover:text-forest-900">
                {t(`All ${libraryItems.length} documents`, `সব ${libraryItems.length}টি নথি`)} <ArrowUpRight size={16} />
              </Link>
            </div>
            <ul className="grid gap-4 md:grid-cols-3">
              {[...libraryItems]
                .sort((a, b) => (b.modified ?? "").localeCompare(a.modified ?? ""))
                .slice(0, 3)
                .map((i) => (
                  <li key={i.id}>
                    <Link
                      href="/library"
                      className="flex h-full gap-4 rounded-2xl border border-forest-400 bg-white p-5 transition-colors hover:border-forest-300"
                    >
                      <FileText size={22} className="mt-1 shrink-0 text-forest-500" aria-hidden="true" />
                      <span>
                        <span className="u-eyebrow block text-moss-500">
                          {KIND_LABEL[i.kind][lang]} · {i.modified?.slice(0, 4)}
                        </span>
                        <span className="mt-1 block font-serif text-lg font-black leading-snug text-forest-900">{i.title}</span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── writing preview ────────────────────────────── */}
      <section className="border-y border-forest-300 bg-white px-5 py-24 sm:px-8 lg:px-12">
        <div className="u-container">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="u-eyebrow mb-3 text-gold-500">
                {t("Writing", "লেখা")}
              </p>
              <h2 className="max-w-2xl font-serif text-4xl font-black text-forest-900 sm:text-5xl">
                {t("Field notes, written for use — not for display.", "মাঠের নোট, ব্যবহারের জন্য লেখা — দেখানোর জন্য নয়।")}
              </h2>
            </div>
            <Link
              href="/notes"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest-500 transition-colors hover:text-forest-900"
            >
              {t("All writing", "সব লেখা")} <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredNotes.map((n) => (
              <Link
                key={n.slug}
                href={`/notes/${n.slug}`}
                className="group flex flex-col rounded-[1.5rem] border border-forest-400 bg-cream-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest-300"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="u-eyebrow rounded-full bg-forest-200/60 px-2.5 py-1 text-forest-600">
                    {n.type}
                  </span>
                  <span className="font-mono text-[10px] text-moss-400">{n.year}</span>
                </div>
                <h3 className="font-serif text-xl font-black leading-snug text-forest-900 group-hover:text-forest-600">
                  {lang === "bn" && n.titleBn ? n.titleBn : n.title}
                </h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-moss-600">
                  {n.summary}
                </p>
                <span className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-moss-400">
                  {n.readingTime} min {t("read", "পড়ুন")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── connect & follow ─────────────────────────────── */}
      <ConnectSection />

      {/* ── contact ──────────────────────────────────────────── */}
      <section id="contact" className="relative scroll-mt-20 overflow-hidden bg-forest-800 px-5 py-24 text-center sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-forest-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="u-eyebrow mb-4 text-gold-400">
            {t("Contact", "যোগাযোগ")}
          </p>
          <h2 className="font-serif text-5xl font-black leading-tight text-white sm:text-6xl">
            {t("Let's build something useful for farmers.", "কৃষকের কাজে লাগে এমন কিছু গড়ি।")}
          </h2>

          {/* Real contact details, transcribed from the author's own repos.
              The previous build shipped a monir@example.com placeholder here. */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${author.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-forest-900 transition-transform hover:-translate-y-1"
            >
              <Mail size={16} /> {author.email}
            </a>
            {author.showPhone && (
            <a
              href={`tel:+${author.phone.replace(/^\+/, "")}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <Phone size={16} /> {author.phoneDisplay}
            </a>
            )}
            {socials.map(({ key, label, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <Icon size={16} /> {label}
              </a>
            ))}
          </div>

          <p className="mt-10 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-forest-200">
            <Radio size={12} className="text-forest-400" />
            {t("Every project on this site is public", "এই সাইটের প্রতিটি প্রকল্পই উন্মুক্ত")}
          </p>
        </div>
      </section>
    </>
  );
}
