// axe-core scan of every page. Usage: node scripts/a11y-scan.mjs [baseUrl] [--json]
// Runs at 1440 and 400 px wide, and once more on / with the full-screen menu open.
// Exits 1 if any serious or critical violation is found. Uses the global Playwright install.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const globalRoot = execSync("npm root -g").toString().trim();
const { chromium } = createRequire(`${globalRoot}/`)("playwright");
const axeSource = readFileSync(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");

const base = (process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/$/, "");
const asJson = process.argv.includes("--json");
const paths = ["/", "/website-design", "/ai-agents-automation", "/claude-integration", "/ai-teaching", "/privacy"];

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const rows = [];
let blocking = 0;

async function scan(page, label) {
  await page.evaluate(axeSource);
  const res = await page.evaluate(() => window.axe.run(document, { resultTypes: ["violations"] }));
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const v of res.violations) counts[v.impact] += 1;
  blocking += counts.critical + counts.serious;
  rows.push({ label, counts, violations: res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target.join(" "), summary: n.failureSummary?.split("\n").slice(0, 3).join(" ") })) })) });
}

for (const width of [1440, 400]) {
  for (const path of paths) {
    const page = await browser.newPage({ viewport: { width, height: width > 800 ? 900 : 860 } });
    await page.goto(base + path, { waitUntil: "networkidle" });
    // Scroll through so lazy content mounts, then back to the top.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(100);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await scan(page, `${path} @${width}`);
    if (path === "/") {
      await page.getByRole("button", { name: /menu/i }).first().click();
      await page.waitForTimeout(700);
      await scan(page, `/ menu-open @${width}`);
    }
    await page.close();
  }
}
await browser.close();

if (asJson) console.log(JSON.stringify(rows, null, 2));
else {
  for (const r of rows) {
    const c = r.counts;
    console.log(`${r.label.padEnd(40)} critical ${c.critical}  serious ${c.serious}  moderate ${c.moderate}  minor ${c.minor}`);
    for (const v of r.violations) for (const n of v.nodes.slice(0, 4)) console.log(`    [${v.impact}] ${v.id}: ${n.target}  ${n.summary ?? ""}`);
  }
}
process.exit(blocking ? 1 : 0);
