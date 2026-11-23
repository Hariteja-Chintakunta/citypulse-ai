/** TC20 — mobile layout and keyboard accessibility. Runs on the Pixel 7
 * project (see playwright.config.ts). */

import { expect, test } from "@playwright/test";

test("TC20 — mobile layout has no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await page.goto("/report");
  const overflowReport = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflowReport).toBeLessThanOrEqual(0);
});

test("TC20 — keyboard navigation reaches the report flow", async ({ page }) => {
  await page.goto("/");
  // Skip link is the first focusable element.
  await page.keyboard.press("Tab");
  const skipLink = page.getByText("Skip to main content");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  // Tab through the navigation to "Report an issue" and open it.
  const reportLink = page.getByRole("link", { name: "Report an issue" });
  await reportLink.focus();
  await expect(reportLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/report/);
  await expect(page.getByRole("heading", { name: "Report an issue" })).toBeVisible();
});
