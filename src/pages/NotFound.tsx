import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function NotFound() {
  const { t } = useI18n();
  return (
    <section className="flex min-h-[70vh] items-center px-5 pt-32 sm:px-8 lg:px-12">
      <div className="u-container text-center">
        <p className="font-serif text-7xl font-black text-forest-200">404</p>
        <h1 className="mt-4 font-serif text-3xl font-black text-forest-900">
          {t("This page does not exist.", "এই পাতাটি নেই।")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-moss-500">
          {t(
            "It may have moved, or the link may be from an older version of the site.",
            "এটি সরানো হয়ে গেছে, অথবা লিংকটি পুরনো সাইটের।",
          )}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-sm font-bold text-cream-100 transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft size={15} /> {t("Back to home", "হোমে ফিরুন")}
        </Link>
      </div>
    </section>
  );
}
