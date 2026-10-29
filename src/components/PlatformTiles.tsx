import { Link } from "wouter";
import { CHANNEL_BLURB, CHANNEL_COLOR, CHANNEL_LABEL, platformStats, type Channel } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

/**
 * The four deployment channels as a status strip. All numbers come from the
 * generated data (apps per channel, distinct reachable hostnames), never typed.
 *
 *   onSelect given  → tiles are toggle buttons (the filter on /works)
 *   otherwise       → tiles link to /works (the home page)
 */
export function PlatformTiles({
  value,
  onSelect,
  dark = false,
}: {
  value?: Channel | "all";
  onSelect?: (c: Channel | "all") => void;
  dark?: boolean;
}) {
  const { t, lang } = useI18n();

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {platformStats.map((p) => {
        const active = value === p.channel;
        const base = dark
          ? `border-white/10 bg-white/[0.05] text-white ${active ? "ring-2 ring-gold-400" : "hover:bg-white/[0.09]"}`
          : `bg-white text-forest-900 ${active ? "border-forest-900 ring-2 ring-forest-900" : "border-forest-400 hover:border-forest-300"}`;
        const body = (
          <>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHANNEL_COLOR[p.channel] }} />
              <span className="font-serif text-lg font-black leading-none">{CHANNEL_LABEL[p.channel][lang]}</span>
            </span>
            <span className="mt-4 block font-serif text-4xl font-black leading-none">{p.apps}</span>
            <span className={`mt-1.5 block font-mono text-[10px] uppercase leading-snug tracking-[0.12em] ${dark ? "text-forest-200" : "text-moss-500"}`}>
              {t("apps", "অ্যাপ")}
              {p.endpoints > 0 ? ` · ${p.endpoints} ${t(p.endpoints === 1 ? "address" : "addresses", "ঠিকানা")}` : ""}
            </span>
            <span className={`mt-3 block text-xs leading-relaxed ${dark ? "text-forest-200" : "text-moss-500"}`}>
              {p.endpoints === 0 && p.apps > 0
                ? t("Deployed; no public address recorded yet", "ডিপ্লয় করা; এখনও প্রকাশ্য ঠিকানা নেই")
                : CHANNEL_BLURB[p.channel][lang]}
            </span>
          </>
        );
        const cls = `block h-full w-full rounded-2xl border p-5 text-left transition-all duration-200 ${base}`;
        return (
          <li key={p.channel}>
            {onSelect ? (
              <button type="button" aria-pressed={active} onClick={() => onSelect(active ? "all" : p.channel)} className={cls}>
                {body}
              </button>
            ) : (
              <Link href="/works" className={cls}>
                {body}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
