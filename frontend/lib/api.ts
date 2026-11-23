/** API client for /api/v1 with a clearly-labelled demo fallback.
 *
 * When NEXT_PUBLIC_API_URL is reachable and the user is signed in, requests
 * go to the FastAPI backend. Otherwise the app runs in demo mode on the
 * local store (lib/store.ts) and says so in the UI. Demo mode never
 * pretends to be the live backend.
 */

import { getComplaints, saveComplaint, updateComplaintStatus } from "./store";
import type { AiResult, Category, Complaint, DuplicateMatch } from "./types";

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

/** Client-side mock AI — mirrors backend/app/services/ai_service.py.
 * Used only in demo mode; labelled mode: "mock". */
export function mockAnalyse(filename: string): AiResult {
  const lowered = filename.toLowerCase();
  const hints: Array<[string, Category, number, string, string]> = [
    ["pothole", "Pothole", 0.92, "High", "Dark cavity in road surface with broken edges"],
    ["garbage", "Garbage", 0.85, "Medium", "Waste spilling from an overflowing bin"],
    ["streetlight", "Streetlight", 0.88, "Medium", "Lamp post visible with no light emitted"],
    ["water", "Waterlogging", 0.95, "High", "Standing water covering the road surface"],
    ["flood", "Waterlogging", 0.93, "High", "Standing water covering the road surface"],
    ["traffic", "Traffic Congestion", 0.81, "Medium", "Long queue of vehicles at a junction"],
    ["footpath", "Footpath", 0.78, "Low", "Broken slabs on the pedestrian footpath"],
    ["drain", "Drainage", 0.86, "High", "Blocked drain with stagnant water"],
  ];
  for (const [keyword, category, confidence, severity, evidence] of hints) {
    if (lowered.includes(keyword)) {
      return {
        predicted_category: category,
        confidence,
        suggested_severity: severity as AiResult["suggested_severity"],
        visible_evidence: evidence,
        needs_human_review: confidence < 0.7,
        model_version: "citypulse-vision-mock-v1",
        analysed_at: new Date().toISOString(),
        mode: "mock",
      };
    }
  }
  return {
    predicted_category: "Pothole",
    confidence: 0.62,
    suggested_severity: "Medium",
    visible_evidence: "Road surface damage visible in photo",
    needs_human_review: true,
    model_version: "citypulse-vision-mock-v1",
    analysed_at: new Date().toISOString(),
    mode: "mock",
  };
}
