import type { Note } from "../notes";

export const soilHealth: Omit<Note, "readingTime"> = {
  slug: "soil-health-media-hub",
  title: "Building a Media Hub That Needs No API Key",
  titleBn: "কী ছাড়াই মিডিয়া হাব তৈরি",
  summary:
    "How the soil media portal delivers video, slides, PDFs and infographics to DAE extension workers with no login, no API key, and no server — and the one hard constraint that shapes it.",
  type: "note",
  year: 2026,
  org: "DAE Bangladesh",
  tags: ["media", "offline", "gdrive", "soil", "no-api-key"],
  expertise: ["field-schools"],
  featured: false,
  body: `## The constraint that decides everything

The requirement was that the site must work with **no API key anywhere**. That
rules out most approaches to listing files, because the usual answer is a Drive
API key, a service account, or a token that expires.

The workaround: don't call the listing API at all. Keep a static \`files.json\` of
Drive file IDs, names, and MIME types, committed to the repo. Viewing uses Drive's
public \`/preview\` embed; downloading uses Drive's public download link. Both work
for a folder shared as "anyone with the link — viewer".

## What that trades away

Real trade-offs, stated plainly:

- **Adding content requires a file edit.** Someone uploads to Drive, then adds an
  entry to \`files.json\`. Not a workflow a non-technical officer can do alone.
- **No folder-level browsing.** The set of items is exactly what is in the file.
- **Drive preview embeds are fragile.** They change without notice. A fallback
  link to open in a new tab is not optional.

For a curated extension resource library that is edited by one person, this is a
good trade. For a system expecting many contributors, it is not.

## What worked

A single HTML file with no build step and no dependencies. It opens from a file
path, from GitHub Pages, and from Vercel identically. For a resource meant to be
shared on a phone in a field office, "nothing to install" is the feature that
matters most.

The content that justified it: pH and moisture measurement guidance, soil texture
and structure diagrams, the Kurigram char analysis, and a set of field videos —
all in Bangla, all downloadable for offline use.

## The transferable lesson

"No API key" is a real architectural constraint, not a checkbox. It pushes you
toward committing data to the repo, which makes content review a git diff. That is
slower to add content and far better to audit — and for public-sector agricultural
material, the audit trail is worth more.`,
};
