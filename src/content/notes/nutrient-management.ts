import type { Note } from "../notes";

export const nutrient: Omit<Note, "readingTime"> = {
  slug: "smart-integrated-nutrient-management-t-aman",
  title: "Smart Integrated Nutrient Management for T. Aman",
  titleBn: "টি আম গ্রুপে স্মার্ট সমন্বিত পুষ্টি ব্যবস্থাপনা",
  summary:
    "SPAD-meter-guided dosing and foliar nutrition for transplanted Aman paddy — a technical article on raising yield while cutting input cost.",
  type: "article",
  year: 2025,
  org: "DAE Bangladesh",
  tags: ["aman", "spad", "nutrition", "yield", "cost"],
  expertise: ["horticulture", "ipm"],
  featured: true,
  body: `## The argument

Blanket urea recommendations treat a field as average. A field is not average. T.
Aman on a high plot and T. Aman on a low plot will not respond to nitrogen the
same way, and a uniform dose is simultaneously over-feeding the good field and
under-feeding the poor one.

SPAD-based dosing closes that gap cheaply. A leaf-clip reading costs almost
nothing and turns nitrogen from a fixed quantity into a measured response.

## The method

Read SPAD at the recommended stage, map the reading onto a urea dose, and split
the application rather than applying it whole. Split application is the part
field officers consistently skip, and it is the part that determines whether the
measurement was worth taking — a reading that changes the total but not the
timing has captured little.

Add foliar nutrition where a deficiency shows early rather than waiting for the
damage to be visible in the canopy.

## The economics

The case is not primarily yield. It is cost. Reducing a urea application on a
field that does not need it is money the farmer keeps, and at current input prices
that saving is comparable to or larger than the yield gain. Both numbers need to
be presented together, because presenting only the yield number invites the
disbelief that usually follows.

## Honest limits

SPAD is a relative instrument — it compares readings against a reference crop, so
it is meaningful within a field and across a season, and much less meaningful
compared to a lab soil test. Claims should be framed accordingly.`,
};
