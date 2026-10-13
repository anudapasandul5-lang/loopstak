import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const SECTIONS = ["top", "process", "prices", "keys", "work", "contact"];
const SHOTS = "test-results/screens";

// Collect console errors and uncaught page errors for the whole visit.
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("every section renders without errors", async ({ page }, info) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("form.form")).toHaveCount(1);

  const sideScroll = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(sideScroll, "page scrolls sideways").toBeLessThanOrEqual(0);

  mkdirSync(SHOTS, { recursive: true });
  for (const id of SECTIONS) {
    const sec = page.locator(`section#${id}`);
    await expect(sec, `section #${id} missing`).toHaveCount(1);
    await sec.scrollIntoViewIfNeeded();
    // Let scroll-linked camera moves and reveal animations settle.
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/${info.project.name}-${id}.png` });
  }

  const gl = await page.evaluate(() => document.documentElement.classList.contains("gl-ready"));
  info.annotations.push({ type: "webgl", description: gl ? "3D scene ran" : "3D scene did not start (fallback shown)" });

  expect(errors, "console errors").toEqual([]);
});

test("speed on slow 4G and a mid-range phone CPU", async ({ page, browserName }, info) => {
  test.skip(info.project.name !== "mobile" || browserName !== "chromium", "measured once, on mobile");

  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  // Roughly "slow 4G": 150 ms latency, 1.6 Mbps down, 750 kbps up.
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  let bytes = 0;
  cdp.on("Network.loadingFinished", (e) => {
    bytes += e.encodedDataLength;
  });

  await page.goto("/", { waitUntil: "networkidle", timeout: 80_000 });

  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve(-1), 5000);
      }),
  );

  const result = { pageWeightKB: Math.round(bytes / 1024), lcpMs: Math.round(lcp) };
  mkdirSync("test-results", { recursive: true });
  writeFileSync("test-results/perf.json", JSON.stringify(result, null, 2));
  info.annotations.push({ type: "perf", description: JSON.stringify(result) });
  console.log("PERF", result);
});
