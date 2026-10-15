import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { noteBySlug, notes, NOTE_TYPE_LABEL } from "@/content/notes";
import { graphById } from "@/components/KnowledgeGraph";
import { Chip } from "@/components/Section";
import { useI18n } from "@/lib/i18n";
import { NotFound } from "./NotFound";

/**
 * Minimal, safe markdown renderer.
 *
 * Deliberately not a full markdown library: this content is authored in-repo by
 * one person, so a ~60-line renderer covering the subset actually used (headings,
 * paragraphs, lists, bold, italics, inline code, fenced code, blockquote, hr)
 * is a better trade than a parser dependency plus a sanitiser. Anything not
 * matched here renders as plain text — no raw HTML is ever injected.
 */
function renderInline(text: string, keyPrefix: string) {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key} className="font-bold text-forest-900">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={key} className="rounded bg-forest-200/60 px-1.5 py-0.5 font-mono text-[0.85em] text-forest-700">{tok.slice(1, -1)}</code>);
    else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderMarkdown(body: string) {
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="my-5 list-disc space-y-2 pl-6 text-moss-600">
        {list.map((li, i) => (
          <li key={i}>{renderInline(li, `li-${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  /**
   * Markdown paragraphs are soft-wrapped: one sentence spans several source
   * lines. Rendering each line as its own <p> shatters sentences into fragments
   * with paragraph gaps between them, so consecutive plain lines are buffered
   * and joined before being emitted.
   */
  const flushPara = () => {
    if (!para.length) return;
    blocks.push(
      <p key={key++} className="my-4 text-[1.05rem] leading-[1.8] text-moss-600">
        {renderInline(para.join(" "), `p-${key}`)}
      </p>,
    );
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushPara();
      flushList();
      const lang = trimmed.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) buf.push(lines[i++]);
      blocks.push(
        <pre key={`pre-${key++}`} className="my-6 overflow-x-auto rounded-xl border border-forest-300 bg-forest-900 p-5 text-sm text-forest-100">
          {lang && <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-forest-300">{lang}</span>}
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (!trimmed) {
      flushPara();
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={key++} className="mt-12 font-serif text-2xl font-black text-forest-900">{renderInline(trimmed.slice(3), `h-${key}`)}</h2>);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushPara();
      flushList();
      blocks.push(<h3 key={key++} className="mt-8 font-serif text-xl font-bold text-forest-700">{renderInline(trimmed.slice(4), `h-${key}`)}</h3>);
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      list.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      list.push(trimmed.replace(/^\d+\.\s+/, ""));
      continue;
    }
    if (trimmed.startsWith("> ")) {
      flushPara();
      flushList();
      blocks.push(<blockquote key={key++} className="my-6 border-l-2 border-gold-400 pl-5 font-serif text-lg italic text-forest-600">{renderInline(trimmed.slice(2), `q-${key}`)}</blockquote>);
      continue;
    }
    if (trimmed === "---") {
      flushPara();
      flushList();
      blocks.push(<hr key={key++} className="my-10 border-forest-300" />);
      continue;
    }

    para.push(trimmed);
  }
  flushPara();
  flushList();
  return blocks;
}

export default function NoteDetail() {
  const [, params] = useRoute("/notes/:slug");
  const { t, lang } = useI18n();
  const note = params ? noteBySlug(params.slug) : undefined;

  if (!note) return <NotFound />;

  const related = notes.filter((n) => n.slug !== note.slug && n.tags.some((t) => note.tags.includes(t))).slice(0, 3);

  return (
    <>
      <article>
        <header className="border-b border-forest-300 px-5 pb-12 pt-36 sm:px-8 lg:px-12">
          <div className="u-container max-w-3xl">
            <Link
              href="/notes"
              className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-moss-500 transition-colors hover:text-forest-900"
            >
              <ArrowLeft size={13} /> {t("All notes", "সব নোট")}
            </Link>

            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Chip>{NOTE_TYPE_LABEL[note.type][lang]}</Chip>
              <span className="font-mono text-xs text-moss-400">{note.year}</span>
              <span className="font-mono text-xs text-moss-400">· {note.readingTime} min</span>
            </div>

            <h1 className="font-serif text-4xl font-black leading-[1.08] tracking-[-0.02em] text-forest-900 outline-none sm:text-5xl">
              {lang === "bn" && note.titleBn ? note.titleBn : note.title}
            </h1>

            {lang === "en" && note.titleBn && (
              <p className="mt-3 font-serif text-xl text-moss-400">{note.titleBn}</p>
            )}

            <p className="mt-6 border-l-2 border-gold-400 pl-5 text-lg leading-relaxed text-moss-500">
              {note.summary}
            </p>

            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-moss-400">
              {note.org}
            </p>
          </div>
        </header>

        <div className="px-5 py-14 sm:px-8 lg:px-12">
          <div className="u-container max-w-3xl">
            <div className="prose-none">{renderMarkdown(note.body)}</div>

            {/* expertise links */}
            <div className="mt-14 flex flex-wrap gap-2 border-t border-forest-300 pt-8">
              {note.expertise.map((eid) => {
                const g = graphById(eid);
                if (!g) return null;
                return (
                  <Link
                    key={eid}
                    href="/expertise"
                    className="inline-flex items-center gap-2 rounded-full border border-forest-300 bg-white px-4 py-2 text-xs font-bold text-forest-700 transition-colors hover:border-forest-500"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />
                    {g.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-forest-300 bg-cream-50 px-5 py-16 sm:px-8 lg:px-12">
          <div className="u-container max-w-3xl">
            <p className="u-eyebrow mb-6 text-gold-500">{t("Related", "সম্পর্কিত")}</p>
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
        </section>
      )}
    </>
  );
}
