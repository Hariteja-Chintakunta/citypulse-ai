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
  /** Optional contact for rewards (sent with the report, if given). */
  reporter_phone?: string | null;
  reporter_email?: string | null;
  /** 3-day resolution SLA + overdue reward (live-computed by the API). */
  sla_deadline?: string | null;
  reward_points?: number;
  promo_code?: string | null;
  promo_value_inr?: number;
  days_overdue?: number;
}

/** Overdue reward for one ticket (GET /complaints/{id}/reward). */
export interface Reward {
  complaint_id: string;
  ticket_no: string;
  category: string;
  status: ComplaintStatus;
  sla_deadline: string | null;
  days_overdue: number;
  reward_points: number;
  promo_code: string | null;
  promo_code_created_at: string | null;
  promo_value_inr: number;
  promo_code_new: boolean;
  reporter_email: string | null;
  reporter_phone: string | null;
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
  SUBMITTED: ["UNDER REVIEW", "REJECTED", "DUPLICATE_MERGED", "RESOLVED"],
  "UNDER REVIEW": ["VERIFIED", "REJECTED", "DUPLICATE_MERGED", "RESOLVED"],
  VERIFIED: ["IN PROGRESS", "REJECTED", "DUPLICATE_MERGED", "RESOLVED"],
  "IN PROGRESS": ["RESOLVED", "REJECTED", "DUPLICATE_MERGED"],
  RESOLVED: [],
  REJECTED: [],
  DUPLICATE_MERGED: [],
};
