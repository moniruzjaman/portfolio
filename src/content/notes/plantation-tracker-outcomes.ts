import type { Note } from "../notes";

/**
 * TEMPLATE — NOT PUBLISHED. This case study stays out of the registry until the
 * owner supplies the real outcome metrics. scripts/verify-content.mjs fails the
 * build if a file containing TODO(owner) is ever registered in notes.ts.
 */
export const plantationOutcomes: Omit<Note, "readingTime"> = {
  slug: "plantation-tracker-outcomes",
  title: "Plantation Tracker: running the tree census for a 250-million-tree initiative",
  titleBn: "প্লান্টেশন ট্র্যাকার: ২৫ কোটি গাছ রোপণ কর্মসূচির ফসল হিসাব",
  summary:
    "Case study template — what the plantation tracking system changed for the Kurigram plantation campaign, with outcome metrics pending owner verification.",
  type: "case-study",
  year: 2026,
  org: "DAE Kurigram",
  tags: ["plantation", "monitoring", "case-study", "kurigram"],
  expertise: ["plantwise"],
  featured: false,
  body: `## The problem

The national plantation drive asks every union to plant and account for trees —
at the district scale that is lakhs of saplings tracked on paper forms that reach
the district office weeks late, unverified and unsummable.

## Who uses it

- Nursery and field staff of DAE Kurigram, entering plantation data from the field.
- Upazila and district officers, watching progress instead of chasing paper.

## What was built

The Plantation Tracker — a submission system with photo-verified entries, union/
upazila rollups, and an officer dashboard (see the /works/plantation-tracker-app
and plantation-submission-system pages for the technical description).

## Result

**Metrics pending — the owner must supply verified figures before this page is
published.** Suggested measures, each with its collection source:

- Trees recorded: TODO(owner)
- Unions/upazilas covered: TODO(owner)
- Field staff using the system: TODO(owner)
- Reporting lag before vs. after: TODO(owner)
- Share of entries with photo verification: TODO(owner)

## Limits

This page will state only what the owner can evidence from the district's own
records. It cannot claim national coverage — the tracker is a Kurigram tool —
and tree counts are self-reported submissions, not an independent audit.

## Links

- Work page: /works/plantation-tracker-app
- Repository: https://github.com/moniruzjaman/plantation-tracker-app
`,
};
