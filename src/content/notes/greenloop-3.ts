import type { Note } from "../notes";

export const greenloop: Omit<Note, "readingTime"> = {
  slug: "greenloop-3-circular-agriculture",
  title: "GreenLoop 3.0: Blockchain-Enabled Circular Agriculture",
  titleBn: "গ্রিনলুপ ৩.০: ব্লকচেইন-ভিত্তিক চক্রাকার কৃষি",
  summary:
    "An innovation proposal submitted to the CIRDAP-REEDS Asia-Pacific challenge — treating crop residue and organic waste as a traced input stream rather than a disposal problem.",
  type: "proposal",
  year: 2026,
  org: "CIRDAP-REEDS International Rural Development Innovation Challenge",
  tags: ["circular-economy", "blockchain", "residue", "asia-pacific"],
  expertise: ["policy", "horticulture"],
  featured: true,
  body: `## The framing

Bangladesh burns a significant share of its paddy residue every year. The smoke is
visible; the cost is not. The same material that fills the air is roughly a
third of the fertiliser budget when it returns to the soil instead of the sky.

Circular agriculture is usually pitched as an incentive problem. The proposal here
treats it as a **traceability** problem first: you cannot pay for a nutrient
contribution you cannot measure, and you cannot measure what you cannot attribute.

## Three components

**Collection as a first-class record.** Who brought what, from which plot, on which
date, verified how. Collection points become data points, and the gap between
estimated and measured availability stops being guesswork.

**Nutrient credit, not subsidy.** A residue buyer receives a credit against input
cost, so the incentive is the input they were going to buy anyway. This avoids
inventing a new fiscal instrument.

**Chain of custody with a real terminus.** A ledger that ends in a spreadsheet
recreates the problem it was meant to solve. The design requires the final
application — tonnes to plot, date, verified outcome — to be part of the same record.

## What we deliberately did not include

No token. No speculation layer. A public subsidy-adjacent ledger that can be traded
invites gaming of the exact numbers it is meant to protect, and it would draw
regulatory attention that a public agricultural record does not need.

## The pilot shape

Kurigram, one block, two crop cycles. Enough to test whether collection officers
actually use the record, which is the only question that determines whether any of
the rest works.`,
};
