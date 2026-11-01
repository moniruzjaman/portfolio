/**
 * Library shelf resolution — pure, no imports, unit-tested by node directly.
 *
 * content-data/library-curation.json maps a Drive folder to a shelf (Research,
 * Reports, …). Real folder names are messy ("Krishak card multimedia portal resources ",
 * "Pesticides_Crisis"), so matching normalises case, underscores and stray
 * whitespace, and a key matches a folder that STARTS WITH it on a word boundary
 * ("krishak card" matches "krishak card multimedia portal resources"). The longest
 * matching key wins, and a per-file entry (by Drive id) overrides everything.
 */

export type Shelf = "research" | "report" | "ebook" | "guide" | "training" | "other";

export type LibCuration = { shelf: Shelf; subjects: string[]; titleBn?: string };

export type LibData = {
  default: LibCuration;
  byPath: Record<string, Omit<LibCuration, "titleBn">>;
  entries: Record<string, Partial<LibCuration>>;
};

export const norm = (s: string): string => s.replace(/[_\s]+/g, " ").trim().toLowerCase();

export function resolveShelf(data: LibData, id: string, path: string[]): LibCuration {
  const top = path[0] ? norm(path[0]) : "";
  let best: Omit<LibCuration, "titleBn"> | undefined;
  let bestLen = -1;
  if (top) {
    for (const [key, value] of Object.entries(data.byPath)) {
      const k = norm(key);
      if ((top === k || top.startsWith(k + " ")) && k.length > bestLen) {
        best = value;
        bestLen = k.length;
      }
    }
  }
  return { ...data.default, ...(best ?? {}), ...(data.entries[id] ?? {}) } as LibCuration;
}
