export type NoteType = "policy-brief" | "field-guide" | "proposal" | "article" | "note";

export type Note = {
  slug: string;
  title: string;
  titleBn: string;
  summary: string;
  type: NoteType;
  year: number;
  org: string;
  tags: string[];
  expertise: string[];
  featured: boolean;
  readingTime: number;
  body: string;
};

import { krishakCard } from "./notes/krishak-card-roadmap";
import { greenloop } from "./notes/greenloop-3";
import { nutrient } from "./notes/nutrient-management";
import { plantwise } from "./notes/plantwise-reckoner";
import { ipmGame } from "./notes/ipm-game-method";
import { soilHealth } from "./notes/soil-health-media";
import { plantation } from "./notes/plantation-tracker-system";
import { greenhouse } from "./notes/greenhouse-advisory";

/**
 * Notes are promoted from the author's own published record — the CV in
 * info/index_1.html and the READMEs of the published repos. Nothing here is
 * invented filler. `readingTime` is derived at build time from body length.
 */
const RAW: Omit<Note, "readingTime">[] = [
  krishakCard,
  greenloop,
  nutrient,
  plantwise,
  ipmGame,
  soilHealth,
  plantation,
  greenhouse,
];

export const notes: Note[] = RAW.map((n) => ({
  ...n,
  readingTime: Math.max(1, Math.round(n.body.split(/\s+/).length / 200)),
}));

export const noteBySlug = (slug: string) => notes.find((n) => n.slug === slug);

export const NOTE_TYPE_LABEL: Record<NoteType, { en: string; bn: string }> = {
  "policy-brief": { en: "Policy brief", bn: "নীতিপত্র" },
  "field-guide": { en: "Field guide", bn: "মাঠ নির্দেশিকা" },
  proposal: { en: "Proposal", bn: "প্রস্তাব" },
  article: { en: "Article", bn: "নিবন্ধ" },
  note: { en: "Note", bn: "নোট" },
};
