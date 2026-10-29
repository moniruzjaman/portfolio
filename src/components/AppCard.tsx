import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { brandOf, primaryEndpoint, relativeDate, CHANNEL_LABEL, type Repo } from "@/lib/data";
import { AUDIENCE_LABEL, audiencesOf, summaryFor, titleFor, typeOf, TYPE_LABEL } from "@/lib/curation";
import type { Brand } from "@/lib/brand";
import { Chip } from "@/components/Section";
import { useI18n } from "@/lib/i18n";

/**
 * The app's own mark. Uses the icon the app ships (PWA manifest / touch icon);
 * falls back to a monogram if there is none or it fails to load. The <img> is
 * decorative (alt="") because the card's title already names the app.
 */
export function BrandMark({ brand, size = 44, radius = 12 }: { brand: Brand; size?: number; radius?: number }) {
  const [failed, setFailed] = useState(false);
  const showIcon = brand.icon && !failed;
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center overflow-hidden font-serif font-black"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.38,
        // A real icon sits on white so a transparent PNG/SVG is legible on any brand colour.
        background: showIcon ? "#ffffff" : "rgba(255,255,255,0.16)",
        color: brand.fg,
        boxShadow: showIcon ? "0 0 0 1px rgba(255,255,255,0.35)" : "inset 0 0 0 1px rgba(255,255,255,0.28)",
      }}
    >
      {showIcon ? (
        <img
          src={brand.icon!}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          width={size}
          height={size}
          className="h-full w-full object-contain p-[12%]"
          onError={() => setFailed(true)}
        />
      ) : (
        brand.monogram
      )}
    </span>
  );
}

/**
 * One card per app. The whole card is a single link (design-system §5: no nested
 * interactive elements, so the tab order stays clean). The colour band is the
 * app's own theme colour when known, a deterministic palette colour otherwise.
 */
export function AppCard({ repo, compact = false }: { repo: Repo; compact?: boolean }) {
  const { lang } = useI18n();
  const brand = brandOf(repo);
  const ep = primaryEndpoint(repo);
  const summary = summaryFor(repo, lang);
  const audiences = audiencesOf(repo).slice(0, 2);

  return (
    <Link
      href={`/works/${repo.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-forest-400 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-forest-300 hover:shadow-[0_16px_40px_rgba(10,46,26,0.1)]"
    >
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: brand.color, color: brand.fg }}>
        <BrandMark brand={brand} size={compact ? 38 : 44} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em] opacity-90">
            {ep ? ep.short : repo.name}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] opacity-75">
            {repo.channels.map((c) => CHANNEL_LABEL[c][lang]).join(" · ")}
          </span>
        </span>
        <ArrowUpRight
          size={16}
          aria-hidden="true"
          className="shrink-0 opacity-80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-black leading-snug text-forest-900">{titleFor(repo, lang)}</h3>
        {summary && (
          <p className={`mt-2 flex-1 text-sm leading-relaxed text-moss-600 ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
            {summary}
          </p>
        )}
        {audiences.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {audiences.map((a) => (
              <Chip key={a}>{AUDIENCE_LABEL[a][lang]}</Chip>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-forest-300 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-moss-500">
          <span>{TYPE_LABEL[typeOf(repo)][lang]}</span>
          <span className="flex items-center gap-1.5">
            {ep && <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest-400" aria-label={lang === "bn" ? "চালু" : "live"} />}
            {relativeDate(repo.pushedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
