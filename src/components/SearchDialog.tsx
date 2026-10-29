import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Search, CornerDownLeft } from "lucide-react";
import { repos } from "@/lib/data";
import { summaryFor, titleFor } from "@/lib/curation";
import { libraryItems, KIND_LABEL } from "@/lib/library";
import { notes } from "@/content/notes";
import { useI18n } from "@/lib/i18n";

/**
 * A small hand-rolled scorer rather than a search dependency.
 *
 * Why: the corpus is ~50 records with short, well-known names. Orama would add a
 * WASM bundle and a lazy-load hop to save an afternoon of ranking work. Prefix
 * match > word-start match > substring, with a mild recency tiebreak — that
 * ordering matches how people actually type repo names.
 */
type Hit = {
  kind: "repo" | "note" | "doc";
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

function score(query: string, ...fields: string[]): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  let best = 0;
  for (const raw of fields) {
    const f = (raw ?? "").toLowerCase();
    if (!f) continue;
    if (f === q) best = Math.max(best, 100);
    else if (f.startsWith(q)) best = Math.max(best, 80);
    else if (f.split(/[\s\-_/.]+/).some((w) => w.startsWith(q))) best = Math.max(best, 60);
    else if (f.includes(q)) best = Math.max(best, 40);
  }
  return best;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { t, lang } = useI18n();

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      // Focus after paint so the dialog is mounted and the caret lands correctly.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    if (q.trim().length < 1) return [];
    const repoHits: Hit[] = repos
      .map((r) => ({
        kind: "repo" as const,
        title: titleFor(r, lang),
        subtitle: summaryFor(r, lang) || r.name,
        href: `/works/${r.slug}`,
        score:
          score(q, r.name, titleFor(r, "en"), titleFor(r, "bn"), summaryFor(r, "en"), summaryFor(r, "bn"), ...(r.topics ?? [])) +
          (Date.now() - new Date(r.pushedAt).getTime() < 86_400_000 * 30 ? 5 : 0),
      }))
      .filter((h) => h.score > 0);

    const noteHits: Hit[] = notes
      .map((n) => ({
        kind: "note" as const,
        title: lang === "bn" && n.titleBn ? n.titleBn : n.title,
        subtitle: `${n.type} · ${n.year ?? ""}`.trim(),
        href: `/notes/${n.slug}`,
        score: score(q, n.title, n.titleBn ?? "", n.summary ?? "", ...(n.tags ?? [])),
      }))
      .filter((h) => h.score > 0);

    const docHits: Hit[] = libraryItems
      .map((d) => ({
        kind: "doc" as const,
        title: d.title,
        subtitle: `${KIND_LABEL[d.kind].en} · ${d.modified?.slice(0, 4) ?? ""}`.trim(),
        href: "/library",
        score: score(q, d.title, d.path.join(" ")),
      }))
      .filter((h) => h.score > 0);

    return [...repoHits, ...noteHits, ...docHits].sort((a, b) => b.score - a.score).slice(0, 8);
  }, [q, lang]);

  useEffect(() => setCursor(0), [q]);

  if (!open) return null;

  const go = (h: Hit) => {
    navigate(h.href, { replace: false });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-forest-950/50 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("Search", "অনুসন্ধান")}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-forest-200 bg-cream-50 shadow-[0_30px_80px_rgba(6,26,16,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-forest-200 px-4">
          <Search size={17} className="shrink-0 text-moss-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, hits.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              }
              if (e.key === "Enter" && hits[cursor]) go(hits[cursor]);
            }}
            placeholder={t("Search works, notes and library…", "কাজ, নোট ও লাইব্রেরি খুঁজুন…")}
            className="w-full bg-transparent py-4 text-sm text-forest-900 outline-none placeholder:text-moss-400"
            aria-label={t("Search", "অনুসন্ধান")}
          />
          <kbd className="hidden shrink-0 rounded border border-forest-200 px-1.5 py-0.5 font-mono text-[10px] text-moss-400 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto">
          {q.trim() === "" && (
            <p className="px-4 py-8 text-center text-sm text-moss-400">
              {t("Type to search", "খুঁজতে লিখুন")}
            </p>
          )}
          {q.trim() !== "" && hits.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-moss-400">
              {t("No matches", "কিছু মেলেনি")}
            </p>
          )}
          {hits.map((h, i) => (
            <button
              key={h.href}
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(h)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                i === cursor ? "bg-forest-200/50" : ""
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-forest-900">{h.title}</span>
                <span className="mt-0.5 block truncate text-xs text-moss-500">{h.subtitle}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="u-eyebrow text-moss-400">
                  {h.kind === "repo" ? t("Work", "কাজ") : h.kind === "doc" ? t("Library", "লাইব্রেরি") : t("Note", "নোট")}
                </span>
                {i === cursor && <CornerDownLeft size={13} className="text-moss-400" />}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-forest-200 px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-moss-400">
            {repos.length} works · {notes.length} notes · {libraryItems.length} docs
          </span>
          <span className="font-mono text-[10px] text-moss-400">↑↓ ↵</span>
        </div>
      </div>
    </div>
  );
}
