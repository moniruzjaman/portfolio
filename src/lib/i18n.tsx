import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { hrefFor, splitLangPath } from "@/lib/lang-url";
import type { Lang } from "@/lib/lang-url";

export type { Lang };

const STORAGE_KEY = "ph:lang";
const LANG_EVENT = "ph:lang";
let memoryLang: Lang | null = null; // fallback when localStorage is blocked

const readStored = (): Lang | null => {
  if (memoryLang) return memoryLang;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
  } catch {
    return "en"; // storage blocked — default language, do not crash
  }
};

const subscribeStored = (onChange: () => void) => {
  window.addEventListener(LANG_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LANG_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

/**
 * Language is a first-class audience concern, not a decoration — Bangla-speaking
 * extension officers are the primary readers. The switcher sets <html lang> so
 * screen readers switch voice.
 *
 * The URL is authoritative: /bn/… pages are Bangla (and are prerendered as
 * Bangla), unprefixed pages are English. The stored preference still applies on
 * unprefixed URLs — through useSyncExternalStore, whose server snapshot is
 * null (the prerendered HTML is English and the first client render matches
 * it, so hydration never warns) while the client snapshot applies the stored
 * choice right after — React's supported path for external state. A /bn/ visit
 * persists "bn" so unprefixed in-site links keep Bangla; a visit to an
 * unprefixed URL never rewrites an existing preference. The nav switcher is a
 * real link to the mirrored URL (crawlable, carries hreflang), so switching
 * loads the other language's prerendered page directly.
 */
function useLang() {
  const [location] = useLocation();
  const urlLang = splitLangPath(location).lang;
  const stored = useSyncExternalStore<Lang | null>(
    subscribeStored,
    readStored,
    () => null,
  );

  const lang = urlLang ?? stored ?? "en";

  // External-system writes only: persist a Bangla visit and keep <html lang>
  // truthful. No setState here — `lang` is derived, never mirrored into state.
  useEffect(() => {
    if (urlLang === "bn") {
      memoryLang = "bn";
      try {
        window.localStorage.setItem(STORAGE_KEY, "bn");
      } catch {
        /* private mode */
      }
    }
    document.documentElement.lang = lang;
  }, [urlLang, lang]);

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
