/**
 * readme-description.mjs — derive a one-line card description from a README when
 * the GitHub description field is empty (brief 3.1: 20 of 52 cards used to say
 * almost nothing).
 *
 * Conservative by design: it takes the first readable prose paragraph, strips
 * markdown, and refuses anything that looks like a heading, badge row, code,
 * table or a bare link — a wrong-but-confident sentence is worse than none.
 */

const NOISE_PREFIXES = ["#", "!", "<", "|", "```", "-", "*", "+", ">", "[", "http", "\t"];

export function descriptionFromReadme(readme) {
  if (!readme) return null;
  for (const rawLine of readme.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (NOISE_PREFIXES.some((p) => line.toLowerCase().startsWith(p))) continue;
    if (line.length < 24) continue; // titles-by-accident, "Getting started", etc.

    // Links keep their label; emphasis markers and inline code lose their dress.
    const text = line
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // A single leftover link label or emoji soup is not a description.
    if (text.length < 24) continue;
    if (!/[a-z\u0980-\u09ff]{3}/i.test(text)) continue; // must contain words
    if (/^(getting started|installation|usage|demo|live|license|contributing|about)$/i.test(text)) {
      continue;
    }

    return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
  }
  return null;
}
