import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * "Open on a phone" — a QR code for an app's address, generated in the browser.
 *
 * No third-party QR service: the address would be sent to someone else's server and
 * the page would depend on it. The generator (~20 KB) is a lazy chunk fetched only
 * when the visitor opens the <details>, so it costs nothing until used.
 *
 * Use case: an extension officer shows a farmer an app and they scan it from the
 * officer's screen or a printout.
 */
export function QrCode({ url, name }: { url: string; name: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || svg) return;
    let alive = true;
    import("qrcode-generator").then((m) => {
      const qr = m.default(0, "M");
      qr.addData(url);
      qr.make();
      // `scalable` emits a viewBox instead of fixed pixels, so CSS controls the size.
      if (alive) setSvg(qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }));
    });
    return () => {
      alive = false;
    };
  }, [open, svg, url]);

  return (
    <details
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group rounded-lg border border-forest-300"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-bold text-forest-600 hover:text-forest-900">
        {t("Open on a phone", "ফোনে খুলুন")}
        <span
          aria-hidden="true"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-moss-500 group-open:hidden"
        >
          QR
        </span>
      </summary>
      <div className="px-3 pb-3">
        {svg ? (
          <div
            role="img"
            aria-label={t(`QR code that opens ${name}`, `${name} খোলার QR কোড`)}
            className="mx-auto w-44 rounded-xl border border-forest-300 bg-white p-3 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <p className="py-6 text-center text-xs text-moss-500">
            {t("Generating…", "তৈরি হচ্ছে…")}
          </p>
        )}
        <p className="mt-2 text-center text-[11px] text-moss-500">
          {t("Point a phone camera at this.", "ফোনের ক্যামেরা এদিকে ধরুন।")}
        </p>
      </div>
    </details>
  );
}
