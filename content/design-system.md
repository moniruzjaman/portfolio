# Design System — Knowledge Hub

The rebuild of `ideas.md`. The original was 91 lines of design *philosophy* — good
instincts, but not a system: no tokens, no component specs, no accessibility
contract, no content rules. This document describes the site as actually built.
Token values here are duplicated in `src/index.css` under `@theme`; if one changes,
change both.

---

## 1. Brand foundation

**Positioning.** A public record of agricultural extension work — field practice
and the digital systems built from it. Not a marketing page. The audience can tell
the difference, and they are the point.

**Vision statement** (from the author's own record, used verbatim on the site):

> Transforming Bangladesh's agricultural extension from paper-based to AI-powered
> — bringing science, data, and connectivity directly into the hands of smallholder
> farmers.

### Audience tiers

Ordered by who actually needs what. Design decisions resolve conflicts toward the
top of this list.

| Tier | Who | What they need | Consequence |
|---|---|---|---|
| 1 | **Extension officers** (DAE field staff) | Fast, low-bandwidth, Bangla-capable, works on a phone | Bangla parity, no JS-heavy interactions, 3G budgets |
| 2 | **Farmers** | Clear guidance they can act on | Plain language, no jargon, honest about limits |
| 3 | **Developers / partners** | Ways in — source, deployment, what it does | Public repos, live links, channel labels |
| 4 | **Institutions** | Credibility | CV, publications, cadre, affiliations |

**Design movement.** Contemporary minimalism with agricultural heritage. Clean
digital structure, grounded in earth-adjacent colour and field-document motifs.
Asymmetric rather than centred.

---

## 2. Colour tokens

Carried over unchanged from the previous build. Contrast ratios computed against
WCAG 2.1.

### Brand — forest green (authority, agriculture)

| Token | Hex | Use |
|---|---|---|
| `forest-900` | `#0a2e1a` | Primary text, dark panels, nav |
| `forest-800` | `#103c25` | Graph canvas, contact section |
| `forest-700` | `#164a2d` | Graph centre node |
| `forest-600` | `#1a5c32` | Primary hover |
| `forest-500` | `#2d8a4e` | Accent text on cream (4.6:1 ✓) |
| `forest-400` | `#4ab870` | Graph edges, live indicators |
| `forest-200` | `#a8d8b0` | Text on dark (9.1:1 ✓) |

### Accent — gold (innovation, achievement)

| Token | Hex | Use |
|---|---|---|
| `gold-600` | `#a8861d` | On cream, low emphasis (4.5:1 ✓) |
| `gold-500` | `#c09a24` | Eyebrows, mono labels (4.1:1 — decorative only) |
| `gold-400` | `#c9a227` | On dark, borders, focus ring (10.4:1 ✓) |
| `gold-300` | `#e3ba45` | Graph edge on dark |

> `gold-500` sits at 4.1:1 on cream — below AA for body text. It is used **only**
> for uppercase mono labels and numerals, never for running prose. If you need a
> gold that passes on cream, use `gold-600`.

### Neutral — cream (paper, agricultural documentation)

| Token | Hex | Use |
|---|---|---|
| `cream-50` | `#fdfbf7` | Footer, note cards |
| `cream-100` | `#f7f3ec` | Page background |
| `cream-200` | `#efe8dc` | Raised surfaces |
| `cream-300` | `#dce8dc` | Borders |
| `cream-400` | `#d6e4d7` | Card borders |

### Text

| Token | Hex | On | Ratio |
|---|---|---|---|
| `moss-600` | `#6b826e` | cream | 4.8:1 ✓ |
| `moss-500` | `#527059` | cream | 6.1:1 ✓ |
| `moss-400` | `#7a9b7c` | cream | 3.2:1 — **decorative only** |

`moss-400` is used for metadata and de-emphasised captions. It is never the sole
carrier of meaning.

---

## 3. Typography

| Role | Face | Fallback chain |
|---|---|---|
| Display | Playfair Display | Noto Serif Bengali → Georgia → serif |
| Body | DM Sans | Noto Sans Bengali → system-ui → sans-serif |
| Mono / labels | DM Mono | ui-monospace → SFMono-Regular → monospace |
| Bangla display | Noto Serif Bengali | serif |
| Bangla body | Noto Sans Bengali | sans-serif |

### Scale

| Element | Size | Weight | Tracking |
|---|---|---|---|
| H1 (hero) | `clamp(3rem, 8vw, 6.2rem)` | 900 | -0.04em |
| H1 (page) | `clamp(2.5rem, 5vw, 3.75rem)` | 900 | -0.02em |
| H2 | `clamp(2rem, 4vw, 3rem)` | 700–900 | -0.02em |
| H3 | `1.25–1.5rem` | 700–900 | — |
| Body | `1rem` / `1.05rem` | 400 | — |
| Lead | `1.125–1.25rem` | 400 | — |
| Label / eyebrow | `0.6875rem` uppercase | 700 | 0.22em |

### Bangla rules

Bangla is a **first-class** language here, not a translation afterthought.

- `html[lang="bn"]` raises body line-height to **1.85**. Bangla glyphs carry taller
  ascenders and descenders than Latin; the default clips them visually.
- Never letter-space Bangla (`letter-spacing: 0` is forced in `lang="bn"`).
- Bangla display type is set in Noto Serif Bengali, never Playfair — Playfair has
  no Bangla coverage and the browser will silently fall back mid-word.
- Every component that carries a string carries both languages. A missing Bangla
  string is a build-time review item, not a runtime blank.

---

## 4. Spacing & grid

- Base unit: **4px**. Every spacing value is a multiple.
- Container: `max-width: 80rem`, padding `1.25rem` → `2rem` (sm) → `3rem` (lg).
- Breakpoints: `640px` (sm), `1024px` (lg), `1280px` (xl).
- Grid is **asymmetric by default**: hero `1.08fr / .92fr`, about `.75fr / 1.25fr`.
  Centred symmetry is reserved for the contact section, where a centred
  invitation is the intent.

---

## 5. Components

### Nav
Fixed, transparent until `scrollY > 24`, then cream at 90% with backdrop blur and
a bottom border. Monogram + wordmark left, four links centre, search and language
toggle right. Below `md` the links collapse to a disclosure panel.

### Hero
Asymmetric split. Left: role badge, name, H1, lead paragraph, two CTAs, live
stat row. Right: the "field intelligence" graph panel.

### KnowledgeGraph
The signature element. Dark `forest-800` canvas, dotted grid, four absolutely
positioned satellite nodes connected to a centred expertise node by dashed SVG
edges. Node geometry is percentage-based, so it scales without a breakpoint.
Footer strip shows the count of live-linked repositories.

### RepoCard
Bordered white card, serif title, three-line description clamp, channel chips,
language + relative-push footer. Whole card is one link — no nested interactive
elements, which keeps the tab order clean.

### NoteCard
Cream surface, type chip + year, serif title, summary clamp, reading time.

### Timeline
Left border with dots; current role dot is filled `forest-500`, earlier roles
inherit the border colour.

---

## 6. Motion

| Interaction | Duration | Easing |
|---|---|---|
| Hover lift | 200ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Colour / opacity | 200ms | ease-out |
| Nav background | 300ms | ease |
| Section reveal | 600ms | ease-out |

**Contract:** animate only meaningful state changes. A decorative loop is noise.

**`prefers-reduced-motion`** is honoured by collapsing every transition and
animation to 0.01ms and disabling smooth scroll. Not "shortened" — removed.

---

## 7. Content rules

### Claims discipline — the most important rule here

**Any number on this site must be traceable to a source.** Two categories:

| Claim type | Rule |
|---|---|
| **Computed** (repo counts, live-deployment counts, note counts, reading time) | Derived from `repos.generated.json` / the notes array at runtime. **Never typed by hand.** |
| **Transcribed** (years of service, CGPA, posting count, dates) | Taken from the author's own record in `src/lib/author.ts`. **Must be confirmed before public launch.** |

This exists because the previous build contradicted itself: it claimed "9 years"
where the CV says 8+, "6+ digital apps" against 39 real repositories, and
"CABI 3.5" where the CV says 8+. Those numbers are not to be reprinted.

### The no-API-key constraint

Architectural, enforced by `scripts/verify-no-secrets.mjs` in CI. No credentials
exist anywhere in this project. Repository data is fetched at build time with the
Actions runner's auto-minted `GITHUB_TOKEN`; the browser reads static JSON. If a
future change needs a key, the build fails until the constraint is revisited
deliberately.

### Writing a note

1. Add `src/content/notes/<slug>.ts` exporting an `Omit<Note, "readingTime">`.
2. Register it in `src/content/notes.ts`.
3. Every note needs `title`, `titleBn`, `summary`, `type`, `year`, `org`, `tags`,
   `expertise`, and a `body`.
4. **State the limits.** Every note in this repository says what it is bad for —
   what it cannot tell you, or where the evidence runs out. A note without a
   limits section is not finished.
5. Links to `/expertise/:id` must reference an existing graph id.

### Voice

- Plain sentences. Prefer the specific noun to the abstract one.
- No superlatives about the work itself. If a project is significant, the repo
  demonstrates it.
- State trade-offs. A recommendation presented without its failure mode is a
  liability for a field officer acting on it.
- Bangla is a parallel track, not a translation. Both get equal design attention.

---

## 8. Accessibility contract

Target: **WCAG 2.1 AA**.

| Area | Rule |
|---|---|
| Focus | `:focus-visible` → 3px `gold-400` outline, 2px offset. Programmatic heading focus (route change) is `outline-none` — it is a screen-reader handoff, not a keyboard stop |
| Skip link | First focusable element, visible on focus, targets `#main` |
| Headings | One `h1` per page, no level skipped. Route change moves focus to it |
| Route change | Scrolls to top **and** focuses the `h1` so screen-reader users are not left at the top of an unchanged-sounding page |
| Keyboard | Graph selector is a `tablist` with arrow-key navigation. Search is ⌘K / Ctrl+K with ↑ ↓ ↵ Esc |
| Touch targets | Minimum 44×44px for all interactive elements |
| Language | `<html lang>` updates on toggle so screen readers switch voice |
| Motion | `prefers-reduced-motion` collapses all animation |
| Contrast | Body text ≥ 4.5:1. `gold-500` and `moss-400` are decorative-only tokens |
| Colour | Never the sole carrier of meaning — channel labels are always text |

---

## 9. Anti-patterns

Things that must not appear, and why.

| ✗ | Why |
|---|---|
| `monir@example.com` or any placeholder contact | Shipped in the previous build. Use `src/lib/author.ts` |
| A hand-typed repository list | Defeats auto-inclusion; drifts within a week |
| A silently-truncated sync | A 403 misread as "empty repo" once dropped 11 real projects. The sync script now aborts instead |
| Treating any `CNAME` as "our domain" | `plantation-tracker-app` has a CNAME pointing at surge.sh |
| Pagefind on this build | It indexes built HTML; a Vite SPA's `index.html` is an empty `<div id="root">`. It would index nothing |
| Focus rings on programmatic heading focus | Visible gold box on first paint of every page |
| Rendering each source line as its own paragraph | Markdown is soft-wrapped; this shatters sentences with paragraph gaps |
| Inventing a "Blockchain Supply Chains" deliverable | It is a proposal, not shipped work. Relabelled **Policy & Traceability** |
| Adding an API key because a feature would be easier | The build fails. That is the point of the gate |

---

## 10. Change log

**v1.0 (this build)** — rebuilt from `ideas.md`.

- Tokens promoted from prose into `@theme`, with contrast ratios recorded
- Component specs added
- Accessibility contract added
- Claims discipline added (§7) — the gap that let contradictory numbers ship
- Anti-patterns added (§9), including two real bugs this build fixed
- Bangla rules made specific: line-height, letter-spacing, font selection
- `gold-500` and `moss-400` downgraded to decorative-only after measuring them
