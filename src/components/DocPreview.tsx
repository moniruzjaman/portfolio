import { useEffect, useRef } from "react";
import { Download, ExternalLink, X } from "lucide-react";
import { downloadUrl, KIND_LABEL, openUrl, previewUrl, type LibItem } from "@/lib/library";
import { useI18n } from "@/lib/i18n";

/**
 * Preview in a native <dialog>: focus is trapped, Esc closes, and focus returns to
 * the card that opened it — all provided by the platform rather than re-implemented.
 *
 * The Drive frame is mounted ONLY while open. Until a visitor asks for a preview
 * no request goes to Google and nothing is set in their browser. The frame is
 * sandboxed: it can run its own scripts but cannot navigate this page or submit forms.
 */
export function DocPreview({ item, onClose }: { item: LibItem | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t, lang } = useI18n();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dialog element itself (not its content) is a backdrop click.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="doc-preview-title"
      className="m-auto h-[88vh] w-[min(1100px,95vw)] overflow-hidden rounded-2xl border border-forest-200 bg-cream-50 p-0 text-forest-900 shadow-[0_30px_80px_rgba(6,26,16,0.4)] backdrop:bg-forest-950/70 backdrop:backdrop-blur-sm"
    >
      {item && (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-forest-200 px-4 py-3 sm:px-5">
            <div className="min-w-0 flex-1">
              <p className="u-eyebrow text-gold-600">{KIND_LABEL[item.kind][lang]}</p>
              <h2 id="doc-preview-title" className="truncate font-serif text-lg font-black">
                {item.title}
              </h2>
            </div>
            <a
              href={openUrl(item)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest-900/25 px-4 text-xs font-bold hover:bg-white"
            >
              <ExternalLink size={14} aria-hidden="true" /> <span className="hidden sm:inline">{t("Open in Drive", "ড্রাইভে খুলুন")}</span>
              <span className="sr-only sm:hidden">{t("Open in Drive", "ড্রাইভে খুলুন")}</span>
            </a>
            <a
              href={downloadUrl(item)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-900 px-4 text-xs font-bold text-cream-100 hover:bg-forest-600"
            >
              <Download size={14} aria-hidden="true" /> <span className="hidden sm:inline">{t("Download", "ডাউনলোড")}</span>
              <span className="sr-only sm:hidden">{t("Download", "ডাউনলোড")}</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("Close preview", "প্রিভিউ বন্ধ করুন")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-forest-900/15 hover:bg-forest-900 hover:text-cream-100"
            >
              <X size={16} />
            </button>
          </div>
          <iframe
            key={item.id}
            title={item.title}
            src={previewUrl(item)}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            allow="fullscreen"
            className="w-full flex-1 bg-white"
          />
          <p className="border-t border-forest-200 px-5 py-2 text-[11px] text-moss-500">
            {t(
              "The preview is served by Google Drive. If it does not load, use “Open in Drive”.",
              "প্রিভিউ গুগল ড্রাইভ থেকে আসে। না খুললে “ড্রাইভে খুলুন” ব্যবহার করুন।",
            )}
          </p>
        </div>
      )}
    </dialog>
  );
}
