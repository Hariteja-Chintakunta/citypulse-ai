/** API client for /api/v1 with a clearly-labelled demo fallback.
 *
 * When NEXT_PUBLIC_API_URL is reachable and the user is signed in, requests
 * go to the FastAPI backend. Otherwise the app runs in demo mode on the
 * local store (lib/store.ts) and says so in the UI. Demo mode never
 * pretends to be the live backend.
 */

import { getComplaints, getHistory, saveComplaint, updateComplaint, updateComplaintStatus } from "./store";
import type { AiResult, Category, Complaint, DuplicateMatch, LeaderboardEntry, Reward, StatusHistoryItem } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/** Overdue rewards (mirrors backend reward_service): 3-day SLA, 1000
 * points per overdue day, 1000 points = Rs 100 off. */
export const SLA_DAYS = 3;
export const POINTS_PER_DAY = 1000;
export const RUPEES_PER_1000_POINTS = 100;

/** Apps Script receiver (the same script that emails new reports) — it
 * also emails + texts promo codes when a report goes overdue.
 * Runs under citypulsehyderabad@gmail.com (the app account). */
const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ??
  "https://script.google.com/macros/s/AKfycbztjlIc8TLYDXfcioeEvx3PHWLgUVjHvOnMR0j656r8N7YSfBBtY1flC4p2_AprM1dW/exec";

export function isDemoMode(): boolean {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem("citypulse.api") !== "live"
  );
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("citypulse.token");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<void> {
  const data = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  window.localStorage.setItem("citypulse.token", data.access_token);
  window.localStorage.setItem("citypulse.api", "live");
  // Resolve the role so the app can show the right portal (admin vs user).
  try {
    const me = await getMe();
    window.localStorage.setItem("citypulse.role", me.role);
    window.localStorage.setItem("citypulse.user", me.name);
  } catch {
    window.localStorage.removeItem("citypulse.role");
    window.localStorage.removeItem("citypulse.user");
  }
}

/** Signed-in user's profile, including role ("admin" or "citizen"). */
export async function getMe(): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
}> {
  return request("/auth/me");
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("citypulse.role");
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("citypulse.user");
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("citypulse.token");
  window.localStorage.removeItem("citypulse.api");
  window.localStorage.removeItem("citypulse.role");
  window.localStorage.removeItem("citypulse.user");
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  await login(email, password);
}

export async function listComplaints(): Promise<Complaint[]> {
  if (isDemoMode()) return getComplaints();
  return request<Complaint[]>("/complaints");
}

/** Load the list, live when signed in, demo store otherwise.
 * Falls back to the demo store if the live request fails (for example an
  * expired token), so the pages always show something. */
export async function loadComplaints(): Promise<Complaint[]> {
  if (isDemoMode()) return getComplaints();
  try {
    return await listComplaints();
  } catch {
    return getComplaints();
  }
}

/** One ticket by id, live when signed in, demo store otherwise. */
export async function getComplaint(id: string): Promise<Complaint | null> {
  if (isDemoMode()) return getComplaints().find((c) => c.id === id) ?? null;
  try {
    return await request<Complaint>(`/complaints/${id}`);
  } catch {
    return getComplaints().find((c) => c.id === id) ?? null;
  }
}

/** Status timeline for one ticket, live when signed in. */
export async function getComplaintHistory(
  id: string,
  ): Promise<StatusHistoryItem[]> {
  if (isDemoMode()) return getHistory(id);
  try {
    return await request<StatusHistoryItem[]>(`/complaints/${id}/history`);
  } catch {
    return getHistory(id);
  }
}

/** Live leaderboard — the endpoint needs no sign-in, so anyone can see it. */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>("/leaderboard");
}

export async function createComplaint(input: {
  category: Category;
  description: string;
  ward: string;
  address: string;
  latitude: number;
  longitude: number;
  reporter_phone?: string;
  reporter_email?: string;
}): Promise<Complaint> {
  if (isDemoMode()) {
    const now = new Date();
    const count = getComplaints().length;
    const complaint: Complaint = {
      id: `local-${now.getTime()}`,
      ticket_no: `CP-${now.getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      category: input.category,
      description: input.description,
      status: "SUBMITTED",
      severity: "Medium",
      ward: input.ward,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      is_demo: true,
      created_at: now.toISOString(),
      reporter_phone: input.reporter_phone ?? null,
      reporter_email: input.reporter_email ?? null,
      sla_deadline: new Date(now.getTime() + SLA_DAYS * 86400000).toISOString(),
      reward_points: 0,
      promo_code: null,
      promo_value_inr: 0,
      days_overdue: 0,
    };
    saveComplaint(complaint);
    return complaint;
  }
  return request<Complaint>("/complaints", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      location: {
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
      },
    }),
  });
}

export async function updateStatus(
  id: string,
  newStatus: Complaint["status"],
  remarks?: string,
  reason?: string,
): Promise<Complaint> {
  if (isDemoMode()) {
    const updated = updateComplaintStatus(id, newStatus, remarks, reason);
    if (!updated) throw new Error("Complaint not found");
    return updated;
  }
  return request<Complaint>(`/admin/complaints/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      new_status: newStatus,
      remarks,
      reason,
    }),
  });
}

/** Overdue reward for one ticket, live when signed in, demo-computed
 * otherwise. The backend generates the promo code on first read once the
 * ticket is overdue; demo mode does the same locally. */
export async function getReward(id: string): Promise<Reward | null> {
  if (isDemoMode()) {
    const found = getComplaints().find((c) => c.id === id);
    return found ? demoReward(found) : null;
  }
  try {
    return await request<Reward>(`/complaints/${id}/reward`);
  } catch {
    const found = getComplaints().find((c) => c.id === id);
    return found ? demoReward(found) : null;
  }
}

/** The signed-in citizen's reward-earning tickets, richest first. */
export async function getMyRewards(): Promise<Reward[]> {
  if (isDemoMode()) {
    return getComplaints()
      .map(demoReward)
      .filter((r) => r.days_overdue > 0 || r.reward_points > 0)
      .sort((a, b) => b.reward_points - a.reward_points);
  }
  try {
    return await request<Reward[]>("/rewards/me");
  } catch {
    return getComplaints()
      .map(demoReward)
      .filter((r) => r.days_overdue > 0 || r.reward_points > 0)
      .sort((a, b) => b.reward_points - a.reward_points);
  }
}

/** Demo-mode mirror of backend reward_service: 3-day SLA, 1000 points per
 * overdue day, code generated once and stored on the local ticket. */
function demoReward(c: Complaint): Reward {
  const created = new Date(c.created_at).getTime();
  const deadline = new Date(created + SLA_DAYS * 86400000);
  let end = Date.now();
  if (c.status === "RESOLVED") {
    const history = getHistory(c.id);
    const resolved = [...history]
      .reverse()
      .find((h) => h.new_status === "RESOLVED");
    if (resolved) end = new Date(resolved.created_at).getTime();
  }
  let days = 0;
  if (
    c.status !== "REJECTED" &&
    c.status !== "DUPLICATE_MERGED" &&
    end > deadline.getTime()
  ) {
    // Full days overdue — points accrue per completed day.
    days = Math.floor((end - deadline.getTime()) / 86400000);
  }
  const points = days * POINTS_PER_DAY;
  const value =
    Math.floor(points / POINTS_PER_DAY) * RUPEES_PER_1000_POINTS;
  let code = c.promo_code ?? null;
  let codeNew = false;
  if (points > 0 && !code) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    code =
      "CP-RWD-" +
      Array.from(
        { length: 6 },
        () => alphabet[Math.floor(Math.random() * alphabet.length)],
      ).join("");
    updateComplaint(c.id, { promo_code: code, reward_points: points });
    codeNew = true;
  }
  return {
    complaint_id: c.id,
    ticket_no: c.ticket_no,
    category: c.category,
    status: c.status,
    sla_deadline: deadline.toISOString(),
    days_overdue: days,
    reward_points: points,
    promo_code: code,
    promo_code_created_at: null,
    promo_value_inr: value,
    promo_code_new: codeNew,
    reporter_email: c.reporter_email ?? null,
    reporter_phone: c.reporter_phone ?? null,
  };
}

/** Email a newly generated promo code through the Apps Script Gmail
 * sender (the same script that emails new reports). Fire-and-forget:
 * false when the script is unreachable — the code stays visible in the
 * app either way. SMS is off by the owner's choice (email only); the
 * script skips the text when no SMS key is configured. */
export async function sendPromoCodeEmail(input: {
  ticket_no: string;
  category: string;
  points: number;
  promo_code: string;
  value_inr: number;
  email: string;
  phone?: string | null;
}): Promise<boolean> {
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "reward", ...input }),
    });
    const body = await res.json().catch(() => ({}));
    return body.ok === true;
  } catch {
    return false;
  }
}

export async function findDuplicates(input: {
  category: Category;
  latitude: number;
  longitude: number;
  description: string;
}): Promise<DuplicateMatch[]> {
  if (isDemoMode()) {
    // Same rule as the backend: same/related category, ~50 m, 14 days.
    return getComplaints()
      .filter((c) => c.category === input.category)
      .map((c) => ({
        complaint_id: c.id,
        ticket_no: c.ticket_no,
        category: c.category,
        distance_m: Math.round(haversineM(input.latitude, input.longitude, c.latitude, c.longitude)),
        similarity: 0.9,
        decision: "pending" as const,
      }))
      .filter((m) => m.distance_m <= 500)
      .sort((a, b) => a.distance_m - b.distance_m);
  }
  const params = new URLSearchParams({
    category: input.category,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    description: input.description,
  });
  return request<DuplicateMatch[]>(`/complaints/duplicates?${params}`);
}
/** Analyse a photo with the backend AI service (POST /ai/analyze).
 * The service answers live when a vision key is configured and falls back
 * to its clearly-labelled mock analyser otherwise; the returned `mode`
 * field says which one ran and the panel shows it. On a provider failure
 * the backend answers 502/503 with a fail-soft result (confidence 0,
 * human review required) — that result is returned, not thrown. */
export async function analyzeImage(input: File | string): Promise<AiResult> {
  const form = new FormData();
  if (typeof input === "string") {
    form.append("filename", input);
  } else {
    form.append("file", input);
  }
  const token = getToken();
  const res = await fetch(`${API_URL}/ai/analyze`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if ((res.status === 502 || res.status === 503) && body.predicted_category) {
      return body as AiResult;
    }
    throw new Error(body.detail ?? `AI analysis failed: ${res.status}`);
  }
  return body as AiResult;
}
 
export function haversineM(
  lat1: number, lon1: number, lat2: number, lon2: number,
): number {
  const r = 6371000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}
