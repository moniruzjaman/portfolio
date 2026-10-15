import type { Note } from "../notes";

export const greenhouse: Omit<Note, "readingTime"> = {
  slug: "greenhouse-advisory-tools",
  title: "Advisory Tools: When Data Is Available but the Answer Is Not",
  titleBn: "পরামর্শ সরঞ্জাম: তথ্য থাকলেও উত্তর না থাকা",
  summary:
    "Notes on the advisory surfaces in the published tools, and the discipline required to present a recommendation a farmer can act on rather than a number they cannot interpret.",
  type: "note",
  year: 2025,
  org: "DAE Bangladesh",
  tags: ["advisory", "weather", "market", "decision"],
  expertise: ["ai-tools", "plantwise"],
  featured: false,
  body: `## The gap

The published platforms assemble weather, market price, and crop information for
a location. What they have to produce is not data — it is a recommendation, and a
recommendation needs a decision, a confidence, and a reason.

Presenting a market price is easy. Presenting "sell now" is a judgement that can
be wrong, and the interface has to carry that uncertainty honestly.

## Three rules I hold to

**A recommendation must be reversible.** If the farmer acts on it, there must be a
point at which they can see it was wrong and change course. Advice that locks
someone into a path is a risk dressed as help.

**Show the input.** A recommendation with its basis visible — this week's price
trend, this week's rainfall, this crop's stage — can be argued with. A bare
recommendation can only be obeyed or ignored.

**Separate the model's confidence from the interface's tone.** A confident
layout communicating a genuinely uncertain prediction is the most common way
these tools mislead. The visual weight of an element should track the confidence
behind it.

## Weather is the one to be careful with

Weather-based advice inherits the forecast's error. A 7-day forecast for a
specific upazila is meaningfully uncertain beyond about three days, and a
recommendation that silently depends on day 6 is more fragile than it looks. The
horizon shown to the user should match the horizon the advice is actually
reliable at.

## Why it stays static

These advisory surfaces are deliberately built on key-free public endpoints —
Open-Meteo for weather, public market sources for prices. That means the advice
degrades in quality rather than disappearing when a quota runs out, which is the
right failure mode for something a farmer depends on.`,
};
