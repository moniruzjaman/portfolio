import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { repos, endpointDirectory, stats, CHANNEL_LABEL, CHANNEL_COLOR, meta, type Channel } from "@/lib/data";
import { PageHeader, Chip } from "@/components/Section";
import { AppCard } from "@/components/AppCard";
import { PlatformTiles } from "@/components/PlatformTiles";
import { useI18n } from "@/lib/i18n";

type View = "catalogue" | "endpoints";

export default function Works() {
  const { t, lang } = useI18n();
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [view, setView] = useState<View>("catalogue");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const languages = useMemo(
    () => [...new Set(repos.map((r) => r.language).filter(Boolean))].sort() as string[],
    [],
  );
  const needle = q.trim().toLowerCase();

  const shown = useMemo(
    () =>
      repos.filter((r) => {
        if (channel !== "all" && !r.channels.includes(channel)) return false;
        if (langFilter !== "all" && r.language !== langFilter) return false;
        if (!needle) return true;
        return [r.name, r.title, r.description ?? "", ...r.topics].join(" ").toLowerCase().includes(needle);
      }),
    [channel, langFilter, needle],
  );

  const rows = useMemo(
    () =>
      endpointDirectory.filter(
        (e) =>
          (channel === "all" || e.channel === channel) &&
          (!needle || [e.label, e.repo.title, e.repo.name].join(" ").toLowerCase().includes(needle)),
      ),
    [channel, needle],
  );

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn={`${stats.repos} works · ${stats.addresses} live addresses`}
        eyebrowBn={`${stats.repos}টি কাজ · ${stats.addresses}টি চালু ঠিকানা`}
        titleEn="The live ecosystem"
        titleBn="চালু ইকোসিস্টেম"
        ledeEn="Every app and site, across krishiai.live, Vercel, Cloudflare and GitHub Pages. Discovered automatically from GitHub — anything newly published appears within a day."
        ledeBn="krishiai.live, ভার্সেল, ক্লাউডফ্লেয়ার ও গিটহাব পেজ জুড়ে প্রতিটি অ্যাপ ও সাইট। গিটহাব থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত — নতুন কিছু প্রকাশিত হলে একদিনের মধ্যে দেখা যাবে।"
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="u-container">
          <PlatformTiles value={channel} onSelect={setChannel} />

          <div className="mb-8 mt-10 flex flex-col gap-4 border-b border-forest-300 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label={t("View", "দৃশ্য")} className="flex gap-2">
              {(["catalogue", "endpoints"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`min-h-11 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                    view === v ? "border-forest-900 bg-forest-900 text-cream-100" : "border-forest-300 text-moss-500 hover:border-forest-500"
                  }`}
                >
                  {v === "catalogue" ? t("Apps", "অ্যাপ") : t("Addresses", "ঠিকানা")}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {view === "catalogue" && (
                <>
                  <label className="sr-only" htmlFor="lang-filter">
                    {t("Filter by language", "ভাষা অনুযায়ী ফিল্টার")}
                  </label>
                  <select
                    id="lang-filter"
                    value={langFilter}
                    onChange={(e) => setLangFilter(e.target.value)}
                    className="min-h-11 rounded-full border border-forest-300 bg-white px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-moss-500"
                  >
                    <option value="all">{t("Any language", "যেকোনো ভাষা")}</option>
                    {languages.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <label className="sr-only" htmlFor="work-search">
                {t("Filter", "ফিল্টার")}
              </label>
              <input
                id="work-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Filter…", "খুঁজুন…")}
                className="min-h-11 rounded-full border border-forest-300 bg-white px-4 text-sm text-forest-900 outline-none placeholder:text-moss-400"
              />
            </div>
          </div>

          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.14em] text-moss-500" aria-live="polite">
            {view === "catalogue" ? shown.length : rows.length} {t("shown", "দেখানো হচ্ছে")} · {t("scanned", "যাচাই করা")} {meta.scanned}{" "}
            {t("repositories", "রিপোজিটরি")} · {t("synced", "সিঙ্ক")} {meta.generatedAt.slice(0, 10)}
          </p>

          {view === "catalogue" ? (
            shown.length === 0 ? (
              <p className="py-20 text-center text-moss-500">{t("No works match those filters.", "এই ফিল্টারে কিছু মেলেনি।")}</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((r) => (
                  <AppCard key={r.name} repo={r} />
                ))}
              </div>
            )
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-forest-400 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">{t("Every live address", "প্রতিটি চালু ঠিকানা")}</caption>
                <thead className="border-b border-forest-300 bg-cream-50">
                  <tr className="font-mono text-[10px] uppercase tracking-[0.14em] text-moss-500">
                    <th scope="col" className="px-5 py-3">{t("Address", "ঠিকানা")}</th>
                    <th scope="col" className="px-5 py-3">{t("App", "অ্যাপ")}</th>
                    <th scope="col" className="px-5 py-3">{t("Platform", "প্ল্যাটফর্ম")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.url} className="border-b border-forest-300/60 last:border-0">
                      <td className="px-5 py-3">
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 break-all font-mono text-xs font-bold text-forest-600 hover:text-forest-900"
                        >
                          {e.label} <ExternalLink size={12} aria-hidden="true" />
                          <span className="sr-only">{t("(opens in a new tab)", "(নতুন ট্যাবে খুলবে)")}</span>
                        </a>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/works/${e.repo.slug}`} className="font-bold text-forest-900 hover:text-forest-600">
                          {e.repo.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Chip color={CHANNEL_COLOR[e.channel]}>{CHANNEL_LABEL[e.channel][lang]}</Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <p className="py-12 text-center text-moss-500">{t("No addresses match.", "কোনো ঠিকানা মেলেনি।")}</p>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
