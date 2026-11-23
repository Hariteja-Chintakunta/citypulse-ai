-- ============================================================================
-- CityPulse AI — demo seed data
-- *** DEMO DATA — clearly labelled. Not real complaints. ***
-- Same 23 demo complaints shown in the working demo prototype, across the
-- 10 Hyderabad wards plus Bachupally and every workflow state. Ticket numbers
-- CP-2026-0001 to CP-2026-0023. Passwords below are bcrypt hashes of "demo1234" (demo only).
-- Run after schema.sql:  psql "$DATABASE_URL" -f database/seed.sql
-- ============================================================================

BEGIN;

-- --- Demo users -------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin (Demo)', 'admin@citypulse.demo', '$2b$12$E7BgNg4SE13vI1hi9Zz2GujjwT2qHz5/I1TYgazewMSoDoQI13d0C', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Priya Sharma (Demo)', 'priya@citypulse.demo', '$2b$12$E7BgNg4SE13vI1hi9Zz2GujjwT2qHz5/I1TYgazewMSoDoQI13d0C', 'citizen'),
  ('33333333-3333-3333-3333-333333333333', 'Arjun Reddy (Demo)', 'arjun@citypulse.demo', '$2b$12$E7BgNg4SE13vI1hi9Zz2GujjwT2qHz5/I1TYgazewMSoDoQI13d0C', 'citizen'),
  ('44444444-4444-4444-4444-444444444444', 'Meera Nair (Demo)', 'meera@citypulse.demo', '$2b$12$E7BgNg4SE13vI1hi9Zz2GujjwT2qHz5/I1TYgazewMSoDoQI13d0C', 'citizen'),
  ('55555555-5555-5555-5555-555555555555', 'Kiran Kumar (Demo)', 'kiran@citypulse.demo', '$2b$12$E7BgNg4SE13vI1hi9Zz2GujjwT2qHz5/I1TYgazewMSoDoQI13d0C', 'citizen'),
  ('66666666-6666-6666-6666-666666666666', 'Ananya Rao (Demo)', 'ananya@citypulse.demo', '$2b$12$E7BgNg4SE13vI1hi9Zz2GujjwT2qHz5/I1TYgazewMSoDoQI13d0C', 'citizen')
ON CONFLICT (email) DO NOTHING;

-- --- Demo complaints (23) ---------------------------------------------------
-- ward coordinates are approximate ward centres in Hyderabad.
INSERT INTO complaints (id, ticket_no, user_id, category, description, status, severity, ward, address, is_demo, created_at) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'CP-2026-0001', '22222222-2222-2222-2222-222222222222', 'Pothole', 'Deep pothole near the junction, cars are swerving into the next lane. (Demo data)', 'SUBMITTED', 'High', 'Jubilee Hills', 'Road No. 36, Jubilee Hills', TRUE, '2026-11-20 09:12:00+05:30'),
  ('c0000002-0000-0000-0000-000000000002', 'CP-2026-0002', '33333333-3333-3333-3333-333333333333', 'Garbage', 'Garbage bin overflowing for three days near the park gate. (Demo data)', 'UNDER REVIEW', 'Medium', 'Banjara Hills', 'Road No. 12, Banjara Hills', TRUE, '2026-11-20 10:40:00+05:30'),
  ('c0000003-0000-0000-0000-000000000003', 'CP-2026-0003', '44444444-4444-4444-4444-444444444444', 'Streetlight', 'Streetlight not working for a week, the lane is dark at night. (Demo data)', 'VERIFIED', 'Medium', 'Begumpet', 'Begumpet Main Road', TRUE, '2026-11-19 18:25:00+05:30'),
  ('c0000004-0000-0000-0000-000000000004', 'CP-2026-0004', '55555555-5555-5555-5555-555555555555', 'Waterlogging', 'Waterlogging after rain, knee-deep water near the underpass. (Demo data)', 'IN PROGRESS', 'High', 'Secunderabad', 'MG Road, Secunderabad', TRUE, '2026-11-19 08:05:00+05:30'),
  ('c0000005-0000-0000-0000-000000000005', 'CP-2026-0005', '66666666-6666-6666-6666-666666666666', 'Traffic Congestion', 'Heavy congestion every evening near the metro station exit. (Demo data)', 'RESOLVED', 'Medium', 'Kukatpally', 'Kukatpally Metro Station', TRUE, '2026-11-18 17:50:00+05:30'),
  ('c0000006-0000-0000-0000-000000000006', 'CP-2026-0006', '22222222-2222-2222-2222-222222222222', 'Pothole', 'Pothole in the middle of the road near the bus stop. (Demo data)', 'SUBMITTED', 'Medium', 'LB Nagar', 'LB Nagar Main Road', TRUE, '2026-11-21 11:30:00+05:30'),
  ('c0000007-0000-0000-0000-000000000007', 'CP-2026-0007', '33333333-3333-3333-3333-333333333333', 'Footpath', 'Broken footpath slabs, difficult for elderly pedestrians. (Demo data)', 'UNDER REVIEW', 'Low', 'Uppal', 'Uppal Main Road', TRUE, '2026-11-21 09:00:00+05:30'),
  ('c0000008-0000-0000-0000-000000000008', 'CP-2026-0008', '44444444-4444-4444-4444-444444444444', 'Drainage', 'Blocked drain, stagnant water and bad smell near the market. (Demo data)', 'VERIFIED', 'High', 'Malakpet', 'Malakpet Market Road', TRUE, '2026-11-20 14:15:00+05:30'),
  ('c0000009-0000-0000-0000-000000000009', 'CP-2026-0009', '55555555-5555-5555-5555-555555555555', 'Garbage', 'Garbage dumped on the roadside near the old city gate. (Demo data)', 'IN PROGRESS', 'Medium', 'Charminar', 'Near Charminar', TRUE, '2026-11-19 12:45:00+05:30'),
  ('c0000010-0000-0000-0000-000000000010', 'CP-2026-0010', '66666666-6666-6666-6666-666666666666', 'Streetlight', 'Two streetlights flickering on the Golconda road stretch. (Demo data)', 'RESOLVED', 'Low', 'Golconda', 'Golconda Road', TRUE, '2026-11-18 20:10:00+05:30'),
  ('c0000011-0000-0000-0000-000000000011', 'CP-2026-0011', '33333333-3333-3333-3333-333333333333', 'Pothole', 'Same pothole as CP-2026-0001 reported again from the other side. (Demo data)', 'DUPLICATE_MERGED', 'High', 'Jubilee Hills', 'Road No. 36, Jubilee Hills', TRUE, '2026-11-21 08:20:00+05:30'),
  ('c0000012-0000-0000-0000-000000000012', 'CP-2026-0012', '44444444-4444-4444-4444-444444444444', 'Waterlogging', 'Rain water collecting near the school entrance every monsoon shower. (Demo data)', 'SUBMITTED', 'Medium', 'Banjara Hills', 'Road No. 4, Banjara Hills', TRUE, '2026-11-22 07:55:00+05:30'),
  ('c0000013-0000-0000-0000-000000000013', 'CP-2026-0013', '55555555-5555-5555-5555-555555555555', 'Traffic Congestion', 'Signal timing too short, long queues at the Begumpet junction. (Demo data)', 'VERIFIED', 'Medium', 'Begumpet', 'Begumpet Junction', TRUE, '2026-11-20 16:40:00+05:30'),
  ('c0000014-0000-0000-0000-000000000014', 'CP-2026-0014', '66666666-6666-6666-6666-666666666666', 'Garbage', 'Photo shows a private bin inside a shop, not a civic issue. (Demo data)', 'REJECTED', 'Low', 'Secunderabad', 'Clock Tower, Secunderabad', TRUE, '2026-11-21 13:05:00+05:30'),
  ('c0000015-0000-0000-0000-000000000015', 'CP-2026-0015', '22222222-2222-2222-2222-222222222222', 'Pothole', 'Cracked road surface forming a pothole near the Kukatpally flyover. (Demo data)', 'IN PROGRESS', 'High', 'Kukatpally', 'Kukatpally Flyover', TRUE, '2026-11-20 09:45:00+05:30'),
  ('c0000016-0000-0000-0000-000000000016', 'CP-2026-0016', '22222222-2222-2222-2222-222222222222', 'Chemical Factory Pollution', 'Strong chemical smell reported in the evenings, allegedly from nearby pharma and chemical units; residents report headaches and eye irritation. (Demo data — resident-reported, not verified)', 'UNDER REVIEW', 'High', 'Bachupally', 'Bachupally Main Road, Bachupally', TRUE, '2026-11-23 09:30:00+05:30'),
  ('c0000017-0000-0000-0000-000000000017', 'CP-2026-0017', '33333333-3333-3333-3333-333333333333', 'Traffic Police Challan', 'Challans being issued on this stretch every evening; citizens report fines for minor stops with no clear signage. (Demo data)', 'SUBMITTED', 'Medium', 'Jubilee Hills', 'Road No. 36, Jubilee Hills', TRUE, '2026-11-23 18:20:00+05:30'),
  ('c0000018-0000-0000-0000-000000000018', 'CP-2026-0018', '44444444-4444-4444-4444-444444444444', 'Wrong-Way Driving', 'Vehicles driving the wrong way near the metro pillar, cutting across the divider gap every evening. (Demo data)', 'VERIFIED', 'High', 'LB Nagar', 'LB Nagar metro pillar 42', TRUE, '2026-11-22 20:10:00+05:30'),
  ('c0000019-0000-0000-0000-000000000019', 'CP-2026-0019', '55555555-5555-5555-5555-555555555555', 'Political Complaint', 'Political banner blocking the footpath and the junction view for two weeks. (Demo data)', 'UNDER REVIEW', 'Medium', 'Begumpet', 'Begumpet Main Road', TRUE, '2026-11-22 11:05:00+05:30'),
  ('c0000020-0000-0000-0000-000000000020', 'CP-2026-0020', '66666666-6666-6666-6666-666666666666', 'Drainage Overflow', 'Drain overflowing onto the road after rain, dirty water across the carriageway near the market. (Demo data)', 'IN PROGRESS', 'High', 'Malakpet', 'Malakpet Market Road', TRUE, '2026-11-21 15:40:00+05:30'),
  ('c0000021-0000-0000-0000-000000000021', 'CP-2026-0021', '22222222-2222-2222-2222-222222222222', 'Rainwater Harvesting', 'Apartment block requests a rainwater harvesting pit — rooftop runoff currently flows straight to the storm drain. (Demo data)', 'SUBMITTED', 'Medium', 'Kukatpally', 'Kukatpally Housing Colony', TRUE, '2026-11-23 10:15:00+05:30'),
  ('c0000022-0000-0000-0000-000000000022', 'CP-2026-0022', '33333333-3333-3333-3333-333333333333', 'Water Conservation', 'Residents ask for guidance on saving water — tanker use is high and borewell levels are falling in the colony. (Demo data)', 'VERIFIED', 'Low', 'Banjara Hills', 'Road No. 12, Banjara Hills', TRUE, '2026-11-22 09:50:00+05:30'),
  ('c0000023-0000-0000-0000-000000000023', 'CP-2026-0023', '44444444-4444-4444-4444-444444444444', 'Waterlogging', 'Waterlogging at the underpass after heavy rain, two-wheelers stalling in knee-deep water. (Demo data)', 'RESOLVED', 'Medium', 'Secunderabad', 'MG Road underpass, Secunderabad', TRUE, '2026-11-20 08:05:00+05:30')
ON CONFLICT (ticket_no) DO NOTHING;

-- --- Locations (approximate ward centres) -----------------------------------
INSERT INTO locations (complaint_id, latitude, longitude, address) VALUES
  ('c0000001-0000-0000-0000-000000000001', 17.4326, 78.4071, 'Road No. 36, Jubilee Hills'),
  ('c0000002-0000-0000-0000-000000000002', 17.4126, 78.4356, 'Road No. 12, Banjara Hills'),
  ('c0000003-0000-0000-0000-000000000003', 17.4415, 78.4585, 'Begumpet Main Road'),
  ('c0000004-0000-0000-0000-000000000004', 17.4399, 78.4983, 'MG Road, Secunderabad'),
  ('c0000005-0000-0000-0000-000000000005', 17.4849, 78.4138, 'Kukatpally Metro Station'),
  ('c0000006-0000-0000-0000-000000000006', 17.3456, 78.5523, 'LB Nagar Main Road'),
  ('c0000007-0000-0000-0000-000000000007', 17.4060, 78.5585, 'Uppal Main Road'),
  ('c0000008-0000-0000-0000-000000000008', 17.3777, 78.4848, 'Malakpet Market Road'),
  ('c0000009-0000-0000-0000-000000000009', 17.3616, 78.4747, 'Near Charminar'),
  ('c0000010-0000-0000-0000-000000000010', 17.3833, 78.4011, 'Golconda Road'),
  ('c0000011-0000-0000-0000-000000000011', 17.4329, 78.4074, 'Road No. 36, Jubilee Hills'),
  ('c0000012-0000-0000-0000-000000000012', 17.4150, 78.4380, 'Road No. 4, Banjara Hills'),
  ('c0000013-0000-0000-0000-000000000013', 17.4430, 78.4600, 'Begumpet Junction'),
  ('c0000014-0000-0000-0000-000000000014', 17.4410, 78.5000, 'Clock Tower, Secunderabad'),
  ('c0000015-0000-0000-0000-000000000015', 17.4860, 78.4150, 'Kukatpally Flyover'),
  ('c0000016-0000-0000-0000-000000000016', 17.5127, 78.3617, 'Bachupally Main Road, Bachupally'),
  ('c0000017-0000-0000-0000-000000000017', 17.4326, 78.4071, 'Road No. 36, Jubilee Hills'),
  ('c0000018-0000-0000-0000-000000000018', 17.3457, 78.5522, 'LB Nagar metro pillar 42'),
  ('c0000019-0000-0000-0000-000000000019', 17.4415, 78.4585, 'Begumpet Main Road'),
  ('c0000020-0000-0000-0000-000000000020', 17.3777, 78.4848, 'Malakpet Market Road'),
  ('c0000021-0000-0000-0000-000000000021', 17.4849, 78.4138, 'Kukatpally Housing Colony'),
  ('c0000022-0000-0000-0000-000000000022', 17.4126, 78.4356, 'Road No. 12, Banjara Hills'),
  ('c0000023-0000-0000-0000-000000000023', 17.4399, 78.4983, 'MG Road underpass, Secunderabad');

-- --- Media references (Supabase Storage keys; demo placeholders) ------------
INSERT INTO complaint_media (complaint_id, storage_path, mime_type, file_size) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'demo/CP-2026-0001.jpg', 'image/jpeg', 184320),
  ('c0000002-0000-0000-0000-000000000002', 'demo/CP-2026-0002.jpg', 'image/jpeg', 152000),
  ('c0000003-0000-0000-0000-000000000003', 'demo/CP-2026-0003.jpg', 'image/jpeg', 98000),
  ('c0000004-0000-0000-0000-000000000004', 'demo/CP-2026-0004.jpg', 'image/jpeg', 210500),
  ('c0000006-0000-0000-0000-000000000006', 'demo/CP-2026-0006.jpg', 'image/jpeg', 123400),
  ('c0000012-0000-0000-0000-000000000012', 'demo/CP-2026-0012.jpg', 'image/jpeg', 176800);

-- --- AI analysis (suggestions only; low confidence -> human review) ---------
INSERT INTO ai_analysis (complaint_id, model, predicted_category, confidence, suggested_severity, visible_evidence, needs_human_review, human_verified) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'citypulse-vision-mock-v1', 'Pothole', 0.92, 'High', 'Dark cavity in road surface with broken edges', FALSE, TRUE),
  ('c0000002-0000-0000-0000-000000000002', 'citypulse-vision-mock-v1', 'Garbage', 0.58, 'Medium', 'Overflowing bin, waste spilling onto pavement', TRUE, FALSE),
  ('c0000003-0000-0000-0000-000000000003', 'citypulse-vision-mock-v1', 'Streetlight', 0.88, 'Medium', 'Lamp post visible, no light emitted at dusk', FALSE, TRUE),
  ('c0000004-0000-0000-0000-000000000004', 'citypulse-vision-mock-v1', 'Waterlogging', 0.95, 'High', 'Standing water covering road markings', FALSE, TRUE),
  ('c0000005-0000-0000-0000-000000000005', 'citypulse-vision-mock-v1', 'Traffic Congestion', 0.81, 'Medium', 'Long queue of vehicles at junction', FALSE, TRUE),
  ('c0000006-0000-0000-0000-000000000006', 'citypulse-vision-mock-v1', 'Pothole', 0.77, 'Medium', 'Circular depression in asphalt', FALSE, FALSE),
  ('c0000012-0000-0000-0000-000000000012', 'citypulse-vision-mock-v1', 'Waterlogging', 0.69, 'Medium', 'Water pooling near kerb', TRUE, FALSE),
  ('c0000016-0000-0000-0000-000000000016', 'citypulse-vision-mock-v1', 'Chemical Factory Pollution', 0.64, 'High', 'Faint haze visible near the industrial estate boundary; odour cannot be verified from the photo', TRUE, FALSE),
  ('c0000017-0000-0000-0000-000000000017', 'citypulse-vision-mock-v1', 'Traffic Police Challan', 0.68, 'Medium', 'Challan notice visible in the photo; road signage not visible in frame', TRUE, FALSE),
  ('c0000018-0000-0000-0000-000000000018', 'citypulse-vision-mock-v1', 'Wrong-Way Driving', 0.81, 'High', 'Vehicles facing opposing traffic flow in the photo', FALSE, TRUE),
  ('c0000021-0000-0000-0000-000000000021', 'citypulse-vision-mock-v1', 'Rainwater Harvesting', 0.74, 'Medium', 'Rooftop downpipe discharging onto the road; no recharge pit visible', FALSE, TRUE);

-- --- Duplicate matches ------------------------------------------------------
INSERT INTO duplicate_matches (complaint_id, matched_id, distance_m, similarity, decision) VALUES
  ('c0000011-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000001', 42.5, 0.93, 'duplicate'),
  ('c0000006-0000-0000-0000-000000000006', 'c0000015-0000-0000-0000-000000000015', 8200.0, 0.61, 'separate');

-- --- Status history (append-only) -------------------------------------------
INSERT INTO status_history (complaint_id, old_status, new_status, updated_by, remarks, reason) VALUES
  ('c0000001-0000-0000-0000-000000000001', NULL, 'SUBMITTED', '22222222-2222-2222-2222-222222222222', 'Report created by citizen. (Demo data)', NULL),
  ('c0000002-0000-0000-0000-000000000002', NULL, 'SUBMITTED', '33333333-3333-3333-3333-333333333333', 'Report created by citizen. (Demo data)', NULL),
  ('c0000002-0000-0000-0000-000000000002', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'AI confidence 58% — sent to human review. (Demo data)', NULL),
  ('c0000003-0000-0000-0000-000000000003', NULL, 'SUBMITTED', '44444444-4444-4444-4444-444444444444', 'Report created by citizen. (Demo data)', NULL),
  ('c0000003-0000-0000-0000-000000000003', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Photo and location checked. (Demo data)', NULL),
  ('c0000003-0000-0000-0000-000000000003', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Issue confirmed as genuine. (Demo data)', NULL),
  ('c0000004-0000-0000-0000-000000000004', NULL, 'SUBMITTED', '55555555-5555-5555-5555-555555555555', 'Report created by citizen. (Demo data)', NULL),
  ('c0000004-0000-0000-0000-000000000004', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000004-0000-0000-0000-000000000004', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Verified with photo evidence. (Demo data)', NULL),
  ('c0000004-0000-0000-0000-000000000004', 'VERIFIED', 'IN PROGRESS', '11111111-1111-1111-1111-111111111111', 'Drainage team assigned. (Demo data)', NULL),
  ('c0000005-0000-0000-0000-000000000005', NULL, 'SUBMITTED', '66666666-6666-6666-6666-666666666666', 'Report created by citizen. (Demo data)', NULL),
  ('c0000005-0000-0000-0000-000000000005', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000005-0000-0000-0000-000000000005', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Verified. (Demo data)', NULL),
  ('c0000005-0000-0000-0000-000000000005', 'VERIFIED', 'IN PROGRESS', '11111111-1111-1111-1111-111111111111', 'Traffic team assigned. (Demo data)', NULL),
  ('c0000005-0000-0000-0000-000000000005', 'IN PROGRESS', 'RESOLVED', '11111111-1111-1111-1111-111111111111', 'Signal timing adjusted. (Demo data)', NULL),
  ('c0000010-0000-0000-0000-000000000010', NULL, 'SUBMITTED', '66666666-6666-6666-6666-666666666666', 'Report created by citizen. (Demo data)', NULL),
  ('c0000010-0000-0000-0000-000000000010', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000010-0000-0000-0000-000000000010', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Verified. (Demo data)', NULL),
  ('c0000010-0000-0000-0000-000000000010', 'VERIFIED', 'IN PROGRESS', '11111111-1111-1111-1111-111111111111', 'Maintenance team assigned. (Demo data)', NULL),
  ('c0000010-0000-0000-0000-000000000010', 'IN PROGRESS', 'RESOLVED', '11111111-1111-1111-1111-111111111111', 'Lights replaced. (Demo data)', NULL),
  ('c0000011-0000-0000-0000-000000000011', NULL, 'SUBMITTED', '33333333-3333-3333-3333-333333333333', 'Report created by citizen. (Demo data)', NULL),
  ('c0000011-0000-0000-0000-000000000011', 'SUBMITTED', 'DUPLICATE_MERGED', '11111111-1111-1111-1111-111111111111', 'Merged into CP-2026-0001. (Demo data)', 'Same pothole, 42 m away, reported within 1 day'),
  ('c0000014-0000-0000-0000-000000000014', NULL, 'SUBMITTED', '66666666-6666-6666-6666-666666666666', 'Report created by citizen. (Demo data)', NULL),
  ('c0000014-0000-0000-0000-000000000014', 'SUBMITTED', 'REJECTED', '11111111-1111-1111-1111-111111111111', 'Not a civic issue. (Demo data)', 'Photo shows a private bin, not a public civic issue'),
  ('c0000016-0000-0000-0000-000000000016', NULL, 'SUBMITTED', '22222222-2222-2222-2222-222222222222', 'Report created by citizen. (Demo data)', NULL),
  ('c0000016-0000-0000-0000-000000000016', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Sent to human review — odour reports cannot be verified from a photo. (Demo data)', NULL),
  ('c0000017-0000-0000-0000-000000000017', NULL, 'SUBMITTED', '33333333-3333-3333-3333-333333333333', 'Report created by citizen. (Demo data)', NULL),
  ('c0000018-0000-0000-0000-000000000018', NULL, 'SUBMITTED', '44444444-4444-4444-4444-444444444444', 'Report created by citizen. (Demo data)', NULL),
  ('c0000018-0000-0000-0000-000000000018', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000018-0000-0000-0000-000000000018', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Confirmed wrong-way driving at this spot. (Demo data)', NULL),
  ('c0000019-0000-0000-0000-000000000019', NULL, 'SUBMITTED', '55555555-5555-5555-5555-555555555555', 'Report created by citizen. (Demo data)', NULL),
  ('c0000019-0000-0000-0000-000000000019', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000020-0000-0000-0000-000000000020', NULL, 'SUBMITTED', '66666666-6666-6666-6666-666666666666', 'Report created by citizen. (Demo data)', NULL),
  ('c0000020-0000-0000-0000-000000000020', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000020-0000-0000-0000-000000000020', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Confirmed overflowing drain. (Demo data)', NULL),
  ('c0000020-0000-0000-0000-000000000020', 'VERIFIED', 'IN PROGRESS', '11111111-1111-1111-1111-111111111111', 'Drainage crew assigned. (Demo data)', NULL),
  ('c0000021-0000-0000-0000-000000000021', NULL, 'SUBMITTED', '22222222-2222-2222-2222-222222222222', 'Report created by citizen. (Demo data)', NULL),
  ('c0000022-0000-0000-0000-000000000022', NULL, 'SUBMITTED', '33333333-3333-3333-3333-333333333333', 'Report created by citizen. (Demo data)', NULL),
  ('c0000022-0000-0000-0000-000000000022', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000022-0000-0000-0000-000000000022', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Guidance request accepted. (Demo data)', NULL),
  ('c0000023-0000-0000-0000-000000000023', NULL, 'SUBMITTED', '44444444-4444-4444-4444-444444444444', 'Report created by citizen. (Demo data)', NULL),
  ('c0000023-0000-0000-0000-000000000023', 'SUBMITTED', 'UNDER REVIEW', '11111111-1111-1111-1111-111111111111', 'Taken up for review. (Demo data)', NULL),
  ('c0000023-0000-0000-0000-000000000023', 'UNDER REVIEW', 'VERIFIED', '11111111-1111-1111-1111-111111111111', 'Confirmed recurring waterlogging spot. (Demo data)', NULL),
  ('c0000023-0000-0000-0000-000000000023', 'VERIFIED', 'IN PROGRESS', '11111111-1111-1111-1111-111111111111', 'Pump and de-silting scheduled. (Demo data)', NULL),
  ('c0000023-0000-0000-0000-000000000023', 'IN PROGRESS', 'RESOLVED', '11111111-1111-1111-1111-111111111111', 'Underpass drained; water flow restored. (Demo data)', NULL);

-- --- Comments ----------------------------------------------------------------
INSERT INTO issue_comments (complaint_id, user_id, comment) VALUES
  ('c0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'This pothole has been there for two weeks now. (Demo data)'),
  ('c0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Drainage team will visit tomorrow morning. (Demo data)');

-- --- Citizen points (P2 rewards) ---------------------------------------------
INSERT INTO citizen_points (user_id, points, reason) VALUES
  ('22222222-2222-2222-2222-222222222222', 50, 'Report submitted: CP-2026-0001'),
  ('22222222-2222-2222-2222-222222222222', 50, 'Report submitted: CP-2026-0006'),
  ('22222222-2222-2222-2222-222222222222', 50, 'Report submitted: CP-2026-0015'),
  ('33333333-3333-3333-3333-333333333333', 50, 'Report submitted: CP-2026-0002'),
  ('33333333-3333-3333-3333-333333333333', 50, 'Report submitted: CP-2026-0007'),
  ('44444444-4444-4444-4444-444444444444', 50, 'Report submitted: CP-2026-0003'),
  ('44444444-4444-4444-4444-444444444444', 50, 'Report submitted: CP-2026-0008'),
  ('44444444-4444-4444-4444-444444444444', 50, 'Report submitted: CP-2026-0012'),
  ('55555555-5555-5555-5555-555555555555', 50, 'Report submitted: CP-2026-0004'),
  ('55555555-5555-5555-5555-555555555555', 50, 'Report submitted: CP-2026-0009'),
  ('55555555-5555-5555-5555-555555555555', 50, 'Report submitted: CP-2026-0013'),
  ('66666666-6666-6666-6666-666666666666', 50, 'Report submitted: CP-2026-0005'),
  ('66666666-6666-6666-6666-666666666666', 50, 'Report submitted: CP-2026-0010'),
  ('22222222-2222-2222-2222-222222222222', 20, 'Report verified: CP-2026-0001'),
  ('55555555-5555-5555-5555-555555555555', 100, 'Report resolved: CP-2026-0005'),
  ('22222222-2222-2222-2222-222222222222', 50, 'Report submitted: CP-2026-0016'),
  ('33333333-3333-3333-3333-333333333333', 50, 'Report submitted: CP-2026-0017'),
  ('44444444-4444-4444-4444-444444444444', 50, 'Report submitted: CP-2026-0018'),
  ('55555555-5555-5555-5555-555555555555', 50, 'Report submitted: CP-2026-0019'),
  ('66666666-6666-6666-6666-666666666666', 50, 'Report submitted: CP-2026-0020'),
  ('22222222-2222-2222-2222-222222222222', 50, 'Report submitted: CP-2026-0021'),
  ('33333333-3333-3333-3333-333333333333', 50, 'Report submitted: CP-2026-0022'),
  ('44444444-4444-4444-4444-444444444444', 50, 'Report submitted: CP-2026-0023');

-- --- Notifications ------------------------------------------------------------
INSERT INTO notifications (user_id, message) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Your report CP-2026-0001 was received and is under review. (Demo data)'),
  ('33333333-3333-3333-3333-333333333333', 'Your report CP-2026-0002 needs human review — AI confidence was 58%. (Demo data)'),
  ('66666666-6666-6666-6666-666666666666', 'Good news — your report CP-2026-0005 has been resolved. (Demo data)'),
  ('66666666-6666-6666-6666-666666666666', 'Good news — your report CP-2026-0010 has been resolved. (Demo data)'),
  ('22222222-2222-2222-2222-222222222222', 'Your report CP-2026-0016 needs human review — AI confidence was 64%. (Demo data)');

COMMIT;
