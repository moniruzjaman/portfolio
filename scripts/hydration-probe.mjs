/**
 * hydration-probe.mjs — visit every route in a real browser and collect the
 * exact hydration errors (React dev build gives the DOM diff). Diagnostic only.
 */
import { readdirSync, existsSync } from "node:fs";

const base = (process.argv[2] || "http://localhost:4173/portfolio").replace(/\/$/, "");
const puppeteer = (await import("puppeteer-core")).default;
const chromium = (await import("@sparticuz/chromium")).default;

const routes = [""];
if (existsSync("dist/works")) {
  routes.push("works");
  for (const d of readdirSync("dist/works"))
    if (existsSync(`dist/works/${d}/index.html`)) routes.push(`works/${d}`);
}
if (existsSync("dist/notes")) {
  routes.push("notes");
  for (const d of readdirSync("dist/notes"))
    if (existsSync(`dist/notes/${d}/index.html`)) routes.push(`notes/${d}`);
}

const browser = await puppeteer.launch({
  args: [...chromium.args, "--no-sandbox"],
  executablePath: await chromium.executablePath(),
  headless: "shell",
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });

const failing = [];
for (const route of routes) {
  const errs = [];
  const onErr = (e) => errs.push(e.message.slice(0, 220));
  const onConsole = (m) => {
    if (m.type() === "error") errs.push(`console: ${m.text().slice(0, 220)}`);
  };
  page.on("pageerror", onErr);
  page.on("console", onConsole);
  await page.goto(`${base}/${route}`, { waitUntil: "load", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 900));
  page.off("pageerror", onErr);
  page.off("console", onConsole);
  if (errs.length) {
    failing.push({ route: route || "/", errs: [...new Set(errs)].slice(0, 3) });
    console.log(`✖ /${route}`);
    for (const e of [...new Set(errs)].slice(0, 3)) console.log(`    ${e}`);
  } else {
    console.log(`✔ /${route}`);
  }
}
await browser.close();
console.log(`\n${failing.length}/${routes.length} routes with errors`);
