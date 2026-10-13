import { defineConfig } from "@playwright/test";

// Visual and speed checks against a production build.
// Run: npm run check:visual   (screenshots + perf numbers land in test-results/)
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results/artifacts",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: "chromium",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    },
    {
      name: "reduced-motion",
      use: { viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: "reduce" } },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: true,
    env: { NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}` },
  },
});
