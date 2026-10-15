import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { notes, NOTE_TYPE_LABEL, type NoteType } from "@/content/notes";
import { PageHeader, Chip } from "@/components/Section";
import { useI18n } from "@/lib/i18n";

const TYPES = Object.keys(NOTE_TYPE_LABEL) as NoteType[];

export default function Notes() {
  const { t, lang } = useI18n();
  const [type, setType] = useState<NoteType | "all">("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return notes
      .filter((note) => type === "all" || note.type === type)
      .filter((note) => !n || [note.title, note.titleBn, note.summary, ...note.tags].join(" ").toLowerCase().includes(n))
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  }, [type, q]);

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn={`${notes.length} field notes`}
        eyebrowBn={`${notes.length}টি মাঠ নোট`}
        titleEn="Writing"
        titleBn="লেখা"
        ledeEn="Policy briefs, field guides, and technical notes from DAE extension work. Written for use in the field — every note states its own limits."
        ledeBn="নীতিপত্র, মাঠ নির্দেশিকা ও প্রযুক্তিগত নোট। মাঠে ব্যবহারের জন্য লেখা — প্রতিটি নোটে সীমাবদ্ধতা উল্লেখ করা আছে।"
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="u-container">
          <div className="mb-10 flex flex-col gap-4 border-b border-forest-300 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["all", ...TYPES] as const).map((ty) => (
                <button
                  key={ty}
                  onClick={() => setType(ty as NoteType | "all")}
                  aria-pressed={type === ty}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    type === ty
                      ? "border-forest-900 bg-forest-900 text-cream-100"
                      : "border-forest-300 text-moss-500 hover:border-forest-500"
                  }`}
                >
                  {ty === "all" ? t("All", "সব") : NOTE_TYPE_LABEL[ty as NoteType][lang]}
                </button>
              ))}
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Filter notes…", "নোট খুঁজুন…")}
              aria-label={t("Filter notes", "নোট ফিল্টার")}
              className="rounded-full border border-forest-300 bg-white px-4 py-1.5 text-sm text-forest-900 outline-none placeholder:text-moss-400"
            />
          </div>

          {shown.length === 0 ? (
            <p className="py-20 text-center text-moss-400">{t("No notes match.", "কোনো নোট মেলেনি।")}</p>
          ) : (
            <div className="space-y-4">
              {shown.map((n) => (
                <Link
                  key={n.slug}
                  href={`/notes/${n.slug}`}
                  className="group grid gap-6 rounded-2xl border border-forest-400 bg-white p-6 transition-all duration-200 hover:border-forest-300 hover:shadow-[0_16px_40px_rgba(10,46,26,0.07)] md:grid-cols-[160px_1fr_auto] md:items-start"
                >
                  <div>
                    <p className="font-mono text-2xl font-bold text-gold-500">{n.year}</p>
                    <Chip>{NOTE_TYPE_LABEL[n.type][lang]}</Chip>
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-black leading-snug text-forest-900">
                      {lang === "bn" && n.titleBn ? n.titleBn : n.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-moss-600">{n.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {n.tags.slice(0, 5).map((tg) => (
                        <span key={tg} className="font-mono text-[10px] uppercase tracking-[0.1em] text-moss-400">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    <ArrowUpRight size={18} className="text-moss-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-moss-400">
                      {n.readingTime} min
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
