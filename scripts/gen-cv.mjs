/**
 * gen-cv.mjs — dumps the CV data (author + figures + repos count) from the
 * site's own modules into /tmp/cv-data.json for render-cv.py. The CV must
 * never drift from the site: both read the same source of truth
 * (src/lib/author.ts, "transcribed from the CV" per its header comment).
 *
 * Usage: node scripts/gen-cv.mjs   (writes /tmp/cv-data.json)
 */
import { createServer } from "vite";
import { writeFileSync } from "node:fs";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
try {
  const { author, figures } = await vite.ssrLoadModule("/src/lib/author.ts");
  const { repos, meta } = await vite.ssrLoadModule("/src/lib/data.ts");
  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    author,
    figures,
    stats: {
      publishedTools: repos.length,
      metaGeneratedAt: meta.generatedAt ?? null,
    },
    // Publication discipline mirrors the site: phone stays private
    // (author.showPhone), everything below is already public on About.
    contact: {
      email: author.email,
      location: author.location,
      github: `github.com/${author.githubHandle}`,
      linkedin: "linkedin.com/in/abu-md-moniruzjaman",
      site: "moniruzjaman.github.io/portfolio",
    },
  };
  writeFileSync("/tmp/cv-data.json", JSON.stringify(payload, null, 2));
  console.log(
    `cv data: ${payload.stats.publishedTools} tools · ${figures.postings} postings · ${figures.yearsField} years`,
  );
} finally {
  await vite.close();
}
