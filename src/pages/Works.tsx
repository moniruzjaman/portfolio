import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Filter } from "lucide-react";
import { repos, CHANNEL_LABEL, CHANNEL_COLOR, relativeDate, meta, type Channel } from "@/lib/data";
import { PageHeader, Chip } from "@/components/Section";
import { useI18n } from "@/lib/i18n";

const CHANNELS = Object.keys(CHANNEL_LABEL) as Channel[];

export default function Works() {
  const { t, lang } = useI18n();
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [lang_, setLangFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const languages = useMemo(
    () => [...new Set(repos.map((r) => r.language).filter(Boolean))].sort() as string[],
    [],
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return repos.filter((r) => {
      if (channel !== "all" && !r.channels.includes(channel)) return false;
      if (lang_ !== "all" && r.language !== lang_) return false;
      if (!needle) return true;
      return [r.name, r.title, r.description ?? "", ...r.topics].join(" ").toLowerCase().includes(needle);
    });
  }, [channel, lang_, q]);

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn={`${repos.length} published works`}
        eyebrowBn={`${repos.length}টি প্রকাশিত কাজ`}
        titleEn="Systems, tools, and field services"
        titleBn="ব্যবস্থা, সরঞ্জাম ও মাঠ সেবা"
        ledeEn="Everything here is public. Auto-discovered from the GitHub dashboard — anything newly pushed that matches a deployment channel appears within a day, with no manual list to maintain."
        ledeBn="এখানে সবকিছুই উন্মুক্ত। গিটহাব ড্যাশবোর্ড থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত — নতুন কিছু প্রকাশিত হলে একদিনের মধ্যেই এখানে দেখা যাবে।"
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="u-container">
          {/* filters */}
          <div className="mb-10 flex flex-col gap-4 border-b border-forest-300 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={14} className="mr-1 text-moss-400" />
              {(["all", ...CHANNELS] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setChannel(c as Channel | "all")}
                  aria-pressed={channel === c}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    channel === c
                      ? "border-forest-900 bg-forest-900 text-cream-100"
                      : "border-forest-300 text-moss-500 hover:border-forest-500"
                  }`}
                >
                  {c === "all"
                    ? t("All", "সব")
                    : `${CHANNEL_LABEL[c as Channel][lang]} · ${
                        meta.channels[CHANNEL_LABEL[c as Channel].en] ?? repos.filter((r) => r.channels.includes(c as Channel)).length
                      }`}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="sr-only" htmlFor="lang-filter">
                Filter by language
              </label>
              <select
                id="lang-filter"
                value={lang_}
                onChange={(e) => setLangFilter(e.target.value)}
                className="rounded-full border border-forest-300 bg-white px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-moss-500"
              >
                <option value="all">{t("Any language", "যেকোনো ভাষা")}</option>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="work-search">
                Filter works
              </label>
              <input
                id="work-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Filter…", "খুঁজুন…")}
                className="rounded-full border border-forest-300 bg-white px-4 py-1.5 text-sm text-forest-900 outline-none placeholder:text-moss-400"
              />
            </div>
          </div>

          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.14em] text-moss-400">
            {shown.length} {t("shown", "দেখানো হচ্ছে")} · {t("scanned", "যাচাই করা")} {meta.scanned}{" "}
            {t("repositories", "রিপোজিটরি")} · synced {meta.generatedAt.slice(0, 10)}
          </p>

          {shown.length === 0 ? (
            <p className="py-20 text-center text-moss-400">{t("No works match those filters.", "এই ফিল্টারে কিছু মেলেনি।")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((r) => (
                <Link
                  key={r.name}
                  href={`/works/${r.slug}`}
                  className="group flex flex-col rounded-2xl border border-forest-400 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-forest-300 hover:shadow-[0_16px_40px_rgba(10,46,26,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-lg font-black leading-snug text-forest-900">
                      {r.title}
                    </h2>
                    <ArrowUpRight
                      size={16}
                      className="mt-1 shrink-0 text-moss-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>

                  {r.description && (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-moss-600">
                      {r.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {r.channels.map((c) => (
                      <Chip key={c} color={CHANNEL_COLOR[c]}>
                        {CHANNEL_LABEL[c][lang]}
                      </Chip>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-forest-300 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-moss-400">
                    <span>{r.language ?? "—"}</span>
                    <span className="flex items-center gap-1.5">
                      {r.live || r.pages ? (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest-400" />
                      ) : null}
                      {relativeDate(r.pushedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
