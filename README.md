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
npm test             # script unit tests + server-render of every route at its base path
npm run build        # generate static files + typecheck + vite build + no-credentials gate
npm run preview      # serve dist/
npm run sync         # refresh repos + Drive library (needs GITHUB_TOKEN; see .env.example)
```

`npm run build` runs every gate in sequence. A build that passes is a build that
typechecks, bundles, and contains no credentials. `npm test` is separate because it
exercises behaviour (routing under the base path, the Drive/brand pipelines) that
a build cannot see.

## Deploying

1. Push this code to `main` of `moniruzjaman/portfolio` (served at
   `https://moniruzjaman.github.io/portfolio/`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**

To serve from the root instead (a `moniruzjaman.github.io` repo or a custom domain),
set `BASE_PATH=/` (and `SITE_ORIGIN` for a custom domain) in the workflow `env`.
Router, 404 shim, sitemap and canonical URLs all follow it — nothing else to edit.

That is the entire setup for the site itself. There are no secrets to configure — `GITHUB_TOKEN` is
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

## App branding

Each card shows the app's **own** colour and icon, read at sync time from the app's
PWA manifest and `<head>` (`scripts/lib/brand-probe.mjs`). An app with no manifest,
or behind Vercel deployment protection (which answers with Vercel's login page — the
probe refuses that), gets a deterministic monogram and palette colour instead, and
its detail page says the colour was assigned. Nothing is hand-maintained: rebrand an
app and the portfolio follows at the next sync.

Cloudflare shows as "N apps, 0 addresses" until a Worker/Pages repo has its public
URL in the GitHub repository's **Homepage** field — the sync can only list an
address it has been told about.

## Google Drive library

`/library` shows Research, PDF and Presentation folders from Google Drive.

**One folder, sorted automatically.** `root.folderId` in
`content/library.config.json` is the single Drive folder. Inside it, a top-level
subfolder whose name matches `researchPattern` (default: research, paper, journal,
thesis, study, গবেষণা) becomes **Research**; every other file goes by type — PDFs to
**PDF**, slides to **Presentations**, the rest to **Other files**. Sub-folders are
walked (up to `maxDepth`) and shown as a label on each card.

**Zero credentials (works today):** share the folder as *Anyone with the link →
Viewer*. The page shows Drive's own folder view, click-to-load.

**Indexed (cards, thumbnails, search, in-page preview):** add a repository secret
(**Settings → Secrets and variables → Actions**):

| Secret | When | Notes |
| --- | --- | --- |
| `GOOGLE_API_KEY` | recommended | Google Cloud → enable *Google Drive API* → create an API key and restrict it to that API. Anonymous, so it can only ever see public files. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | alternative | whole JSON key on one line. Share the folders with its `client_email`. Files that are not public are **skipped**, never listed. |

Never paste these into a chat, issue or commit — they belong only in repository
secrets. The next scheduled run (or **Actions → Run workflow**) indexes the files.
Skipped files and the reason are written to `src/data/library-skipped.generated.json`.

A **PAT is not needed** for any of this: the repository sync uses the
auto-minted `GITHUB_TOKEN`, which can read public repositories.

## Project structure

```
├── content/
│   ├── design-system.md          # the design system — read this first
│   └── library.config.json       # which Drive folders feed /library
├── public/
│   ├── 404.html                  # GENERATED deep-link shim (gen-static.mjs)
│   └── favicon.svg
├── scripts/
│   ├── sync-repos.mjs            # the auto-inclusion pipeline (+ brand probe)
│   ├── sync-drive.mjs            # Drive library index (fail-closed)
│   ├── gen-static.mjs            # 404.html, sitemap, robots from BASE_PATH
│   ├── render-smoke.mjs          # renders real routes at sub-path + root
│   ├── verify-no-secrets.mjs     # the no-credentials gate
│   ├── lib/                      # hosts.mjs (shared allowlist), brand-probe.mjs
│   └── __tests__/                # node:test suites (brand, Drive)
├── src/
│   ├── components/
│   │   ├── AppCard.tsx           # branded app card + BrandMark
│   │   ├── PlatformTiles.tsx     # four-channel status tiles / filter
│   │   ├── DocPreview.tsx        # <dialog> Drive preview
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
│   │   ├── excluded.generated.json
│   │   └── library.generated.json   # ← generated by sync-drive.mjs
│   ├── lib/
│   │   ├── site.ts               # base path (BASE_URL / ROUTER_BASE)
│   │   ├── brand.ts              # brand derivation + fallback palette
│   │   ├── library.ts            # Drive URL builders (ids only are stored)
│   │   ├── author.ts             # identity, CV, career
│   │   ├── data.ts               # typed access to the generated data
│   │   └── i18n.tsx              # EN / বাংলা
│   └── pages/                    # Home, Works, WorkDetail, Library, Expertise,
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

> **Moving this project?** Set `BASE_PATH` (default `/portfolio/`). The Vite
> `base`, the router (`<Router base>` in `src/App.tsx`), `public/404.html`, the
> sitemap and the canonical URL all derive from it. `npm run test:render` fails if
> routing and base ever disagree.

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
