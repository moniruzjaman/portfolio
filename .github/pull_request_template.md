## What and why

<!-- One or two sentences: what changes, and why it is worth a PR. -->

## Checklist

- [ ] `npm run typecheck && npm test && npm run build` all pass
- [ ] `npm run lint` and `npm run format:check` pass
- [ ] No hand edits to `src/data/*.generated.json`
- [ ] New user-facing strings exist in both English and Bangla
- [ ] Numbers shown in UI are computed from generated data (design-system §7)
- [ ] No credentials, phone number or unintended personal data in `dist/`
- [ ] `content/design-system.md` §7/§8 still hold (claims, accessibility)
