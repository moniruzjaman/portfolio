import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { hrefFor, splitLangPath } from "@/lib/lang-url";
import type { Lang } from "@/lib/lang-url";

export type { Lang };

const STORAGE_KEY = "ph:lang";

/**
 * Language is a first-class audience concern, not a decoration — Bangla-speaking
 * extension officers are the primary readers. The toggle still sets <html lang>
 * so screen readers switch voice.
 *
 * Since the /bn/ URL scheme, the URL is authoritative: /bn/… pages are Bangla
 * (and are prerendered as Bangla), unprefixed pages are English. The stored
 * preference still applies on unprefixed URLs — after hydration, via a
 * post-mount effect, so a returning Bangla reader landing on "/" gets Bangla
 * without a hydration mismatch (the first client render matches the
 * prerendered English markup; the preference flips in afterwards).
 *
 * A /bn/ visit persists "bn" so unprefixed in-site links keep Bangla; a visit
 * to an unprefixed URL never rewrites an existing preference. The nav switcher
 * is a real link to the mirrored URL (crawlable, carries hreflang), so
 * switching loads the other language's prerendered page directly.
 */
function useLang() {
  const [location] = useLocation();
  const urlLang = splitLangPath(location).lang;
  const [stored, setStored] = useState<Lang | null>(null);

  useEffect(() => {
    let s: Lang | null = null;
    try {
      s = window.localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : null;
      if (urlLang === "bn") window.localStorage.setItem(STORAGE_KEY, "bn");
    } catch {
      /* private mode — fall through to the URL language */
    }
    setStored(urlLang ?? s);
  }, [urlLang]);

  const lang = urlLang ?? stored ?? "en";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((en: string, bn: string) => (lang === "bn" ? bn : en), [lang]);

  /** href of the same page in the other language (real link, hreflang-carrying). */
  const langSwitchHref = hrefFor(lang === "bn" ? "en" : "bn", location);

  return useMemo(() => ({ lang, t, langSwitchHref }), [lang, t, langSwitchHref]);
}

type LangValue = ReturnType<typeof useLang>;
const LangContext = createContext<LangValue | null>(null);

/** Must be rendered INSIDE <Router> — it derives language from the location. */
export function LangProvider({ children }: { children: ReactNode }) {
  const value = useLang();
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside <LangProvider>");
  return ctx;
}
