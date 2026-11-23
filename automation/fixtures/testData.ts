/** Shared test data and helpers for TC01–TC20. */

export const API_URL =
  process.env.API_URL ?? "http://localhost:8000/api/v1";
export const BASE_URL =
  process.env.BASE_URL ?? "http://localhost:3000";

export const DEMO_ADMIN = {
  email: "admin@citypulse.demo",
  password: "demo1234",
};

export const DEMO_CITIZEN = {
  email: "priya@citypulse.demo",
  password: "demo1234",
};

export const SAMPLE_DESCRIPTION =
  "Test report created by Playwright automation. (Demo data)";

/** Returns true when the FastAPI backend answers /health. API-only
 * scenarios skip gracefully when it is not running. */
export async function apiAvailable(request: import("@playwright/test").APIRequestContext): Promise<boolean> {
  try {
    const res = await request.get(`${API_URL.replace(/\/api\/v1$/, "")}/health`, { timeout: 3000 });
    return res.ok();
  } catch {
    return false;
  }
}

export async function apiLogin(
  request: import("@playwright/test").APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) throw new Error(`login failed: ${res.status()}`);
  const body = await res.json();
  return body.access_token as string;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@citypulse.test`;
}
