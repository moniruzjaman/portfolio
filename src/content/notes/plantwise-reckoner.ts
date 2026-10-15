import type { Note } from "../notes";

export const plantwise: Omit<Note, "readingTime"> = {
  slug: "cabi-plantwise-ready-reckoner",
  title: "CABI Plantwise Ready Reckoner: A 5-Step Field Protocol",
  titleBn: "কেবি প্ল্যান্টওয়াইজ রেডি রেকনার: ৫ ধাপের মাঠ পদ্ধতি",
  summary:
    "The diagnostic protocol used across the published diagnosis tools — observe, understand, measure, think, act — and where the abiotic/biotic gate sits.",
  type: "field-guide",
  year: 2024,
  org: "CABI Plantwise",
  tags: ["diagnosis", "cabi", "protocol", "field-guide"],
  expertise: ["plantwise", "ipm"],
  featured: true,
  body: `## The five steps

**দেখি — Observe.** What is actually visible, before interpretation. Lesion shape,
distribution across the canopy, whether the pattern follows rows or spreads from a
focus. Most misdiagnosis happens at this step, when a symptom is read as a cause.

**বুঝি — Understand.** What the symptom means given the crop, the stage, and the
season. The same pale leaf is a different problem in T. Aman than in potato.

**মাপে — Measure.** Get a number. Spreading rate, affected plant percentage, soil
moisture, days since symptom onset. An unmeasured diagnosis cannot be tracked, so
it cannot be corrected either.

**ভাব — Think.** Apply the abiotic/biotic gate. Non-living causes — water, heat,
nutrient, herbicide drift — produce patterns that follow the field, not the plant.
If the pattern follows the field, stop looking for a pathogen.

**ঠিক কর — Act.** A specific, proportionate, checkable action. And a date to
look again, because a treatment that cannot be verified is an opinion.

## Why the gate matters

The abiotic/biotic gate is the single highest-leverage step and the one most often
skipped. Misclassifying an abiotic stress as a disease leads to a pesticide
application that costs money, kills beneficials, and resolves nothing — while the
actual cause continues.

## Using it without connectivity

The protocol was designed to work with a leaf, a notebook, and a decision key. The
published tools add image capture and location, but the sequence is unchanged, and
it remains usable with none of that. A protocol that needs a network stops being
used exactly where the problems are worst.`,
};
