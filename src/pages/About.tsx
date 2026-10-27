import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";
import { socials } from "@/components/Socials";
import { author, figures } from "@/lib/author";
import { stats } from "@/lib/data";
import { notes } from "@/content/notes";
import { PageHeader } from "@/components/Section";
import { useI18n } from "@/lib/i18n";

export default function About() {
  const { t, lang } = useI18n();

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn={author.cadre}
        eyebrowBn={author.cadre}
        titleEn={author.name}
        titleBn={author.name}
        ledeEn={author.vision}
        ledeBn={author.vision}
      />

      <section className="px-5 py-14 sm:px-8 lg:px-12">
        <div className="u-container grid gap-12 lg:grid-cols-[1fr_300px]">
          <div>
            {/* career */}
            <h2 className="mb-8 font-serif text-2xl font-black text-forest-900">
              {t("Career", "কর্মজীবন")}
            </h2>
            <ol className="relative space-y-8 border-l-2 border-forest-200 pl-8">
              {author.career.map((c, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[41px] top-1.5 h-3 w-3 rounded-full border-2 border-cream-100 bg-forest-500" />
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold-500">
                    {c.from} — {c.to}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-black text-forest-900">{c.role}</h3>
                  <p className="mt-0.5 text-sm font-medium text-forest-500">
                    {lang === "bn" ? c.placeBn : c.place}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-moss-500">{c.note}</p>
                </li>
              ))}
            </ol>

            {/* education */}
            <h2 className="mb-8 mt-16 font-serif text-2xl font-black text-forest-900">
              {t("Education", "শিক্ষাগত যোগ্যতা")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {author.education.map((e) => (
                <div key={e.degree} className="rounded-2xl border border-forest-300 bg-white p-6">
                  <GraduationCap size={20} className="mb-3 text-forest-500" />
                  <p className="font-serif text-lg font-black text-forest-900">{e.degree}</p>
                  <p className="mt-0.5 text-sm text-moss-500">
                    {lang === "bn" ? e.orgBn : e.org}
                  </p>
                  <p className="mt-3 font-mono text-xs text-moss-400">
                    {e.year} · {e.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* competencies */}
            <h2 className="mb-8 mt-16 font-serif text-2xl font-black text-forest-900">
              {t("Competencies", "দক্ষতা")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {author.competencies.map((c) => (
                <div key={c.group} className="rounded-2xl border-l-4 border-forest-400 bg-white p-6">
                  <h3 className="font-bold text-forest-900">
                    {lang === "bn" ? c.groupBn : c.group}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {c.items.map((it) => (
                      <li key={it} className="text-sm text-moss-600">
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <img
              src={`${import.meta.env.BASE_URL}portrait.jpg`}
              alt={author.name}
              width={720}
              height={693}
              loading="lazy"
              className="w-full rounded-2xl border border-forest-300 bg-white object-cover"
            />
            <div className="rounded-2xl border border-forest-300 bg-white p-6">
              <p className="u-eyebrow mb-5 text-moss-400">{t("Contact", "যোগাযোগ")}</p>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href={`mailto:${author.email}`} className="flex items-start gap-2.5 text-moss-600 transition-colors hover:text-forest-900">
                    <Mail size={15} className="mt-0.5 shrink-0 text-forest-500" />
                    <span className="break-all">{author.email}</span>
                  </a>
                </li>
                {author.showPhone && (
                <li>
                  <a href={`tel:+${author.phone.replace(/^\+/, "")}`} className="flex items-center gap-2.5 text-moss-600 transition-colors hover:text-forest-900">
                    <Phone size={15} className="shrink-0 text-forest-500" />
                    {author.phoneDisplay}
                  </a>
                </li>
                )}
                {socials.map(({ key, href, handle, Icon }) => (
                  <li key={key}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-moss-600 transition-colors hover:text-forest-900">
                      <Icon size={15} className="shrink-0 text-forest-500" />
                      <span className="break-all">{handle}</span>
                    </a>
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-moss-600">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-forest-500" />
                  <span>
                    {author.org}, {author.location}
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-forest-300 bg-forest-900 p-6 text-cream-100">
              <p className="u-eyebrow mb-4 text-forest-200">{t("By the numbers", "সংখ্যায়")}</p>
              <dl className="space-y-3 text-sm">
                {[
                  { n: figures.yearsField, l: t("years in field extension", "বছর মাঠ সম্প্রসারণে") },
                  { n: figures.postings, l: t("postings across Bangladesh", "টি পদায় বাংলাদেশ জুড়ে") },
                  { n: stats.repos, l: t("public repositories", "উন্মুক্ত রিপোজিটরি") },
                  { n: notes.length, l: t("published field notes", "প্রকাশিত মাঠ নোট") },
                ].map((s) => (
                  <div key={s.l} className="flex items-baseline gap-2">
                    <dt className="font-serif text-2xl font-black text-gold-400">{s.n}</dt>
                    <dd className="text-xs text-forest-200">{s.l}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-forest-300">
                {t(
                  "Repository and note counts are computed live from the source data, not typed by hand.",
                  "রিপোজিটরি ও নোটের সংখ্যা সরাসরি হিসাব করা, হাতে লেখা নয়।",
                )}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
