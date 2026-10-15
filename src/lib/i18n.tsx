import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "ph:lang";

/**
 * Language is a first-class audience concern, not a decoration — Bangla-speaking
 * extension officers are the primary readers. The toggle sets <html lang> so
 * screen readers switch voice, persists across visits, and is announced via
 * aria-live in the nav.
 */
export function useLang() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
    } catch {
      return "en"; // storage blocked — default language, do not crash
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode */
    }
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === "en" ? "bn" : "en")), []);
  const t = useCallback((en: string, bn: string) => (lang === "bn" ? bn : en), [lang]);

  return useMemo(() => ({ lang, setLang, toggle, t }), [lang, toggle, t]);
}

type LangValue = ReturnType<typeof useLang>;
const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const value = useLang();
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside <LangProvider>");
  return ctx;
}
