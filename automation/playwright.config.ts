import { defineConfig, devices } from "@playwright/test";

/**
 * CityPulse AI — Playwright config (Blueprint section 10, TC01–TC20).
 * UI tests run against the Next.js frontend (BASE_URL, default
 * http://localhost:3000). API tests run against the FastAPI backend
 * (API_URL, default http://localhost:8000/api/v1) and skip gracefully
 * when the backend is not running.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: "**/accessibility.spec.ts",
    },
  ],
});
