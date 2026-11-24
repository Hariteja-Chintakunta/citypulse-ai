/** Demo data removed 2026-11-24: the app now shows only live data.
 * The seeded demo complaints were deleted from the live database and
  * removed from this file. DEMO_ALERTS below is static alert content,
   * not complaint data. */

import type { AlertItem, Complaint, LeaderboardEntry } from "./types";

export const WARDS = [
  "Jubilee Hills", "Banjara Hills", "Begumpet", "Secunderabad",
  "Kukatpally", "LB Nagar", "Uppal", "Malakpet", "Charminar", "Golconda",
  // Bachupally: added for the resident-reported chemical-factory pollution issue.
  "Bachupally",
];

export const CATEGORIES = [
  // Grouped in the report form: roads & traffic, water & drainage,
  // environment & community.
  "Pothole", "Garbage", "Streetlight", "Waterlogging",
  "Traffic Congestion", "Footpath", "Drainage", "Other",
  "Traffic Police Challan", "Wrong-Way Driving", "Chemical Factory Pollution",
  "Political Complaint", "Drainage Overflow", "Rainwater Harvesting",
  "Water Conservation",
] as const;

export const WARD_COORDS: Record<string, [number, number]> = {
  "Jubilee Hills": [17.4326, 78.4071],
  "Banjara Hills": [17.4126, 78.4356],
  Begumpet: [17.4415, 78.4585],
  Secunderabad: [17.4399, 78.4983],
  Kukatpally: [17.4849, 78.4138],
  "LB Nagar": [17.3456, 78.5523],
  Uppal: [17.406, 78.5585],
  Malakpet: [17.3777, 78.4848],
  Charminar: [17.3616, 78.4747],
  Golconda: [17.3833, 78.4011],
  Bachupally: [17.5127, 78.3617],
};

export const DEMO_COMPLAINTS: Complaint[] = [
  // Demo reports removed 2026-11-24: the app now shows only live data.
  // The 23 seeded demo tickets (CP-2026-0001 to CP-2026-0023) were deleted
  // from the live database and removed here, so no demo report appears
  // anywhere in the app.
  ];

export const DEMO_ALERTS: AlertItem[] = [
  { id: "a1", kind: "rain", title: "Waterlogging alert — Secunderabad", detail: "Heavy rain reported near MG Road underpass. Avoid the stretch if possible. (Demo data)", ward: "Secunderabad", created_at: "2026-11-22T08:00:00+05:30" },
  { id: "a2", kind: "rain", title: "Waterlogging alert — Banjara Hills", detail: "Water collecting near Road No. 4 school entrance. (Demo data)", ward: "Banjara Hills", created_at: "2026-11-22T07:55:00+05:30" },
  { id: "a3", kind: "traffic", title: "Congestion — Kukatpally Metro", detail: "Slow-moving traffic reported near the metro station exit. (Demo data)", ward: "Kukatpally", created_at: "2026-11-21T18:10:00+05:30" },
  { id: "a4", kind: "traffic", title: "Congestion — Begumpet Junction", detail: "Long queues reported at the junction signal. (Demo data)", ward: "Begumpet", created_at: "2026-11-21T17:30:00+05:30" },
];

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { name: "Priya Sharma (Demo)", points: 170 },
  { name: "Kiran Kumar (Demo)", points: 150 },
  { name: "Meera Nair (Demo)", points: 150 },
  { name: "Arjun Reddy (Demo)", points: 100 },
  { name: "Ananya Rao (Demo)", points: 100 },
];
