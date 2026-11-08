import type { Note } from "../notes";

/**
 * TEMPLATE — NOT PUBLISHED. Awaiting owner-supplied metrics; verify-content.mjs
 * blocks registration until every TODO(owner) is gone.
 */
export const krishakCardOutcomes: Omit<Note, "readingTime"> = {
  slug: "krishak-card-registration-outcomes",
  title: "Krishak Card: NID-OCR registration without the typing queue",
  titleBn: "কৃষক কার্ড: টাইপিংয়ের লাইন ছাড়া এনআইডি-ওসিআর নিবন্ধন",
  summary:
    "Case study template — what changed when farmer registration moved from retyping NID forms to OCR-assisted capture; outcome metrics pending owner verification.",
  type: "case-study",
  year: 2026,
  org: "DAE Kurigram",
  tags: ["krishak-card", "ocr", "registration", "case-study"],
  expertise: ["plantwise"],
  featured: false,
  body: `## The problem

Krishak Card registration means transcribing a farmer's NID into the government
form by hand — slow, error-prone, and a queue at every campaign desk.

## Who uses it

- Field staff registering farmers at camps and offices.
- Farmers, who keep their card; the system keeps the record.

## What was built

The Krishak Card tool with NID OCR-assisted capture (see /works/krishak-card-v2):
photograph the NID, review the extracted fields, correct, submit.

## Result

**Metrics pending — owner to supply before publication.**

- Farmers registered: TODO(owner)
- OCR field-accuracy after human review: TODO(owner)
- Registration time per farmer, before vs. after: TODO(owner)
- Correction rate (records edited after OCR): TODO(owner)

## Limits

OCR output is always human-reviewed before submission — the numbers must state
the reviewed rate, not the raw model rate. Personal data never leaves the
government workflow; the tool stores no NID copies on any public host.

## Links

- Work page: /works/krishak-card-v2
- Repository: https://github.com/moniruzjaman/krishak-card-v2
`,
};
