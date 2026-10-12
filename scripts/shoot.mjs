// Screenshot helper for reviews. Usage:
//   NODE_PATH=$(npm root -g) node scripts/shoot.mjs <url> <outDir> [--reduced] [--no-webgl]
// Writes full-page PNGs at 1440 px and 400 px wide. Uses the global Playwright install.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [url = "http://localhost:3000/", out = "shots"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const reduced = process.argv.includes("--reduced");
const noWebgl = process.argv.includes("--no-webgl");
mkdirSync(out, { recursive: true });

const args = noWebgl ? ["--disable-webgl", "--disable-webgl2", "--disable-3d-apis"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
const browser = await chromium.launch({ args });
const tag = (reduced ? "-reduced" : "") + (noWebgl ? "-nowebgl" : "");
for (const width of [1440, 400]) {
  const page = await browser.newPage({ viewport: { width, height: width > 800 ? 900 : 860 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  // Scroll through once so scroll-triggered content settles, then back to top.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const name = `${out}/${new URL(url).pathname.replace(/\W+/g, "_") || "home"}-${width}${tag}.png`;
  await page.screenshot({ path: name, fullPage: true });
  console.log(name, overflow > 0 ? `HORIZONTAL OVERFLOW ${overflow}px` : "", errors.length ? `ERRORS: ${errors.join(" | ")}` : "");
  await page.close();
}
await browser.close();
