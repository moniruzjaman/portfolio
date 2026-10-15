import { useEffect, useState } from "react";
import { Route, Switch } from "wouter";
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
import { NotFound } from "@/pages/NotFound";

/**
 * Deep-link recovery: GitHub Pages has no rewrite rules, so a cold load of
 * /works/foo hits 404.html, which stashes the path in sessionStorage and
 * redirects here. main.tsx replays that path via history.replaceState BEFORE
 * this tree mounts, so wouter's location hook reads the right URL on first
 * render and no flash of the home page occurs. Nothing extra is needed here.
 *
 * The repo is `moniruzjaman/portfolio`, a project site, so the deploy root is
 * `/portfolio/` and wouter's default location hook works because GitHub Pages
 * serves the app under that base. If the repo name changes, this comment,
 * vite.config.ts `base`, and public/404.html must change together.
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

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  );
}
