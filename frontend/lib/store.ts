/** Local demo store: user-created reports persist in the browser
 * (localStorage) while the app runs without a backend. Clearly demo-only:
 * data never leaves the device in demo mode. */

import { DEMO_COMPLAINTS } from "./demoData";
import type { Complaint, StatusHistoryItem } from "./types";

const COMPLAINTS_KEY = "citypulse.demo.complaints.v1";
const HISTORY_KEY = "citypulse.demo.history.v1";
const POINTS_KEY = "citypulse.demo.points.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — demo data stays in memory only.
  }
}

export function getComplaints(): Complaint[] {
  const stored = read<Complaint[]>(COMPLAINTS_KEY, []);
  const byId = new Map(DEMO_COMPLAINTS.map((c) => [c.id, c]));
  for (const c of stored) byId.set(c.id, c);
  return [...byId.values()].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export function saveComplaint(complaint: Complaint): void {
  const stored = read<Complaint[]>(COMPLAINTS_KEY, []);
  write(COMPLAINTS_KEY, [complaint, ...stored]);
  const history = read<Record<string, StatusHistoryItem[]>>(HISTORY_KEY, {});
  history[complaint.id] = [
    {
      old_status: null,
      new_status: "SUBMITTED",
      remarks: "Report created by citizen.",
      created_at: complaint.created_at,
    },
  ];
  write(HISTORY_KEY, history);
}

export function updateComplaint(
  id: string,
  patch: Partial<Complaint>,
): Complaint | null {
  const all = getComplaints();
  const target = all.find((c) => c.id === id);
  if (!target) return null;
  const updated: Complaint = { ...target, ...patch };
  write(COMPLAINTS_KEY, [updated, ...all.filter((c) => c.id !== id)]);
  return updated;
}

export function updateComplaintStatus(
  id: string,
  newStatus: Complaint["status"],
  remarks?: string,
  reason?: string,
): Complaint | null {
  const all = getComplaints();
  const target = all.find((c) => c.id === id);
  if (!target) return null;
  const updated: Complaint = { ...target, status: newStatus };
  write(COMPLAINTS_KEY, [updated, ...all.filter((c) => c.id !== id)]);
  const history = read<Record<string, StatusHistoryItem[]>>(HISTORY_KEY, {});
  const items = history[id] ?? [
    {
      old_status: null,
      new_status: target.status,
      remarks: "Report created by citizen.",
      created_at: target.created_at,
    },
  ];
  items.push({
    old_status: target.status,
    new_status: newStatus,
    remarks: remarks ?? null,
    reason: reason ?? null,
    created_at: new Date().toISOString(),
  });
  history[id] = items;
  write(HISTORY_KEY, history);
  return updated;
}

export function getHistory(id: string): StatusHistoryItem[] {
  const history = read<Record<string, StatusHistoryItem[]>>(HISTORY_KEY, {});
  return history[id] ?? [];
}

export function addPoints(points: number): number {
  const current = read<number>(POINTS_KEY, 0);
  const next = current + points;
  write(POINTS_KEY, next);
  return next;
}

export function getMyPoints(): number {
  return read<number>(POINTS_KEY, 0);
}
