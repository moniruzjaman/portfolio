import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Router, Switch, useLocation } from "wouter";
import { ROUTER_BASE } from "@/lib/site";
import { useDocumentMeta } from "@/lib/seo";
import { LangProvider } from "@/lib/i18n";
import { Nav, Footer } from "@/components/Chrome";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRouteReset } from "@/components/Section";
import Home from "@/pages/Home";
import Works from "@/pages/Works";
import WorkDetail from "@/pages/WorkDetail";
import Topics from "@/pages/Topics";
import Expertise from "@/pages/Expertise";
import Notes from "@/pages/Notes";
import NoteDetail from "@/pages/NoteDetail";
import About from "@/pages/About";
import Library from "@/pages/Library";
import { NotFound } from "@/pages/NotFound";

// The search dialog is an overlay that renders nothing until ⌘K — split it out
// of the first load. The boundary mounts only while the dialog is open: a
// suspended lazy component inside renderToString would abort server rendering
// and litter the prerendered HTML with hydration-breaking markers.
const SearchDialog = lazy(() =>
  import("@/components/SearchDialog").then((m) => ({ default: m.SearchDialog })),
);

/**
 * Deep links on GitHub Pages: there are no rewrite rules, so a cold load of
 * /works/foo hits 404.html, which stashes the path and redirects to the shell;
 * main.tsx replays it before React mounts.
 *
 * Base path: wouter only strips a prefix it is told about. <Router base> below is
 * REQUIRED when the site is served from a sub-path such as /portfolio/ — without
 * it every route, including "/", renders Not Found. The base comes from Vite's
 * `base` via src/lib/site.ts, so there is nothing to keep in sync by hand
 * (public/404.html is generated from the same value by scripts/gen-static.mjs).
 */
function Shell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();
  useRouteReset();
  useDocumentMeta(location);

  // ⌘K / Ctrl+K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 text-forest-900">
      <a href="#main" className="u-skip-link">
        Skip to content
      </a>

      <Nav onSearch={() => setSearchOpen(true)} />

      <ErrorBoundary>
        <main id="main">
          <Switch>
            {/* One route table, mirrored: Bangla lives under the /bn prefix
                and renders the SAME components — language comes from the URL
                (lib/i18n), so the components need no per-language variants. */}
            {(
              [
                ["/", Home],
                ["/works", Works],
                ["/works/:slug", WorkDetail],
                ["/topics", Topics],
                ["/library", Library],
                ["/expertise", Expertise],
                ["/notes", Notes],
                ["/notes/:slug", NoteDetail],
                ["/about", About],
              ] as const
            ).flatMap(([p, C]) => [
              <Route key={p} path={p} component={C} />,
              <Route key={`bn${p}`} path={`/bn${p === "/" ? "" : p}`} component={C} />,
            ])}
            <Route component={NotFound} />
          </Switch>
        </main>
      </ErrorBoundary>

      <Footer />
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}

/** `ssrPath` exists only so scripts/render-smoke.mjs can render the REAL app at a given URL. */
export default function App({ ssrPath }: { ssrPath?: string }) {
  return (
    // LangProvider INSIDE Router: language now derives from the URL (/bn/…),
    // so it needs wouter's location context.
    <Router base={ROUTER_BASE} ssrPath={ssrPath}>
      <LangProvider>
        <Shell />
      </LangProvider>
    </Router>
  );
}
