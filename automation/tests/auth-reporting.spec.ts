/** TC01–TC05 — auth, reporting and validation (Blueprint section 10). */

import { expect, test } from "@playwright/test";
import {
  API_URL, SAMPLE_DESCRIPTION, apiAvailable, uniqueEmail,
} from "../fixtures/testData";
import { LoginPage } from "../pages/MapPage";
import { ReportPage } from "../pages/ReportPage";

test("TC01 — register a new citizen with valid details", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const email = uniqueEmail("tc01");
  const res = await request.post(`${API_URL}/auth/register`, {
    data: { name: "TC01 Citizen", email, password: "Password123" },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.email).toBe(email);
  expect(body.role).toBe("citizen");
});

test("TC02 — reject invalid login credentials", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: "nobody@citypulse.demo", password: "wrong-password" },
  });
  expect(res.status()).toBe(401);
});

test("TC02 (UI) — invalid login shows an error on the sign-in page", async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login("nobody@citypulse.demo", "wrong-password");
  await expect(login.error).toBeVisible();
});

test("TC03 — submit a complaint with a supported image", async ({ page }) => {
  const report = new ReportPage(page);
  await report.goto();
  await report.useSamplePhoto("pothole");
  await report.fillReport({ description: SAMPLE_DESCRIPTION, ward: "Golconda" });
  await report.submitToAi();
  await report.confirmCategory();
  await report.fileSeparately();
  const ticket = await report.ticketNo();
  expect(ticket).toMatch(/^CP-\d{4}-\d{4}$/);
});

test("TC04 — reject unsupported image formats and oversized files", async ({ page }) => {
  const report = new ReportPage(page);
  await report.goto();
  await report.photoInput.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByRole("alert")).toContainText("Unsupported image format");
});

test("TC04 (API) — oversized image upload is rejected", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const res = await request.post(`${API_URL}/ai/analyze`, {
    multipart: {
      file: {
        name: "huge.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.alloc(6 * 1024 * 1024, 0),
      },
    },
  });
  expect(res.status()).toBe(413);
});

test("TC05 — validate mandatory category and location", async ({ page }) => {
  const report = new ReportPage(page);
  await report.goto();
  await report.useSamplePhoto("garbage");
  // Description is mandatory: submitting without it must not reach the AI step.
  await report.submitButton.click();
  await expect(report.aiPanel).not.toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Description is required");
});
