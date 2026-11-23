/** Shared types — mirror the backend /api/v1 schemas. */

export type Category =
  | "Pothole" | "Garbage" | "Streetlight" | "Waterlogging"
  | "Traffic Congestion" | "Footpath" | "Drainage" | "Other"
  | "Traffic Police Challan" | "Wrong-Way Driving"
  | "Chemical Factory Pollution" | "Political Complaint"
  | "Drainage Overflow" | "Rainwater Harvesting" | "Water Conservation";

export type ComplaintStatus =
  | "SUBMITTED" | "UNDER REVIEW" | "VERIFIED"
  | "IN PROGRESS" | "RESOLVED" | "REJECTED" | "DUPLICATE_MERGED";

export type Severity = "Low" | "Medium" | "High";

export interface Complaint {
  id: string;
  ticket_no: string;
  category: Category;
  description: string;
  status: ComplaintStatus;
  severity: Severity;
  ward: string;
  address: string;
  latitude: number;
  longitude: number;
  is_demo: boolean;
  created_at: string;
}

export interface StatusHistoryItem {
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  remarks?: string | null;
  reason?: string | null;
  created_at: string;
}

export interface AiResult {
  predicted_category: Category;
  confidence: number; // 0–1
  suggested_severity: Severity;
  visible_evidence: string;
  needs_human_review: boolean;
  model_version: string;
  analysed_at: string;
  mode: "mock" | "live";
}

export interface DuplicateMatch {
  complaint_id: string;
  ticket_no: string;
  category: Category;
  distance_m: number;
  similarity: number;
  decision: "pending" | "duplicate" | "separate";
}

export interface LeaderboardEntry {
  name: string;
  points: number;
}

export interface AlertItem {
  id: string;
  kind: "rain" | "traffic";
  title: string;
  detail: string;
  ward: string;
  created_at: string;
}

export const WORKFLOW: ComplaintStatus[] = [
  "SUBMITTED", "UNDER REVIEW", "VERIFIED", "IN PROGRESS", "RESOLVED",
];

export const NEXT_STATUS: Record<string, ComplaintStatus[]> = {
  SUBMITTED: ["UNDER REVIEW", "REJECTED", "DUPLICATE_MERGED"],
  "UNDER REVIEW": ["VERIFIED", "REJECTED", "DUPLICATE_MERGED"],
  VERIFIED: ["IN PROGRESS", "REJECTED", "DUPLICATE_MERGED"],
  "IN PROGRESS": ["RESOLVED", "REJECTED", "DUPLICATE_MERGED"],
  RESOLVED: [],
  REJECTED: [],
  DUPLICATE_MERGED: [],
};
