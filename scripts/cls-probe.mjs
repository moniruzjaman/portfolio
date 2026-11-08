/**
 * cls-probe.mjs — measure layout shifts on a page and name the elements that
 * moved: PerformanceObserver('layout-shift'), sources mapped to node labels.
 * Diagnostic companion to ui-audit for CLS budget failures.
 */
const url = process.argv[2] || "http://localhost:4173/notes/plantation-tracker-field-system/";
const puppeteer = (await import("puppeteer-core")).default;
const chromium = (await import("@sparticuz/chromium")).default;

const browser = await puppeteer.launch({
  args: [...chromium.args, "--no-sandbox"],
  executablePath: await chromium.executablePath(),
  headless: "shell",
});
const page = await browser.newPage();
await page.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true },
  userAgent:
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
});

// Lighthouse's mobile throttling: slow 4G + 4x CPU slowdown. Without it,
// fonts on localhost arrive before first paint and the shift never happens.
const cdp = await page.target().createCDPSession();
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 750,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.evaluateOnNewDocument(() => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({
        value: e.value,
        time: Math.round(e.startTime),
        sources: (e.sources || []).map((s) => {
          const n = s.node;
          const label = n
            ? n.nodeType === 3
              ? `text: ${JSON.stringify((n.textContent || "").trim().slice(0, 40))}`
              : `${n.localName}.${(n.className || "").toString().slice(0, 50)}`
            : "unknown";
          return label;
        }),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
});

await page.goto(url, { waitUntil: "load", timeout: 60000 });
await new Promise((r) => setTimeout(r, 4000));

const result = await page.evaluate(() => {
  const shifts = window.__shifts;
  const cls = shifts.reduce((a, s) => a + s.value, 0);
  return {
    cls: Number(cls.toFixed(4)),
    count: shifts.length,
    top: [...shifts]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((s) => ({ v: Number(s.value.toFixed(4)), t: s.time, src: s.sources.slice(0, 3) })),
  };
});
await browser.close();
console.log(JSON.stringify(result, null, 2));
