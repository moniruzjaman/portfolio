/**
 * hydration-diff.mjs — find the exact DOM node where server and client trees
 * diverge: parse the served root-div HTML with DOMParser, then compare it node
 * by node against the live DOM after hydration.
 */
import { createRequire } from "node:module";

const base = (process.argv[2] || "http://localhost:4173/portfolio").replace(/\/$/, "");
const route = process.argv[3] || "/about";
const require = createRequire(import.meta.url);
const puppeteer = (await import("puppeteer-core")).default;
const chromium = (await import("@sparticuz/chromium")).default;

const browser = await puppeteer.launch({
  args: [...chromium.args, "--no-sandbox"],
  executablePath: await chromium.executablePath(),
  headless: "shell",
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto(`${base}${route}/`, { waitUntil: "load", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));

const result = await page.evaluate(async (r) => {
  const res = await fetch(`${r}`);
  const html = await res.text();
  const start = html.indexOf('<div id="root">');
  const end = html.lastIndexOf("</div>");
  const served = html.slice(start + 15, end);

  const doc = new DOMParser().parseFromString(`<div id="srv">${served}</div>`, "text/html");
  const serverTree = doc.getElementById("srv");
  const liveTree = document.getElementById("root");

  const describe = (el) =>
    el.nodeType === 8
      ? "comment"
      : el.nodeType === 3
        ? `text(${JSON.stringify(el.textContent.slice(0, 60))})`
        : `<${el.localName}${[...el.attributes].map((a) => ` ${a.name}="${a.value.slice(0, 40)}"`).join("")}>`;

  function walk(a, b, path) {
    if (!a && !b) return null;
    if (!a || !b)
      return `${path}: missing on ${!a ? "server" : "client"} — ${a ? describe(a) : ""}${b ? describe(b) : ""}`;
    if (a.nodeType === 8 || b.nodeType === 8) {
      return a.nodeType === b.nodeType
        ? null // React suspense/lazy comment markers — skip
        : `${path}: comment placement differs — ${describe(a)} vs ${describe(b)}`;
    }
    if (a.nodeType !== b.nodeType || a.localName !== b.localName) {
      return `${path}: <${a.localName}> (server) vs <${b.localName}> (client)`;
    }
    if (a.nodeType === 3) {
      const sa = a.textContent.replace(/\s+/g, " ").trim();
      const sb = b.textContent.replace(/\s+/g, " ").trim();
      if (sa !== sb) return `${path}: text "${sa.slice(0, 60)}" vs "${sb.slice(0, 60)}"`;
      return null;
    }
    const aAttrs = [...a.attributes]
      .map((x) => x.name)
      .sort()
      .join(",");
    const bAttrs = [...b.attributes]
      .map((x) => x.name)
      .sort()
      .join(",");
    if (aAttrs !== bAttrs) return `${path}: attrs [${aAttrs}] vs [${bAttrs}]`;
    const ac = [...a.childNodes].filter((n) => !(n.nodeType === 3 && !n.textContent.trim()));
    const bc = [...b.childNodes].filter((n) => !(n.nodeType === 3 && !n.textContent.trim()));
    if (ac.length !== bc.length) {
      return `${path}: child count ${ac.length} vs ${bc.length} — ${ac.map(describe).slice(0, 4).join(" | ")} ⟷ ${bc.map(describe).slice(0, 4).join(" | ")}`;
    }
    for (let i = 0; i < ac.length; i++) {
      const hit = walk(ac[i], bc[i], `${path}>${ac[i].localName ?? "text"}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }

  return walk(serverTree, liveTree, "root") || "TREES MATCH";
}, `${base}${route}/`);
await browser.close();
console.log(result);
