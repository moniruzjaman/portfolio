import type { Note } from "../notes";

export const ipmGame: Omit<Note, "readingTime"> = {
  slug: "ipm-game-field-method",
  title: "Teaching IPM with a Game: The দেখি-বুঝি-মাপে-ভাব-ঠিক কর Method",
  titleBn: "খেলা দিয়ে সমন্বিত বালাই ব্যবস্থাপনা শেখানো",
  summary:
    "How a single-file HTML5 game in Bangla taught the five-step IPM methodology across three rice scenarios — and why games outperform lectures in farmer field schools.",
  type: "field-guide",
  year: 2024,
  org: "DAE Bangladesh",
  tags: ["ipm", "ffs", "education", "game", "bangla"],
  expertise: ["field-schools", "ipm"],
  featured: false,
  body: `## The premise

A farmer field school session on IPM will hold attention if the content is
delivered as a decision, and lose it if delivered as a lecture. The published
game puts three rice scenarios — leaf blast, stem borer, nitrogen deficiency —
in front of the player and asks for a choice at each step.

The player is not scoring points on recall. They are scoring points on
*sequencing the diagnosis correctly*, which is the actual skill.

## Why the medium works

**Immediate feedback.** A wrong answer returns a reason, not a score. The
learner gets the correction at the moment of the error rather than at the end of
the session.

**Language fit.** A single-file HTML5 game in Bangla needs no install, no store
listing, and no device the farmer does not already own. It runs on whatever phone
is in the pocket.

**Repetition without fatigue.** The scenarios can be replayed. Repetition is
what moves a diagnostic habit from "heard once" to "used under pressure", and
lecture format cannot afford enough repetitions.

## The honest limitation

The game teaches *reasoning about a presented case*. It does not diagnose a real
field. It is a training instrument for the method, and it should be presented as
one — a farmer who finishes the game believing they can now identify a disease in
the field has been misled, even though the reasoning they practised was sound.

That boundary needs stating out loud every time the tool is used.`,
};
