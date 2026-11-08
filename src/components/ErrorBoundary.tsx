import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "wouter";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Last line of defence between a render bug and the visitor: instead of a blank
 * page, a bilingual notice with a way home. Reset on navigation is not needed —
 * the fallback offers "reload" and the home link, which both remount the tree.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No crash-reporting service is configured (the site runs without third
    // parties); log to the console so a browser on a field desk still shows it.
    console.error("Render error caught by boundary:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="u-container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <p className="u-eyebrow text-gold-600">Something went wrong · কিছু একটা ভুল হয়েছে</p>
        <h1 className="max-w-xl font-serif text-3xl font-black text-forest-900">
          This section could not be displayed.
          <span className="mt-1 block">এই অংশটি দেখানো যায়নি।</span>
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-moss-500">
          Reload the page, or go back to the start. Nothing you did caused this — the site keeps no
          logs about it.
          <span className="mt-1 block">
            পাতাটি নতুন করে লোড করুন বা শুরুতে ফিরে যান। সাইটটি এ বিষয়ে কোনো তথ্য রাখে না।
          </span>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-11 rounded-full bg-forest-900 px-6 text-sm font-bold text-cream-100 transition-colors hover:bg-forest-600"
          >
            Reload · নতুন করে লোড
          </button>
          <Link
            href="/"
            className="min-h-11 rounded-full border border-forest-900/20 px-6 text-sm font-bold text-forest-900 transition-colors hover:bg-white"
          >
            Home · প্রথম পাতা
          </Link>
        </div>
      </div>
    );
  }
}
