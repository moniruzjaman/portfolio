import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * GitHub Pages has no rewrite rules, so a cold load of any deep link hits
 * 404.html first (see public/404.html). That page stashes the path here and
 * redirects to the shell; we replay it into the router and clear the slot so a
 * later visit does not get yanked backwards.
 */
function consumeRedirect(): string | null {
  try {
    const stored = sessionStorage.getItem("ph:redirect");
    if (stored) {
      sessionStorage.removeItem("ph:redirect");
      return stored;
    }
  } catch {
    /* private mode — fall through to the current path */
  }
  return null;
}

const root = document.getElementById("root");
if (!root) throw new Error("#root missing — check index.html");

const redirect = consumeRedirect();
if (redirect) {
  // replaceState, not push, so Back does not return to the 404 bounce.
  window.history.replaceState(null, "", redirect);
}

if (root.hasChildNodes()) {
  // The page was prerendered by scripts/prerender.mjs — the markup is already
  // in the document, so hydrate it instead of re-rendering from scratch.
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
