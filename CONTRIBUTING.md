# Contributing

Small repo, few rules. Read `content/design-system.md` before touching UI —
it is the contract for colours, type, claims and accessibility.

## Setup and everyday commands

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # script unit tests + server-render of every route
npm run lint         # eslint (flat config)
npm run format:check # prettier
npm run build        # generate + typecheck + vite build + no-credentials gate
```

All of the above must pass before you open a PR. The deploy workflow runs
typecheck, tests, lint and build on every push to `main`.

## Ground rules

- **Never hand-edit `src/data/*.generated.json`** — they are produced by
  `scripts/sync-repos.mjs` and `scripts/sync-drive.mjs`. Change the rules in
  the scripts instead, then rerun the sync.
- **The no-credentials gate must keep passing.** `scripts/verify-no-secrets.mjs`
  fails the build on key-shaped literals and outbound hosts outside the
  allowlist. Never add a runtime API call.
- **Bilingual parity.** Every user-facing string needs English and Bangla
  (`t(en, bn)` from `src/lib/i18n.tsx`).
- **Claims discipline** (`content/design-system.md` §7): no hand-typed numbers
  that can be computed from the generated data, and every note states its own
  limits.
- **Stay static.** No server, no runtime API keys, no third-party client calls.

## Adding a knowledge note

See "Adding a knowledge note" in the README — one file under
`src/content/notes/<slug>.ts`, registered in `src/content/notes.ts`.

## Commit style

Conventional commits, one logical task per commit:

```
feat: add print stylesheet for notes
fix: keep focus ring visible on dark tiles
chore: bump vite to 6.1
docs: document the Drive folder contract
```
