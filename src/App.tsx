import { useEffect, useState } from "react";
import { Route, Router, Switch } from "wouter";
import { ROUTER_BASE } from "@/lib/site";
import { LangProvider } from "@/lib/i18n";
import { Nav, Footer } from "@/components/Chrome";
import { SearchDialog } from "@/components/SearchDialog";
import { useRouteReset } from "@/components/Section";
import Home from "@/pages/Home";
import Works from "@/pages/Works";
import WorkDetail from "@/pages/WorkDetail";
import Expertise from "@/pages/Expertise";
import Notes from "@/pages/Notes";
import NoteDetail from "@/pages/NoteDetail";
import About from "@/pages/About";
import Library from "@/pages/Library";
import { NotFound } from "@/pages/NotFound";

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
  useRouteReset();

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

      <main id="main">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/works" component={Works} />
          <Route path="/works/:slug" component={WorkDetail} />
          <Route path="/library" component={Library} />
          <Route path="/expertise" component={Expertise} />
          <Route path="/notes" component={Notes} />
          <Route path="/notes/:slug" component={NoteDetail} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <Footer />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

/** `ssrPath` exists only so scripts/render-smoke.mjs can render the REAL app at a given URL. */
export default function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <LangProvider>
      <Router base={ROUTER_BASE} ssrPath={ssrPath}>
        <Shell />
      </Router>
    </LangProvider>
  );
}
