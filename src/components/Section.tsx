import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";

/** Scroll to top on route change, and move focus to the h1 for screen readers. */
export function useRouteReset() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const h1 = document.querySelector("main h1");
    if (h1 instanceof HTMLElement) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
    }
  }, [location]);
}

/** Bilingual section kicker. Reads the active language from context. */
export function SectionHeading({
  en,
  bn,
  className = "text-gold-500",
}: {
  en: string;
  bn: string;
  className?: string;
}) {
  const { lang } = useI18n();
  return <p className={`u-eyebrow mb-3 ${className}`}>{lang === "bn" ? bn : en}</p>;
}

export function PageHeader({
  eyebrowEn,
  eyebrowBn,
  titleEn,
  titleBn,
  ledeEn,
  ledeBn,
  lang,
}: {
  eyebrowEn: string;
  eyebrowBn: string;
  titleEn: string;
  titleBn: string;
  ledeEn?: string;
  ledeBn?: string;
  lang: "en" | "bn";
}) {
  return (
    <header className="border-b border-forest-300 px-5 pb-14 pt-36 sm:px-8 lg:px-12">
      <div className="u-container max-w-4xl">
        <p className="u-eyebrow mb-5 text-gold-500">{lang === "bn" ? eyebrowBn : eyebrowEn}</p>
        <h1
          tabIndex={-1}
          className="font-serif text-4xl font-black leading-[1.05] tracking-[-0.02em] text-forest-900 outline-none sm:text-6xl"
        >
          {lang === "bn" ? titleBn : titleEn}
        </h1>
        {(ledeEn || ledeBn) && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-moss-500">
            {lang === "bn" ? ledeBn : ledeEn}
          </p>
        )}
      </div>
    </header>
  );
}

export function Chip({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-300 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-moss-500">
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </span>
  );
}
