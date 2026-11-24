/** API client for /api/v1 with a clearly-labelled demo fallback.
 *
 * When NEXT_PUBLIC_API_URL is reachable and the user is signed in, requests
 * go to the FastAPI backend. Otherwise the app runs in demo mode on the
 * local store (lib/store.ts) and says so in the UI. Demo mode never
 * pretends to be the live backend.
 */

import { getComplaints, getHistory, saveComplaint, updateComplaintStatus } from "./store";
import type { AiResult, Category, Complaint, DuplicateMatch, LeaderboardEntry, StatusHistoryItem } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

export async function createComplaint(input: {
  category: Category;
  description: string;
  ward: string;
  address: string;
  latitude: number;
  longitude: number;
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
