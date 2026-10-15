import { Link, useRoute } from "wouter";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";
import { GithubMark } from "@/components/icons";
import { bySlug, CHANNEL_LABEL, CHANNEL_COLOR, relativeDate, type Channel } from "@/lib/data";
import { notes } from "@/content/notes";
import { PageHeader, Chip } from "@/components/Section";
import { useI18n } from "@/lib/i18n";
import { NotFound } from "./NotFound";

export default function WorkDetail() {
  const [, params] = useRoute("/works/:slug");
  const { t, lang } = useI18n();
  const repo = params ? bySlug(params.slug) : undefined;

  if (!repo) return <NotFound />;

  const related = notes
    .filter((n) =>
      n.expertise.some((e) =>
        repo.channels.some((c) => c.includes(e.split("-")[0])) ||
        n.tags.some((tag) => `${repo.name} ${repo.title}`.toLowerCase().includes(tag)),
      ),
    )
    .slice(0, 3);

  return (
    <>
      <PageHeader
        lang={lang}
        eyebrowEn={repo.name}
        eyebrowBn={repo.name}
        titleEn={repo.title}
        titleBn={repo.title}
        ledeEn={repo.description ?? undefined}
        ledeBn={repo.description ?? undefined}
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="u-container grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <Link
              href="/works"
              className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-moss-500 transition-colors hover:text-forest-900"
            >
              <ArrowLeft size={13} /> {t("All works", "সব কাজ")}
            </Link>

            {repo.description && (
              <p className="border-l-2 border-gold-400 pl-5 text-lg leading-relaxed text-moss-500">
                {repo.description}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              {repo.live && (
                <a
                  href={repo.live}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-2.5 text-sm font-bold text-cream-100 transition-transform hover:-translate-y-0.5"
                >
                  <Globe size={15} /> {t("Live site", "সরাসরি")} <ExternalLink size={12} />
                </a>
              )}
              {repo.pages && (
                <a
                  href={repo.pages}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-forest-900/25 px-5 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:bg-white"
                >
                  <Globe size={15} /> GitHub Pages <ExternalLink size={12} />
                </a>
              )}
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-forest-900/25 px-5 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:bg-white"
              >
                <GithubMark size={15} /> {t("Source", "সোর্স")}
              </a>
            </div>

            {related.length > 0 && (
              <div className="mt-16">
                <p className="u-eyebrow mb-5 text-gold-500">
                  {t("Related field notes", "সম্পর্কিত মাঠ নোট")}
                </p>
                <div className="space-y-3">
                  {related.map((n) => (
                    <Link
                      key={n.slug}
                      href={`/notes/${n.slug}`}
                      className="block rounded-2xl border border-forest-400 bg-white p-5 transition-colors hover:border-forest-300"
                    >
                      <h3 className="font-serif text-lg font-black text-forest-900">
                        {lang === "bn" && n.titleBn ? n.titleBn : n.title}
                      </h3>
                      <p className="mt-1 text-sm text-moss-500">{n.summary}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-forest-300 bg-white p-6">
              <p className="u-eyebrow mb-5 text-moss-400">
                {t("Repository detail", "রিপোজিটরি তথ্য")}
              </p>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-moss-400">
                    {t("Deployed on", "ডিপ্লয়মেন্ট")}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {repo.channels.map((c: Channel) => (
                      <Chip key={c} color={CHANNEL_COLOR[c]}>
                        {CHANNEL_LABEL[c][lang]}
                      </Chip>
                    ))}
                  </dd>
                </div>
                {repo.language && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-moss-400">
                      {t("Language", "ভাষা")}
                    </dt>
                    <dd className="mt-1 font-bold text-forest-900">{repo.language}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-moss-400">
                    {t("Last push", "সর্বশেষ আপডেট")}
                  </dt>
                  <dd className="mt-1 font-bold text-forest-900">
                    {relativeDate(repo.pushedAt)}
                  </dd>
                </div>
                {repo.topics.length > 0 && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-moss-400">
                      {t("Topics", "বিষয়")}
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {repo.topics.map((tp) => (
                        <Chip key={tp}>{tp}</Chip>
                      ))}
                    </dd>
                  </div>
                )}
                {repo.customDomain && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-moss-400">
                      {t("Custom domain", "কাস্টম ডোমেইন")}
                    </dt>
                    <dd className="mt-1 break-all font-mono text-xs text-forest-500">
                      {repo.customDomain.replace(/^https?:\/\//, "")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-moss-400">
              {t(
                "This entry is generated from the GitHub API by a scheduled workflow — it is never hand-maintained, so it cannot drift from the repository.",
                "এই তথ্য একটি নির্ধারিত ওয়ার্কফ্লো দিয়ে গিটহাব API থেকে তৈরি — হাতে লেখা হয় না, তাই রিপোজিটরি থেকে বিচ্যুত হতে পারে না।",
              )}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
