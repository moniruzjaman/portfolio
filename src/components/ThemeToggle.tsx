import { Moon, Sun } from "./icons";

/**
 * Theme toggle — deliberately stateless. The active theme lives on
 * <html class="dark">, set before first paint by the inline script in
 * index.html (system preference by default, localStorage override after
 * the user chooses). Both icons always render and CSS swaps visibility,
 * so the prerendered markup is identical to the hydrated one and the
 * toggle can never cause a hydration mismatch.
 */
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        try {
          localStorage.setItem("theme", next ? "dark" : "light");
        } catch {
          /* storage unavailable (private mode) — theme just won't persist */
        }
        document
          .querySelectorAll('meta[name="theme-color"]')
          .forEach((m) => m.setAttribute("content", next ? "#061a10" : "#f7f3ec"));
      }}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="u-theme-toggle flex h-11 w-11 items-center justify-center rounded-full border border-forest-900/15 text-forest-900 transition-colors hover:bg-forest-900 hover:text-cream-100"
    >
      <Sun size={15} />
      <Moon size={15} />
    </button>
  );
}
