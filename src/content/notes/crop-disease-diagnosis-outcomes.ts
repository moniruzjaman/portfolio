import type { Note } from "../notes";

/**
 * TEMPLATE — NOT PUBLISHED. Awaiting owner-supplied metrics; verify-content.mjs
 * blocks registration until every TODO(owner) is gone.
 */
export const cropDiseaseDiagnosisOutcomes: Omit<Note, "readingTime"> = {
  slug: "crop-disease-diagnosis-outcomes",
  title: "Plant disease diagnosis at the field desk: what উদ্ভিদ গোয়েন্দা changed",
  titleBn: "মাঠ ডেস্কে ফসলের রোগ নির্ণয়: উদ্ভিদ গোয়েন্দা কী বদলেছে",
  summary:
    "Case study template — how the plant disease diagnosis assistant supports CABI-protocol plant clinics in Kurigram; adoption and accuracy metrics pending owner verification.",
  type: "case-study",
  year: 2026,
  org: "DAE Kurigram",
  tags: ["diagnosis", "plantwise", "ai", "case-study"],
  expertise: ["plantwise"],
  featured: false,
  body: `## The problem

A plant clinic session depends on a diagnosis the desk officer can defend: photo
evidence, the CABI protocol's decision steps, and a recommendation that matches
what is actually licensed and available in Bangladesh.

## Who uses it

- Plant clinic desk officers running CABI-protocol sessions.
- Farmers bringing diseased samples — the assistant speeds the queue.

## What was built

The উদ্ভিদ গোয়েন্দা diagnosis assistant (see /works/cabi-diagnosis and
diagnosis-assistant): photo intake, protocol-stepped questioning, and a
recommendation sheet the officer edits before it reaches the farmer.

## Result

**Metrics pending — owner to supply before publication.**

- Clinic sessions supported: TODO(owner)
- Farmers advised: TODO(owner)
- Diagnosis accepted without officer override: TODO(owner)
- Recommendation-to-purchase match (licensed product availability): TODO(owner)
- Average session time, before vs. after: TODO(owner)

## Limits

The assistant proposes; the officer decides. Its accuracy figure must come from
clinic records where the officer's final call is logged — not from the model's
self-reported confidence. It covers the crops and pests in its reference set;
anything outside that set is referred, not guessed.

## Links

- Work pages: /works/cabi-diagnosis, /works/diagnosis-assistant
- Repository: https://github.com/moniruzjaman/cabi-diagnosis
`,
};
