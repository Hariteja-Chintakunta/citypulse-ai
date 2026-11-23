/** TC06–TC10 — AI suggestions, duplicates and ticket numbers. */

import { expect, test } from "@playwright/test";
import { SAMPLE_DESCRIPTION } from "../fixtures/testData";
import { ReportPage } from "../pages/ReportPage";

test("TC06 — verify AI category suggestion for a labelled sample image", async ({ page }) => {
  const report = new ReportPage(page);
  await report.goto();
  await report.useSamplePhoto("pothole");
  await report.fillReport({ description: SAMPLE_DESCRIPTION, ward: "Golconda" });
  await report.submitToAi();
  await expect(page.getByTestId("ai-category")).toHaveText("Pothole");
  const confidence = await page.getByTestId("ai-confidence").textContent();
  expect(Number((confidence ?? "0%").replace("%", ""))).toBeGreaterThan(70);
});

test("TC07 — route low-confidence AI output to human review", async ({ page }) => {
  const report = new ReportPage(page);
  await report.goto();
  // An unclear photo name produces a low-confidence mock result (< 70%).
  await report.photoInput.setInputFiles({
    name: "blurry-photo.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-image-bytes"),
  });
  await report.fillReport({ description: SAMPLE_DESCRIPTION, ward: "Golconda" });
  await report.submitToAi();
  await expect(page.getByTestId("ai-human-review")).toBeVisible();
  await expect(page.getByTestId("ai-human-review")).toContainText("human review");
});

test("TC08 — flag a possible duplicate at the same location", async ({ page }) => {
  const report = new ReportPage(page);
  await report.goto();
  await report.useSamplePhoto("pothole");
  // Jubilee Hills already has demo ticket CP-2026-0001 (pothole).
  await report.fillReport({ description: "Pothole on Road No. 36", ward: "Jubilee Hills" });
  await report.submitToAi();
  await report.confirmCategory();
  await expect(page.getByTestId("duplicate-match")).toBeVisible();
  await expect(page.getByTestId("duplicate-panel")).toContainText("CP-2026-0001");
});

test("TC09 — allow a similar issue at a different location", async ({ page }) => {
  const report = new ReportPage(page);
  await report.goto();
  await report.useSamplePhoto("pothole");
  // Golconda has no demo pothole, so no duplicate should be flagged.
  await report.fillReport({ description: SAMPLE_DESCRIPTION, ward: "Golconda" });
  await report.submitToAi();
  await report.confirmCategory();
  await expect(page.getByTestId("duplicate-match")).toHaveCount(0);
  await expect(page.getByTestId("duplicate-panel")).toContainText("No possible duplicates");
});

test("TC10 — generate a unique complaint ticket number", async ({ page }) => {
  const report = new ReportPage(page);
  const tickets: string[] = [];
  for (const ward of ["Golconda", "Uppal"]) {
    await report.goto();
    await report.useSamplePhoto("garbage");
    await report.fillReport({ description: SAMPLE_DESCRIPTION, ward });
    await report.submitToAi();
    await report.confirmCategory();
    await report.fileSeparately();
    tickets.push(await report.ticketNo());
  }
  expect(tickets[0]).toMatch(/^CP-\d{4}-\d{4}$/);
  expect(tickets[1]).toMatch(/^CP-\d{4}-\d{4}$/);
  expect(tickets[0]).not.toBe(tickets[1]);
});
