import { ArrowUpRight } from "lucide-react";
import { connectProfiles } from "@/components/Socials";
import { useI18n } from "@/lib/i18n";

/**
 * "Connect & Follow" — the three professional social profiles.
 * Links come from the single config in src/lib/author.ts (via Socials.tsx);
 * every card is one large keyboard-focusable link that opens safely in a new tab.
 * No invented statistics: the YouTube card describes the channel's purpose only.
 */
export function ConnectSection() {
  const { t } = useI18n();
  return (
    <section
      id="connect"
      aria-labelledby="connect-title"
      className="scroll-mt-20 border-y border-forest-300 bg-white px-5 py-24 sm:px-8 lg:px-12"
    >
      <div className="u-container py-8">
        <div className="mb-12 max-w-2xl">
          <p className="u-eyebrow mb-3 text-gold-500">{t("Follow along", "অনুসরণ করুন")}</p>
          <h2 id="connect-title" className="font-serif text-4xl font-black text-forest-900 sm:text-5xl">
            {t("Connect & Follow", "যোগাযোগ ও ফলো")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-moss-500">
            {t(
              "Field updates, professional background, and agricultural knowledge — published directly on these channels.",
              "মাঠের আপডেট, পেশাগত পরিচিতি ও কৃষি জ্ঞান — এই মাধ্যমগুলোতেই প্রকাশিত।",
            )}
          </p>
        </div>

        <ul className="grid gap-5 md:grid-cols-3">
          {connectProfiles.map(({ key, label, href, handle, Icon, accent, en, bn }) => (
            <li key={key}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className="group flex h-full flex-col rounded-[1.5rem] border border-forest-400 bg-cream-50 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest-300"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-forest-300 bg-white ${accent}`}>
                    <Icon size={20} />
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-moss-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest-900"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-serif text-xl font-black leading-snug text-forest-900 group-hover:text-forest-600">
                  {label}
                </h3>
                <p className="mt-1 break-all font-mono text-[11px] uppercase tracking-[0.12em] text-moss-400">
                  {handle}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-moss-600">{t(en, bn)}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
