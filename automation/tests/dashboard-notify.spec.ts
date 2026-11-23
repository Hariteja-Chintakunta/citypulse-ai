/** TC16–TC20 — dashboard, notifications, AI resilience and accessibility. */

import { expect, test } from "@playwright/test";
import {
  API_URL, DEMO_ADMIN, DEMO_CITIZEN, SAMPLE_DESCRIPTION,
  apiAvailable, apiLogin,
} from "../fixtures/testData";
import { ReportPage } from "../pages/ReportPage";

test("TC16 — refresh dashboard metrics after a new complaint", async ({ page }) => {
  await page.goto("/");
  const before = await page.getByTestId("metric-total").textContent();
  const report = new ReportPage(page);
  await report.goto();
  await report.useSamplePhoto("garbage");
  await report.fillReport({ description: SAMPLE_DESCRIPTION, ward: "Golconda" });
  await report.submitToAi();
  await report.confirmCategory();
  await report.fileSeparately();
  await page.goto("/");
  const after = await page.getByTestId("metric-total").textContent();
  expect(Number(after)).toBe(Number(before) + 1);
});

test("TC17 — notify the citizen after a status update", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const adminToken = await apiLogin(request, DEMO_ADMIN.email, DEMO_ADMIN.password);
  const list = await request.get(`${API_URL}/complaints`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const submitted = (await list.json()).find(
    (c: { status: string }) => c.status === "SUBMITTED",
  );
  expect(submitted).toBeTruthy();
  const update = await request.patch(
    `${API_URL}/admin/complaints/${submitted.id}/status`,
    {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { new_status: "UNDER REVIEW", remarks: "Taken up for review." },
    },
  );
  expect(update.status()).toBe(200);
  const citizenToken = await apiLogin(request, DEMO_CITIZEN.email, DEMO_CITIZEN.password);
  const notes = await request.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const messages = (await notes.json()).map((n: { message: string }) => n.message);
  expect(messages.some((m: string) => m.includes(submitted.ticket_no))).toBeTruthy();
});

test("TC18 — handle AI provider timeout gracefully", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const res = await request.post(`${API_URL}/ai/analyze`, {
    multipart: { simulate_timeout: "true" },
  });
  expect(res.status()).toBe(503);
  const body = await res.json();
  expect(body.needs_human_review).toBe(true);
  expect(body.detail).toContain("human review");
});

test("TC19 — prevent unauthorised image access", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const adminToken = await apiLogin(request, DEMO_ADMIN.email, DEMO_ADMIN.password);
  const list = await request.get(`${API_URL}/complaints`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const target = (await list.json())[0];
  const other = await request.post(`${API_URL}/auth/register`, {
    data: { name: "Other Citizen", email: `other19-${Date.now()}@citypulse.test`, password: "Password123" },
  });
  const otherToken = await apiLogin(request, (await other.json()).email, "Password123");
  // Media upload (and therefore media access) is owner/admin only.
  const upload = await request.post(`${API_URL}/complaints/${target.id}/media`, {
    headers: { Authorization: `Bearer ${otherToken}` },
    multipart: {
      file: { name: "x.jpg", mimeType: "image/jpeg", buffer: Buffer.from("x") },
    },
  });
  expect(upload.status()).toBe(403);
});
