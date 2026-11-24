/** TC11–TC15 — access control, workflow enforcement and the map. */

import { expect, test } from "@playwright/test";
import {
  API_URL, DEMO_ADMIN, DEMO_CITIZEN, apiAvailable, apiLogin,
} from "../fixtures/testData";
import { AdminPage } from "../pages/AdminPage";
import { MapPage } from "../pages/MapPage";

test("TC11 — restrict complaint details to authorised users", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const adminToken = await apiLogin(request, DEMO_ADMIN.email, DEMO_ADMIN.password);
  const list = await request.get(`${API_URL}/complaints`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const complaints = await list.json();
  const target = complaints.find((c: { ticket_no: string }) => c.ticket_no === "CP-2026-0001");
  expect(target).toBeTruthy();

  // A different citizen must not be able to read Priya's complaint.
  const other = await request.post(`${API_URL}/auth/register`, {
    data: { name: "Other Citizen", email: `other-${Date.now()}@citypulse.test`, password: "Password123" },
  });
  expect(other.status()).toBe(201);
  const otherToken = await apiLogin(request, (await other.json()).email, "Password123");
  const denied = await request.get(`${API_URL}/complaints/${target.id}`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  expect(denied.status()).toBe(403);
});

test("TC12 — prevent a citizen from changing admin-only status", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const citizenToken = await apiLogin(request, DEMO_CITIZEN.email, DEMO_CITIZEN.password);
  const adminToken = await apiLogin(request, DEMO_ADMIN.email, DEMO_ADMIN.password);
  const list = await request.get(`${API_URL}/complaints`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const target = (await list.json())[0];
  const res = await request.patch(`${API_URL}/admin/complaints/${target.id}/status`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
    data: { new_status: "VERIFIED" },
  });
  expect(res.status()).toBe(403);
});

test("TC13 — reject invalid status transitions", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const adminToken = await apiLogin(request, DEMO_ADMIN.email, DEMO_ADMIN.password);
  const list = await request.get(`${API_URL}/complaints`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const submitted = (await list.json()).find(
    (c: { status: string }) => c.status === "SUBMITTED",
  );
  expect(submitted).toBeTruthy();
  // SUBMITTED -> IN PROGRESS skips steps and is not an allowed transition.
  // (Admins may resolve directly: SUBMITTED -> RESOLVED is allowed.)
  const res = await request.patch(
    `${API_URL}/admin/complaints/${submitted.id}/status`,
    {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { new_status: "IN PROGRESS" },
    },
  );
  expect(res.status()).toBe(422);
});

test("TC14 — persist every status change in audit history", async ({ page }) => {
  const admin = new AdminPage(page);
  await admin.goto();
  await admin.openQueueItem("CP-2026-0001");
  await admin.updateStatus("UNDER REVIEW", "Photo and location checked.");
  await expect(admin.message).toBeVisible();
  await page.goto("/complaints/c0000001-0000-0000-0000-000000000001");
  await expect(page.getByTestId("status-timeline")).toBeVisible();
  await expect(page.getByTestId("history-item").first()).toContainText("UNDER REVIEW");
});

test("TC15 — display issue markers at the correct coordinates", async ({ request }) => {
  test.skip(!(await apiAvailable(request)), "Backend not running");
  const res = await request.get(`${API_URL}/map/issues`);
  expect(res.ok()).toBeTruthy();
  const issues = await res.json();
  const pothole = issues.find((i: { ticket_no: string }) => i.ticket_no === "CP-2026-0001");
  expect(pothole).toBeTruthy();
  expect(pothole.latitude).toBeCloseTo(17.4326, 3);
  expect(pothole.longitude).toBeCloseTo(78.4071, 3);
});

test("TC15 (UI) — map renders and category filters change the list", async ({ page }) => {
  const map = new MapPage(page);
  await map.goto();
  await expect(map.count).toContainText("Showing 15 of 15 reports");
  await map.filterBy("Pothole");
  await expect(map.count).toContainText("Showing 4 of 15 reports");
});
