import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { socials } from "@/components/Socials";
import { author } from "@/lib/author";

const LINKS = [
  { href: "/works", en: "Work", bn: "কাজ" },
  { href: "/library", en: "Library", bn: "লাইব্রেরি" },
  { href: "/expertise", en: "Expertise", bn: "দক্ষতা" },
  { href: "/notes", en: "Writing", bn: "লেখা" },
  { href: "/about", en: "About", bn: "পরিচিতি" },
];

export function Nav({ onSearch }: { onSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t, toggle, lang } = useI18n();
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-forest-200 bg-cream-100/90 shadow-[0_8px_32px_rgba(10,46,26,0.08)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="u-container flex items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-3" aria-label={author.name}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-900 font-serif text-sm font-black text-gold-400 transition-transform group-hover:-rotate-6">
            {author.initials}
          </span>
          <span className="hidden text-sm font-black tracking-[0.18em] text-forest-900 sm:block">
            {author.short.toUpperCase()}
            <span className="text-gold-500">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`u-eyebrow transition-colors hover:text-forest-900 ${
                location.startsWith(l.href) ? "text-forest-900" : "text-moss-500"
              }`}
            >
              {t(l.en, l.bn)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onSearch}
            aria-label={t("Search", "অনুসন্ধান")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-900/15 text-forest-900 transition-colors hover:bg-forest-900 hover:text-cream-100"
          >
            <Search size={15} />
          </button>

          <button
            onClick={toggle}
            aria-label={t("Switch language", "ভাষা পরিবর্তন")}
            aria-live="polite"
            className="rounded-full bg-forest-900 px-4 py-2 font-mono text-[11px] font-bold text-cream-100 transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            {lang === "en" ? "বাংলা" : "EN"}
          </button>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={t("Menu", "মেনু")}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-900/15 text-forest-900 lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-forest-200 bg-cream-100 lg:hidden" aria-label="Mobile">
          <div className="u-container flex flex-col py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="u-eyebrow py-3 text-moss-500 transition-colors hover:text-forest-900"
              >
                {t(l.en, l.bn)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-forest-200 bg-cream-50 px-5 py-12 sm:px-8 lg:px-12">
      <div className="u-container flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-lg font-black text-forest-900">{author.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-moss-500">
            {author.role} · {author.org}
            <br />
            {author.orgBn} · {author.location}
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-moss-500 transition-colors hover:text-forest-900">
              {t(l.en, l.bn)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 text-sm">
          <a href={`mailto:${author.email}`} className="text-moss-500 transition-colors hover:text-forest-900">
            {author.email}
          </a>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {socials.map(({ key, label, href }) => (
              <a key={key} href={href} target="_blank" rel="noreferrer" className="text-moss-500 transition-colors hover:text-forest-900">
                {label}
              </a>
            ))}
          </div>
          <p className="text-xs text-moss-400">
            © {new Date().getFullYear()} {author.name} · {t("Personal portfolio", "ব্যক্তিগত পোর্টফোলিও")}
          </p>
        </div>
      </div>
    </footer>
  );
}
