# moniruzjaman.github.io

Personal portfolio and showcase site for **Abu Md. Moniruzzaman** —
Additional Deputy Director (Horticulture), Department of Agricultural Extension,
Kurigram, Bangladesh.

Static site on **GitHub Pages**. Runs with **no API keys of any kind**.
Repository listings are generated, never hand-maintained.

---

## What makes this different

**The work list is generated, not written.** A scheduled workflow reads the GitHub
dashboard and includes any repository matching one of four deployment channels.
Push a new repo with a `.vercel.app` homepage and it is on the site within a day,
with no edit to any file.

**No API keys.** Not "we don't use many" — none. `scripts/verify-no-secrets.mjs`
runs in CI and fails the build on a key-shaped literal, a key-shaped env
reference, or any outbound host outside the allowlist. It is a mechanical gate, not
a promise.

**Numbers cannot drift.** Repo counts, live-deployment counts, and note counts are
computed at runtime from the generated data. Nothing is typed by hand.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm run build        # typecheck + vite build + no-api-key gate
npm run preview      # serve dist/
```

`npm run build` runs all three gates in sequence. A build that passes is a build
that typechecks, bundles, and contains no credentials.

## Deploying

1. Create the repository `moniruzjaman.github.io` (public).
2. Push this code to `main`.
3. **Settings → Pages → Build and deployment → Source: GitHub Actions.**

That is the entire setup. There are no secrets to configure — `GITHUB_TOKEN` is
minted automatically by the Actions runner, and the deploy workflow uses it via
the official `actions/deploy-pages`.

## How auto-inclusion works

```
daily 03:17 UTC  ──▶  .github/workflows/sync-repos.yml
                        │
                        ├─ fetch all public repos (GITHUB_TOKEN, 5000/hr)
                        ├─ read each repo tree + README
                        ├─ apply the inclusion contract
                        ├─ probe live URLs
                        ├─ write src/data/repos.generated.json
                        ├─ commit if changed ──▶ triggers deploy.yml
                        └─ abort on any read error
```

A repository is included if it matches **any** channel:

| Channel | Test |
|---|---|
| `custom-domain` | homepage or `CNAME` contents reference `*.krishiai.live` |
| `vercel` | homepage ends in `.vercel.app` |
| `cloudflare` | tree contains `wrangler.{jsonc,toml}`, `worker.js`, or `functions/api/` |
| `github-pages` | `has_pages`, or a `.nojekyll` / `CNAME` / pages workflow exists |

Then excluded regardless, with the reason recorded in
`src/data/excluded.generated.json`: forks, empty repositories, and anything in the
`HARD_EXCLUDE` map inside `scripts/sync-repos.mjs`.

**To change the rules, edit `sync-repos.mjs` and push.** Nothing else.

Force a sync without waiting for the cron: **Actions → Sync repositories → Run
workflow**.

### Why not fetch from the browser

Unauthenticated `api.github.com` allows 60 requests/hour per IP. A DAE office or
a campus shares one NAT address, so the first visitor exhausts the quota and
everyone behind them sees a broken page. CI has 5,000/hour. The browser reads a
static file.

---

## Project structure

```
├── content/
│   └── design-system.md          # the design system — read this first
├── public/
│   ├── 404.html                  # deep-link shim (see below)
│   └── favicon.svg
├── scripts/
│   ├── sync-repos.mjs            # the auto-inclusion pipeline
│   └── verify-no-secrets.mjs     # the no-API-key gate
├── src/
│   ├── components/
│   │   ├── KnowledgeGraph.tsx    # signature graph component + 6 expertise areas
│   │   ├── Chrome.tsx            # nav + footer
│   │   ├── SearchDialog.tsx      # ⌘K / Ctrl+K search
│   │   ├── Section.tsx           # page chrome helpers
│   │   └── icons.tsx             # GitHub mark (lucide dropped brand icons)
│   ├── content/
│   │   ├── notes.ts              # note registry
│   │   └── notes/*.ts            # one file per note
│   ├── data/
│   │   ├── repos.generated.json  # ← generated, do not hand-edit
│   │   └── excluded.generated.json
│   ├── lib/
│   │   ├── author.ts             # identity, CV, career
│   │   ├── data.ts               # typed access to the generated data
│   │   └── i18n.tsx              # EN / বাংলা
│   └── pages/                    # Home, Works, WorkDetail, Expertise,
│                                 # Notes, NoteDetail, About, NotFound
└── .github/workflows/
    ├── deploy.yml                # build + deploy to Pages
    └── sync-repos.yml            # daily auto-inclusion
```

---

## Adding a knowledge note

Create `src/content/notes/<slug>.ts`:

```ts
import type { Note } from "../notes";

export const myNote: Omit<Note, "readingTime"> = {
  slug: "my-note",
  title: "A clear English title",
  titleBn: "একটি স্পষ্ট বাংলা শিরোনাম",
  summary: "One or two sentences for the index and search.",
  type: "field-guide",           // policy-brief | field-guide | proposal | article | note
  year: 2026,
  org: "DAE Bangladesh",
  tags: ["soil", "method"],
  expertise: ["plantwise"],      // must match a graph id
  featured: false,
  body: `## Heading

Markdown: paragraphs, **bold**, *italic*, \`code\`, lists, and fenced blocks.`,
};
```

Register it in `src/content/notes.ts`.

**Every note must state its own limits** — what it cannot tell you, or where the
evidence runs out. That rule is in `content/design-system.md` §7 and it is the
reason these notes are worth reading.

---

## Deep links on GitHub Pages

GitHub Pages has no server rewrite rules, so a cold load of `/works/anything`
would 404 before the SPA boots. Three pieces make it work:

1. `public/404.html` stashes the intended path in `sessionStorage` and redirects to `index.html`
2. `src/main.tsx` replays it via `history.replaceState` **before** React mounts
3. wouter reads the corrected URL on first render

> **Moving this project to a differently-named repository?** Change `base` in
> `vite.config.ts` **and** `BASE` in `public/404.html` **and** the comment in
> `src/App.tsx`. They must agree or every deep link breaks.

---

## Accessibility

Target WCAG 2.1 AA. Skip link, one `h1` per page, focus moved to the `h1` on
route change, arrow-key navigation on the graph selector, ⌘K search, visible
focus rings, `prefers-reduced-motion` honoured, and `<html lang>` switching with
the language toggle.

Full contract in `content/design-system.md` §8.

---

## Licence

MIT
