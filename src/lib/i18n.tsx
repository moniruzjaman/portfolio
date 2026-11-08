import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "bn";

const STORAGE_KEY = "ph:lang";
const LANG_EVENT = "ph:lang";

/**
 * Language is a first-class audience concern, not a decoration — Bangla-speaking
 * extension officers are the primary readers. The toggle sets <html lang> so
 * screen readers switch voice, persists across visits, and is announced via
 * aria-live in the nav.
 *
 * The stored choice is read through useSyncExternalStore: during hydration the
 * server snapshot (English, what prerendered HTML contains) is used, and the
 * client snapshot applies the stored choice right after — React's supported
 * path for external state, so hydration never warns or re-renders the tree
 * with mismatched markup.
 */
let memoryLang: Lang | null = null; // fallback when localStorage is blocked

const readStored = (): Lang => {
  if (memoryLang) return memoryLang;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "bn" ? "bn" : "en";
  } catch {
    return "en"; // storage blocked — default language, do not crash
  }
};

const subscribe = (onChange: () => void) => {
  const onStorage = (e: StorageEvent) => {
    // Another tab changed the language (or cleared storage) — drop the cache.
    if (e.key === STORAGE_KEY || e.key === null) {
      memoryLang = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LANG_EVENT, onChange);
  };
};

export function useLang() {
  const lang = useSyncExternalStore<Lang>(subscribe, readStored, () => "en");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    memoryLang = next; // survive blocked storage within the session
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  const toggle = useCallback(() => setLang(readStored() === "bn" ? "en" : "bn"), [setLang]);
  const t = useCallback((en: string, bn: string) => (lang === "bn" ? bn : en), [lang]);

  return useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
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
