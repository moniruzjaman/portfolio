import type { Note } from "../notes";

export const plantation: Omit<Note, "readingTime"> = {
  slug: "plantation-tracker-field-system",
  title: "Plantation Tracker: Designing an Offline Field System",
  titleBn: "প্ল্যান্টেশন ট্র্যাকার: অফলাইন মাঠ ব্যবস্থা",
  summary:
    "The design decisions behind a mobile-first plantation and nursery record system — why offline capture comes before validation, and why the record is editable.",
  type: "field-guide",
  year: 2025,
  org: "DAE Bangladesh",
  tags: ["offline", "pwa", "gis", "plantation", "mobile"],
  expertise: ["horticulture", "ai-tools"],
  featured: false,
  body: `## The starting constraint

A field officer in a plantation upazila may have connectivity for a few hours a
day. If the form needs the network at the moment of entry, the officer will
write it on paper later, or not at all. Any design that assumes connectivity is
designing for the office.

So: capture offline first. Everything else follows from that.

## The four decisions that mattered

**Capture before validation.** The officer records what they see, including an
imperfect location fix. Validation happens after sync, in the office, where a
failure can be discussed. Requiring a clean GPS lock at entry produces blank
forms, not clean data.

**Reverse geocoding as enrichment, not a gate.** Turning coordinates into a human
address is valuable context — but it needs a network, so it can only ever be
added later. Treating it as a required field at entry makes the whole form
network-dependent, which defeats the offline design.

**Editable records, with a reason field.** A wrong entry that can be corrected
beats a correct entry that cannot be. The reason field is what turns the edit log
from noise into a signal: if the same upazila is repeatedly overridden, the
boundary data is wrong, not the officer.

**Flags instead of deletions.** Anomalous data gets flagged for review and stays
in the record. Deleting a disputed entry destroys the evidence needed to resolve
the dispute.

## The data model

The durable part is small: a nursery profile (region, district, upazila, contact),
a species mix (name, age, seedling and grafting counts), and a location. Totals
by region and by plant category fall out of that, which is what an official
report actually needs. Excel export was a hard requirement from the start — an
officer who cannot produce a file for the upazila office will not use the system
at all.

## What the repository lineage shows

The tracker went through several public iterations, and that is worth stating
rather than hiding: the early version established offline collection and
reverse-geocoded records; later versions added upazila boundary verification and
operational reporting. Each superseded version is still public, and each documents
one problem solved. A visitor can see the progression, which is more informative
than a single polished repo would be.`,
};
