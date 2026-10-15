import type { Note } from "../notes";

export const krishakCard: Omit<Note, "readingTime"> = {
  slug: "digital-transformation-krishak-card-roadmap",
  title: "Digital Agricultural Transformation & the Krishak Card Roadmap",
  titleBn: "ডিজিটাল কৃষি রূপান্তর ও কৃষক কার্ড রোডম্যাপ",
  summary:
    "A policy brief on moving DAE extension services from paper registers to a verified digital layer, and what the Krishak Card has to get right for it to work at field level.",
  type: "policy-brief",
  year: 2025,
  org: "DAE Planning, Project Implementation & ICT Wing",
  tags: ["extension", "digital", "krishak-card", "ict", "dae"],
  expertise: ["ai-tools", "field-schools"],
  featured: true,
  body: `## The problem

Agricultural extension in Bangladesh still runs substantially on paper. A farmer's
record exists three times — in a field register, in a block office file, and in the
officer's memory — and none of them reconcile. That is not a digitisation problem in
the abstract; it is the reason a recommendation given in March cannot be followed up
in June, and why a farmer who moves between upazilas restarts rather than continues.

## Where the Krishak Card fits

The Krishak Card is the natural identity anchor. Once a farmer has a stable,
government-issued identifier that is not tied to a single programme, the same
identifier can carry the plot, the crop, the recommendation history, and the
subsidy record. That is the whole argument for it: not a smart card, but a
**join key**.

## What has to be right

**One identifier, many programmes.** The failure mode to avoid is a card that is
issued per-scheme, which reproduces the fragmentation it was meant to end.

**Offline-first, not offline-tolerant.** Field connectivity in Rangpur and CHT
upazilas is intermittent at best. Any form that requires a live connection at the
moment of data entry will be abandoned within a month, and abandoned forms produce
silently wrong aggregates — which is worse than no data.

**Verification at the edge, not the centre.** Photograph and location capture
should be validated on the device, where the officer can fix a problem immediately.
Central validation happens weeks later, when nobody remembers the visit.

**An audit trail that the farmer can read.** If a record is used to deny a
subsidy, the farmer must be able to see it and contest it. This is a design
requirement, not a nice-to-have.

## Sequencing

Start with the read-only layer — digitise what already exists, make it searchable,
and measure how much time that returns to field officers. Only then add write paths.
Attempting both at once produces a system that is neither trusted nor used.

## The honest risk

The technology here is the easy part. The hard part is that DAE field staff are
evaluated on paper targets, and a working digital system quietly removes the paper
that those targets are measured against. Adoption is a management problem before it
is an engineering one, and any roadmap that skips it will under-deliver.`,
};
