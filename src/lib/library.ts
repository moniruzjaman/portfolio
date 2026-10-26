import raw from "../data/library.generated.json";

export type Kind = "pdf" | "slides" | "doc" | "sheet" | "image" | "other";

export type LibItem = {
  id: string;
  collection: string;
  name: string;
  title: string;
  kind: Kind;
  mime: string;
  modified: string | null;
  size: number | null;
  /** Sub-folder names below the collection root. */
  path: string[];
  resourceKey?: string;
};

export type Collection = {
  key: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  folderId: string | null;
  items: LibItem[];
};

export const library = {
  generatedAt: raw.generatedAt as string | null,
  mode: raw.mode as string,
  /** The single Drive folder everything is sorted from, when configured. */
  root: (raw as { root?: { folderId: string } | null }).root ?? null,
  collections: raw.collections as Collection[],
};

export const libraryItems: LibItem[] = library.collections.flatMap((c) => c.items);
export const hasLibrary = Boolean(library.root) || library.collections.some((c) => c.items.length > 0 || c.folderId);

export const KIND_LABEL: Record<Kind, { en: string; bn: string }> = {
  pdf: { en: "PDF", bn: "পিডিএফ" },
  slides: { en: "Slides", bn: "স্লাইড" },
  doc: { en: "Document", bn: "নথি" },
  sheet: { en: "Sheet", bn: "স্প্রেডশিট" },
  image: { en: "Image", bn: "ছবি" },
  other: { en: "File", bn: "ফাইল" },
};

/* ── Drive URL builders ────────────────────────────────────────────────────
 * Only the file id (validated at sync time) is stored. URLs are built here, so a
 * hostile filename or a changed Drive URL scheme cannot inject anything into the
 * generated data. Hosts used: drive.google.com, docs.google.com.            */

const NATIVE = {
  slides: "application/vnd.google-apps.presentation",
  doc: "application/vnd.google-apps.document",
  sheet: "application/vnd.google-apps.spreadsheet",
};

const rk = (i: LibItem, sep: "?" | "&") => (i.resourceKey ? `${sep}resourcekey=${encodeURIComponent(i.resourceKey)}` : "");

/** Opens the file in Drive itself — works for every type. */
export const openUrl = (i: LibItem) => `https://drive.google.com/open?id=${i.id}${rk(i, "&")}`;

/** Embeddable preview, loaded only after the visitor asks for it. */
export function previewUrl(i: LibItem): string {
  if (i.mime === NATIVE.slides) return `https://docs.google.com/presentation/d/${i.id}/embed?start=false&loop=false${rk(i, "&")}`;
  if (i.mime === NATIVE.doc) return `https://docs.google.com/document/d/${i.id}/preview${rk(i, "?")}`;
  if (i.mime === NATIVE.sheet) return `https://docs.google.com/spreadsheets/d/${i.id}/preview${rk(i, "?")}`;
  return `https://drive.google.com/file/d/${i.id}/preview${rk(i, "?")}`;
}

export function downloadUrl(i: LibItem): string {
  if (i.mime === NATIVE.slides) return `https://docs.google.com/presentation/d/${i.id}/export/pptx`;
  if (i.mime === NATIVE.doc) return `https://docs.google.com/document/d/${i.id}/export?format=pdf`;
  if (i.mime === NATIVE.sheet) return `https://docs.google.com/spreadsheets/d/${i.id}/export?format=xlsx`;
  return `https://drive.google.com/uc?export=download&id=${i.id}${rk(i, "&")}`;
}

export const thumbUrl = (i: LibItem, w = 480) => `https://drive.google.com/thumbnail?id=${i.id}&sz=w${w}${rk(i, "&")}`;
export const folderUrl = (id: string) => `https://drive.google.com/drive/folders/${id}`;
export const folderEmbedUrl = (id: string) => `https://drive.google.com/embeddedfolderview?id=${id}#grid`;

export function formatBytes(n: number | null): string {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
