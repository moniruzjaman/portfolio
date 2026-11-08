import type { Note } from "../notes";

/**
 * TEMPLATE — NOT PUBLISHED. Awaiting owner-supplied metrics; verify-content.mjs
 * blocks registration until every TODO(owner) is gone.
 */
export const nurseryRegistryOutcomes: Omit<Note, "readingTime"> = {
  slug: "kurigram-nursery-registry-outcomes",
  title: "The Kurigram nursery registry: 138 nurseries, one list, no duplicates",
  titleBn: "কুড়িগ্রাম নার্সারি রেজিস্ট্রি: ১৩৮টি নার্সারি, একটি তালিকা",
  summary:
    "Case study template — how the district nursery registry changed licensing and supply monitoring across Kurigram's 138 registered nurseries; outcome metrics pending owner verification.",
  type: "case-study",
  year: 2026,
  org: "DAE Kurigram",
  tags: ["nursery", "registry", "case-study", "kurigram"],
  expertise: ["plantwise"],
  featured: false,
  body: `## The problem

Kurigram has 138 registered nurseries. Before the registry, the district office
held overlapping paper lists — licensing status, species stock and supply records
that could not be cross-checked without a physical visit.

## Who uses it

- Nursery owners, submitting stock and licence information.
- DAE officers, monitoring the district's seedling supply pipeline.

## What was built

The nursery registry and its reporting form (see /works/nursery-report and the
plantation-submission-system page): one validated list, one submission path,
district-level rollups.

## Result

**Metrics pending — owner to supply before publication.**

- Nurseries registered and verified: 138 (district record) — re-verify before
  publishing
- Reports collected per season: TODO(owner)
- Duplicate or conflicting registrations resolved: TODO(owner)
- Officer hours saved per season: TODO(owner)

## Limits

The registry knows what nurseries submit; it does not audit stock physically.
The 138 figure comes from the district's own list and must be re-verified at
publication time.

## Links

- Work pages: /works/nursery-report, /works/plantation-submission-system
- Repository: https://github.com/moniruzjaman/nursery-report
`,
};
