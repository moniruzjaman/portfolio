import { useState } from "react";
import { Link } from "wouter";
import { expertiseGraphs, KnowledgeGraph } from "@/components/KnowledgeGraph";
import { notes, NOTE_TYPE_LABEL } from "@/content/notes";
import { repos } from "@/lib/data";
import { PageHeader } from "@/components/Section";
import { useI18n } from "@/lib/i18n";

export default function Expertise() {
  const { t, lang } = useI18n();
  const [active, setActive] = useState(expertiseGraphs[0]);

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn="Six areas"
        eyebrowBn="ছয়টি ক্ষেত্র"
        titleEn="Expertise, and the systems behind it"
        titleBn="দক্ষতা এবং এর পেছনের ব্যবস্থা"
        ledeEn="Each area connects to the published repositories that implement it. The graph is a live view — if a repository is added or renamed upstream, the links here change with it."
        ledeBn="প্রতিটি ক্ষেত্র সংশ্লিষ্ট প্রকাশিত রিপোজিটরির সাথে যুক্ত। গ্রাফটি সরাসরি হিসাব হয় — উপরে নতুন রিপোজিটরি যোগ হলে লিংকও পরিবর্তন হবে।"
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="u-container">
          <div className="mb-10 flex flex-wrap gap-2">
            {expertiseGraphs.map((g) => (
              <button
                key={g.id}
                onClick={() => setActive(g)}
                aria-pressed={active.id === g.id}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                  active.id === g.id
                    ? "border-forest-900 bg-forest-900 text-cream-100"
                    : "border-forest-300 text-moss-500 hover:border-forest-500"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <KnowledgeGraph graph={active} />

            <div className="rounded-[1.5rem] border border-forest-300 bg-white p-7">
              <p className="u-eyebrow text-gold-500">{active.eyebrow}</p>
              <h2 className="mt-3 font-serif text-3xl font-black text-forest-900">{active.title}</h2>
              <p className="mt-1 text-sm font-medium text-moss-400">{active.bangla}</p>
              <p className="mt-5 text-sm leading-relaxed text-moss-600">{active.summary}</p>

              <div className="mt-7 border-t border-forest-300 pt-5">
                <p className="u-eyebrow mb-3 text-moss-400">
                  {t("Implementing repositories", "বাস্তবায়নকারী রিপোজিটরি")}
                </p>
                <ul className="space-y-1.5">
                  {repos
                    .filter((r) => active.match.some((m) => [r.name, r.title, r.description ?? ""].join(" ").toLowerCase().includes(m)))
                    .slice(0, 6)
                    .map((r) => (
                      <li key={r.name}>
                        <Link
                          href={`/works/${r.slug}`}
                          className="text-sm font-medium text-forest-600 transition-colors hover:text-forest-900"
                        >
                          {r.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="mt-7 border-t border-forest-300 pt-5">
                <p className="u-eyebrow mb-3 text-moss-400">{t("Field notes", "মাঠ নোট")}</p>
                <ul className="space-y-1.5">
                  {notes
                    .filter((n) => n.expertise.includes(active.id))
                    .map((n) => (
                      <li key={n.slug}>
                        <Link
                          href={`/notes/${n.slug}`}
                          className="text-sm font-medium text-forest-600 transition-colors hover:text-forest-900"
                        >
                          {lang === "bn" && n.titleBn ? n.titleBn : n.title}
                        </Link>
                        <span className="ml-2 font-mono text-[10px] text-moss-400">
                          {NOTE_TYPE_LABEL[n.type][lang]} · {n.year}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
