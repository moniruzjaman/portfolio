import { useState } from "react";
import { Link } from "wouter";
import { stats, meta, type Repo } from "@/lib/data";
import { TOPICS, metaOf, reposOf, groupStats, ACTIVE_GROUPS, type GroupId } from "@/lib/topics";
import { titleFor, summaryFor } from "@/lib/curation";
import { noteBySlug, NOTE_TYPE_LABEL } from "@/content/notes";
import { PageHeader, Chip } from "@/components/Section";
import { AppCard } from "@/components/AppCard";
import { useI18n } from "@/lib/i18n";

/**
 * /topics — the catalogue grouped into research themes.
 *
 * The grouping lives in src/lib/topics.ts (curation over the generated data);
 * every count on this page is computed from it. Filters mirror /works: topic
 * chips with counts, a text filter, and a live-only toggle.
 */
export default function Topics() {
  const { t, lang } = useI18n();
  const [topic, setTopic] = useState<GroupId | "all">("all");
  const [liveOnly, setLiveOnly] = useState(false);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const matches = (r: Repo) => {
    if (liveOnly && !(r.live || r.pages)) return false;
    if (!needle) return true;
    return [
      r.name,
      r.title,
      titleFor(r, "en"),
      titleFor(r, "bn"),
      summaryFor(r, "en"),
      summaryFor(r, "bn"),
      ...r.topics,
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  };

  const shown = (id: GroupId) => reposOf(id).filter(matches);
  const groups = topic === "all" ? ACTIVE_GROUPS : [topic];
  const total = groups.reduce((n, id) => n + shown(id).length, 0);
  const maxCount = Math.max(...ACTIVE_GROUPS.map((id) => groupStats(id).count));

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn={`${stats.repos} works · ${TOPICS.length} research topics`}
        eyebrowBn={`${stats.repos}টি কাজ · ${TOPICS.length}টি গবেষণা বিষয়`}
        titleEn="Research topics"
        titleBn="গবেষণা বিষয়"
        ledeEn="The whole catalogue, grouped into research themes — from CABI-protocol crop diagnosis to the Bengali-first Krishi AI platform. The grouping is curated; the catalogue underneath is synced from GitHub daily, so new work files itself."
        ledeBn="পুরো ক্যাটালগ গবেষণার থিমে সাজানো — CABI প্রোটোকলের ফসল নির্ণয় থেকে বাংলা-প্রথম কৃষি এআই প্ল্যাটফর্ম পর্যন্ত। থিম বিন্যাস মানবসৃষ্ট; ক্যাটালগ প্রতিদিন গিটহাব থেকে সিঙ্ক হয়, তাই নতুন কাজ নিজে থেকেই যুক্ত হয়।"
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="u-container">
          <div className="mb-10 space-y-4 border-b border-forest-300 pb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div role="group" aria-label={t("Topics", "বিষয়")} className="flex flex-wrap gap-2">
                {(["all", ...ACTIVE_GROUPS] as (GroupId | "all")[]).map((id) => {
                  const tm = id === "all" ? null : metaOf(id);
                  const count = id === "all" ? stats.repos : groupStats(id).count;
                  const label = tm ? t(tm.en, tm.bn) : t("All topics", "সব বিষয়");
                  const selected = topic === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTopic(id === topic ? "all" : id)}
                      className={`min-h-11 shrink-0 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                        selected
                          ? "border-forest-900 bg-forest-900 text-cream-100"
                          : "border-forest-300 text-moss-500 hover:border-forest-500"
                      }`}
                    >
                      {label} · {count}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-pressed={liveOnly}
                  onClick={() => setLiveOnly((v) => !v)}
                  className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors ${
                    liveOnly
                      ? "border-gold-500 bg-gold-400/20 text-forest-900"
                      : "border-forest-300 text-moss-500 hover:border-forest-500"
                  }`}
                >
                  {t("Live apps only", "চালু অ্যাপ")}
                </button>
                <label className="min-w-0 flex-1">
                  <span className="sr-only">{t("Filter", "ফিল্টার")}</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("Filter…", "খুঁজুন…")}
                    className="min-h-11 w-full rounded-full border border-forest-300 bg-white px-4 text-sm text-forest-900 outline-none placeholder:text-moss-400 lg:w-56"
                  />
                </label>
              </div>
            </div>

            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-moss-500"
              aria-live="polite"
            >
              {total} {t("shown", "দেখানো হচ্ছে")} · {t("scanned", "যাচাই করা")} {meta.scanned}{" "}
              {t("repositories", "রিপোজিটরি")} · {t("synced", "সিঙ্ক")}{" "}
              {meta.generatedAt.slice(0, 10)}
            </p>
          </div>

          <div className="mb-14">
            <p className="u-eyebrow mb-4 text-gold-500">
              {t("Distribution — works per topic", "বিষয়ভিত্তিক কাজের সংখ্যা")}
            </p>
            <div className="space-y-1.5">
              {ACTIVE_GROUPS.map((id) => {
                const m = metaOf(id);
                const st = groupStats(id);
                const selected = topic === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTopic(selected ? "all" : id)}
                    className="group grid min-h-11 w-full grid-cols-[minmax(9rem,14rem)_1fr_2.5rem] items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-white sm:gap-4"
                  >
                    <span
                      className={`truncate text-sm font-bold ${selected ? "text-forest-900" : "text-moss-500 group-hover:text-forest-900"}`}
                    >
                      {t(m.en, m.bn)}
                    </span>
                    <span className="h-2 overflow-hidden rounded-full bg-cream-200">
                      <span
                        className="block h-full rounded-full transition-all duration-200"
                        style={{
                          width: `${(st.count / maxCount) * 100}%`,
                          backgroundColor: m.color,
                        }}
                      />
                    </span>
                    <span
                      className={`text-right font-mono text-xs ${selected ? "font-bold text-forest-900" : "text-moss-500"}`}
                    >
                      {st.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {groups.map((id) => {
            const m = metaOf(id);
            const shownRepos = shown(id);
            if (shownRepos.length === 0) return null;
            const st = groupStats(id);
            const topicNotes = m.noteSlugs.flatMap((slug) => {
              const n = noteBySlug(slug);
              return n ? [n] : [];
            });
            return (
              <section key={id} id={`topic-${id}`} className="mb-16 scroll-mt-28">
                <div className="mb-6 flex flex-col gap-3 border-b border-forest-300 pb-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <h2 className="font-serif text-2xl font-black tracking-[-0.01em] text-forest-900">
                      {t(m.en, m.bn)}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-moss-600">
                      {t(m.blurbEn, m.blurbBn)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Chip color={m.color}>
                      {st.count} {t("works", "কাজ")}
                    </Chip>
                    <Chip>
                      {st.live} {t("live", "চালু")}
                    </Chip>
                  </div>
                </div>

                {topicNotes.length > 0 && (
                  <div className="mb-6">
                    <p className="u-eyebrow mb-2 text-moss-400">
                      {t("Research notes", "গবেষণা নোট")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topicNotes.map((n) => (
                        <Link
                          key={n.slug}
                          href={`/notes/${n.slug}`}
                          className="inline-flex min-h-11 items-center rounded-full border border-forest-300 bg-white px-4 text-sm font-bold text-forest-600 transition-colors hover:border-forest-500 hover:text-forest-900"
                        >
                          {NOTE_TYPE_LABEL[n.type][lang]} ·{" "}
                          {lang === "bn" && n.titleBn ? n.titleBn : n.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {shownRepos.map((r) => (
                    <AppCard key={r.name} repo={r} />
                  ))}
                </div>
              </section>
            );
          })}

          {total === 0 && (
            <p className="py-20 text-center text-moss-500">
              {t("No works match those filters.", "এই ফিল্টারে কিছু মেলেনি।")}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
