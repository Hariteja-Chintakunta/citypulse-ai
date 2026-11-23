/** Demo data — the same 23 labelled demo complaints as database/seed.sql.
 * Clearly labelled demo data; not real complaints. */

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
  { id: "c0000001-0000-0000-0000-000000000001", ticket_no: "CP-2026-0001", category: "Pothole", description: "Deep pothole near the junction, cars are swerving into the next lane. (Demo data)", status: "SUBMITTED", severity: "High", ward: "Jubilee Hills", address: "Road No. 36, Jubilee Hills", latitude: 17.4326, longitude: 78.4071, is_demo: true, created_at: "2026-11-20T09:12:00+05:30" },
  { id: "c0000002-0000-0000-0000-000000000002", ticket_no: "CP-2026-0002", category: "Garbage", description: "Garbage bin overflowing for three days near the park gate. (Demo data)", status: "UNDER REVIEW", severity: "Medium", ward: "Banjara Hills", address: "Road No. 12, Banjara Hills", latitude: 17.4126, longitude: 78.4356, is_demo: true, created_at: "2026-11-20T10:40:00+05:30" },
  { id: "c0000003-0000-0000-0000-000000000003", ticket_no: "CP-2026-0003", category: "Streetlight", description: "Streetlight not working for a week, the lane is dark at night. (Demo data)", status: "VERIFIED", severity: "Medium", ward: "Begumpet", address: "Begumpet Main Road", latitude: 17.4415, longitude: 78.4585, is_demo: true, created_at: "2026-11-19T18:25:00+05:30" },
  { id: "c0000004-0000-0000-0000-000000000004", ticket_no: "CP-2026-0004", category: "Waterlogging", description: "Waterlogging after rain, knee-deep water near the underpass. (Demo data)", status: "IN PROGRESS", severity: "High", ward: "Secunderabad", address: "MG Road, Secunderabad", latitude: 17.4399, longitude: 78.4983, is_demo: true, created_at: "2026-11-19T08:05:00+05:30" },
  { id: "c0000005-0000-0000-0000-000000000005", ticket_no: "CP-2026-0005", category: "Traffic Congestion", description: "Heavy congestion every evening near the metro station exit. (Demo data)", status: "RESOLVED", severity: "Medium", ward: "Kukatpally", address: "Kukatpally Metro Station", latitude: 17.4849, longitude: 78.4138, is_demo: true, created_at: "2026-11-18T17:50:00+05:30" },
  { id: "c0000006-0000-0000-0000-000000000006", ticket_no: "CP-2026-0006", category: "Pothole", description: "Pothole in the middle of the road near the bus stop. (Demo data)", status: "SUBMITTED", severity: "Medium", ward: "LB Nagar", address: "LB Nagar Main Road", latitude: 17.3456, longitude: 78.5523, is_demo: true, created_at: "2026-11-21T11:30:00+05:30" },
  { id: "c0000007-0000-0000-0000-000000000007", ticket_no: "CP-2026-0007", category: "Footpath", description: "Broken footpath slabs, difficult for elderly pedestrians. (Demo data)", status: "UNDER REVIEW", severity: "Low", ward: "Uppal", address: "Uppal Main Road", latitude: 17.406, longitude: 78.5585, is_demo: true, created_at: "2026-11-21T09:00:00+05:30" },
  { id: "c0000008-0000-0000-0000-000000000008", ticket_no: "CP-2026-0008", category: "Drainage", description: "Blocked drain, stagnant water and bad smell near the market. (Demo data)", status: "VERIFIED", severity: "High", ward: "Malakpet", address: "Malakpet Market Road", latitude: 17.3777, longitude: 78.4848, is_demo: true, created_at: "2026-11-20T14:15:00+05:30" },
  { id: "c0000009-0000-0000-0000-000000000009", ticket_no: "CP-2026-0009", category: "Garbage", description: "Garbage dumped on the roadside near the old city gate. (Demo data)", status: "IN PROGRESS", severity: "Medium", ward: "Charminar", address: "Near Charminar", latitude: 17.3616, longitude: 78.4747, is_demo: true, created_at: "2026-11-19T12:45:00+05:30" },
  { id: "c0000010-0000-0000-0000-000000000010", ticket_no: "CP-2026-0010", category: "Streetlight", description: "Two streetlights flickering on the Golconda road stretch. (Demo data)", status: "RESOLVED", severity: "Low", ward: "Golconda", address: "Golconda Road", latitude: 17.3833, longitude: 78.4011, is_demo: true, created_at: "2026-11-18T20:10:00+05:30" },
  { id: "c0000011-0000-0000-0000-000000000011", ticket_no: "CP-2026-0011", category: "Pothole", description: "Same pothole as CP-2026-0001 reported again from the other side. (Demo data)", status: "DUPLICATE_MERGED", severity: "High", ward: "Jubilee Hills", address: "Road No. 36, Jubilee Hills", latitude: 17.4329, longitude: 78.4074, is_demo: true, created_at: "2026-11-21T08:20:00+05:30" },
  { id: "c0000012-0000-0000-0000-000000000012", ticket_no: "CP-2026-0012", category: "Waterlogging", description: "Rain water collecting near the school entrance every monsoon shower. (Demo data)", status: "SUBMITTED", severity: "Medium", ward: "Banjara Hills", address: "Road No. 4, Banjara Hills", latitude: 17.415, longitude: 78.438, is_demo: true, created_at: "2026-11-22T07:55:00+05:30" },
  { id: "c0000013-0000-0000-0000-000000000013", ticket_no: "CP-2026-0013", category: "Traffic Congestion", description: "Signal timing too short, long queues at the Begumpet junction. (Demo data)", status: "VERIFIED", severity: "Medium", ward: "Begumpet", address: "Begumpet Junction", latitude: 17.443, longitude: 78.46, is_demo: true, created_at: "2026-11-20T16:40:00+05:30" },
  { id: "c0000014-0000-0000-0000-000000000014", ticket_no: "CP-2026-0014", category: "Garbage", description: "Photo shows a private bin inside a shop, not a civic issue. (Demo data)", status: "REJECTED", severity: "Low", ward: "Secunderabad", address: "Clock Tower, Secunderabad", latitude: 17.441, longitude: 78.5, is_demo: true, created_at: "2026-11-21T13:05:00+05:30" },
  { id: "c0000015-0000-0000-0000-000000000015", ticket_no: "CP-2026-0015", category: "Pothole", description: "Cracked road surface forming a pothole near the Kukatpally flyover. (Demo data)", status: "IN PROGRESS", severity: "High", ward: "Kukatpally", address: "Kukatpally Flyover", latitude: 17.486, longitude: 78.415, is_demo: true, created_at: "2026-11-20T09:45:00+05:30" },
  { id: "c0000016-0000-0000-0000-000000000016", ticket_no: "CP-2026-0016", category: "Chemical Factory Pollution", description: "Strong chemical smell reported in the evenings, allegedly from nearby pharma and chemical units; residents report headaches and eye irritation. (Demo data — resident-reported, not verified)", status: "UNDER REVIEW", severity: "High", ward: "Bachupally", address: "Bachupally Main Road, Bachupally", latitude: 17.5127, longitude: 78.3617, is_demo: true, created_at: "2026-11-23T09:30:00+05:30" },
  { id: "c0000017-0000-0000-0000-000000000017", ticket_no: "CP-2026-0017", category: "Traffic Police Challan", description: "Challans being issued on this stretch every evening; citizens report fines for minor stops with no clear signage. (Demo data)", status: "SUBMITTED", severity: "Medium", ward: "Jubilee Hills", address: "Road No. 36, Jubilee Hills", latitude: 17.4326, longitude: 78.4071, is_demo: true, created_at: "2026-11-23T18:20:00+05:30" },
  { id: "c0000018-0000-0000-0000-000000000018", ticket_no: "CP-2026-0018", category: "Wrong-Way Driving", description: "Vehicles driving the wrong way near the metro pillar, cutting across the divider gap every evening. (Demo data)", status: "VERIFIED", severity: "High", ward: "LB Nagar", address: "LB Nagar metro pillar 42", latitude: 17.3457, longitude: 78.5522, is_demo: true, created_at: "2026-11-22T20:10:00+05:30" },
  { id: "c0000019-0000-0000-0000-000000000019", ticket_no: "CP-2026-0019", category: "Political Complaint", description: "Political banner blocking the footpath and the junction view for two weeks. (Demo data)", status: "UNDER REVIEW", severity: "Medium", ward: "Begumpet", address: "Begumpet Main Road", latitude: 17.4415, longitude: 78.4585, is_demo: true, created_at: "2026-11-22T11:05:00+05:30" },
  { id: "c0000020-0000-0000-0000-000000000020", ticket_no: "CP-2026-0020", category: "Drainage Overflow", description: "Drain overflowing onto the road after rain, dirty water across the carriageway near the market. (Demo data)", status: "IN PROGRESS", severity: "High", ward: "Malakpet", address: "Malakpet Market Road", latitude: 17.3777, longitude: 78.4848, is_demo: true, created_at: "2026-11-21T15:40:00+05:30" },
  { id: "c0000021-0000-0000-0000-000000000021", ticket_no: "CP-2026-0021", category: "Rainwater Harvesting", description: "Apartment block requests a rainwater harvesting pit — rooftop runoff currently flows straight to the storm drain. (Demo data)", status: "SUBMITTED", severity: "Medium", ward: "Kukatpally", address: "Kukatpally Housing Colony", latitude: 17.4849, longitude: 78.4138, is_demo: true, created_at: "2026-11-23T10:15:00+05:30" },
  { id: "c0000022-0000-0000-0000-000000000022", ticket_no: "CP-2026-0022", category: "Water Conservation", description: "Residents ask for guidance on saving water — tanker use is high and borewell levels are falling in the colony. (Demo data)", status: "VERIFIED", severity: "Low", ward: "Banjara Hills", address: "Road No. 12, Banjara Hills", latitude: 17.4126, longitude: 78.4356, is_demo: true, created_at: "2026-11-22T09:50:00+05:30" },
  { id: "c0000023-0000-0000-0000-000000000023", ticket_no: "CP-2026-0023", category: "Waterlogging", description: "Waterlogging at the underpass after heavy rain, two-wheelers stalling in knee-deep water. (Demo data)", status: "RESOLVED", severity: "Medium", ward: "Secunderabad", address: "MG Road underpass, Secunderabad", latitude: 17.4399, longitude: 78.4983, is_demo: true, created_at: "2026-11-20T08:05:00+05:30" },
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
