/**
 * og-card.mjs — renders the 1200×630 Open Graph card for a route with satori +
 * resvg (build-time only; devDependencies, never shipped).
 *
 * Brand: forest green field, gold accent — same tokens as the site. Bangla
 * titles render from an embedded static-weight Noto Serif Bengali (satori
 * cannot read variable fonts); Latin text uses DM Sans.
 */
import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const C = {
  forest: "#0a2e1a",
  forestDeep: "#061a10",
  forestLine: "#164a2d",
  gold: "#c9a227",
  goldLight: "#e3ba45",
  cream: "#fdfbf7",
  paleGreen: "#a8d8b0",
  mist: "#dce8dc",
};

const FONTS = [
  {
    name: "DM Sans",
    data: readFileSync("node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2"),
    weight: 400,
    style: "normal",
  },
  {
    name: "DM Sans",
    data: readFileSync("node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2"),
    weight: 700,
    style: "normal",
  },
  {
    name: "Noto Serif Bengali",
    data: readFileSync(
      "node_modules/@fontsource/noto-serif-bengali/files/noto-serif-bengali-bengali-700-normal.woff2",
    ),
    weight: 700,
    style: "normal",
  },
];

const truncate = (s, max) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

const text = (children, style) => ({ type: "div", props: { style, children } });

/** The card layout as a satori element — exported so tests can inspect the SVG. */
export function buildCardElement({ title, bnTitle, description, site }) {
  const el = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        // content-box (the CSS default) would make 630px + padding = 758px of
        // layout, pushing the footer past the canvas edge.
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: C.forest,
        backgroundImage: `linear-gradient(135deg, ${C.forest} 55%, ${C.forestDeep} 100%)`,
        fontFamily: "DM Sans",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: "20px" },
            children: [
              text("AM", {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                backgroundColor: C.forestLine,
                color: C.goldLight,
                fontSize: "28px",
                fontWeight: 700,
              }),
              text("ABU MD. MONIRUZJAMAN", {
                color: C.goldLight,
                fontSize: "22px",
                letterSpacing: "6px",
                fontWeight: 700,
              }),
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "20px" },
            children: [
              text(truncate(title, 90), {
                color: C.cream,
                fontSize: title.length > 55 ? "54px" : "66px",
                fontWeight: 700,
                lineHeight: 1.18,
              }),
              bnTitle
                ? text(bnTitle, {
                    color: C.paleGreen,
                    fontSize: "40px",
                    fontWeight: 700,
                    lineHeight: 1.4,
                    fontFamily: "Noto Serif Bengali",
                  })
                : null,
              text(truncate(description, 150), {
                color: C.mist,
                fontSize: "26px",
                lineHeight: 1.45,
              }),
            ].filter(Boolean),
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between" },
            children: [
              {
                type: "div",
                props: { style: { width: "96px", height: "4px", backgroundColor: C.gold } },
              },
              text(`DAE BANGLADESH · ${site}`, {
                color: C.paleGreen,
                fontSize: "20px",
                letterSpacing: "1px",
              }),
            ],
          },
        },
      ],
    },
  };

  return el;
}

export async function renderOgCard(input) {
  const svg = await satori(buildCardElement(input), { width: 1200, height: 630, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
