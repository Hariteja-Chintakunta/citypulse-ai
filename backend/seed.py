"""Seed the local/dev database with the labelled demo data.

Mirrors database/seed.sql for the same 23 demo complaints, CP-2026-0001..0023,
same reporters, wards, AI confidences and status histories) for the default
SQLite dev database. Run:  python seed.py
Demo accounts: admin@citypulse.demo / demo1234, ayesha@citypulse.demo /
demo1234 (and the other demo citizens).
"""

from datetime import datetime

from app import models
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

DEMO_USERS = [
    ("11111111-1111-1111-1111-111111111111", "Admin (Demo)", "admin@citypulse.demo", "admin"),
    ("22222222-2222-2222-2222-222222222222", "Ayesha Khan (Demo)", "ayesha@citypulse.demo", "citizen"),
    ("33333333-3333-3333-3333-333333333333", "Ravi Teja (Demo)", "ravi@citypulse.demo", "citizen"),
    ("44444444-4444-4444-4444-444444444444", "Sana Fatima (Demo)", "sana@citypulse.demo", "citizen"),
    ("55555555-5555-5555-5555-555555555555", "Imran Shaikh (Demo)", "imran@citypulse.demo", "citizen"),
    ("66666666-6666-6666-6666-666666666666", "Priya Nair (Demo)", "priya@citypulse.demo", "citizen"),
    ("77777777-7777-7777-7777-777777777777", "K. Srinivas (Demo)", "srinivas@citypulse.demo", "citizen"),
    ("88888888-8888-8888-8888-888888888888", "Demo Citizen", "citizen@citypulse.demo", "citizen"),
]

# ticket, user_id, category, description, status, severity, ward, address,
# assigned_team, report_count, lat, lng, created_at
DEMO_COMPLAINTS = [
    ("CP-2026-0001", "22222222-2222-2222-2222-222222222222", "Pothole", "Deep pothole on Road No. 36, near the junction — large pothole in the left lane, dangerous for two-wheelers after dark. (Demo data)", "IN PROGRESS", "High", "Jubilee Hills", "Road No. 36, Jubilee Hills", "Roads Team — Zone 6", 6, 17.4325, 78.4071, "2026-11-21 09:14"),
    ("CP-2026-0002", "33333333-3333-3333-3333-333333333333", "Pothole", "Pothole cluster near KPHB metro station exit — three potholes in a row; autos swerve into the bus lane. (Demo data)", "SUBMITTED", "Medium", "Kukatpally", "KPHB metro station exit, Kukatpally", None, 2, 17.4849, 78.4138, "2026-11-23 08:31"),
    ("CP-2026-0003", "44444444-4444-4444-4444-444444444444", "Garbage", "Overflowing dump point near Laad Bazaar — waste spilling onto the lane for 3 days; stray animals scattering it. (Demo data)", "UNDER REVIEW", "Medium", "Charminar", "Laad Bazaar, Charminar", "Sanitation Team", 4, 17.3616, 78.4747, "2026-11-22 17:40"),
    ("CP-2026-0004", "55555555-5555-5555-5555-555555555555", "Streetlight", "Five streetlights out on the Tank Bund service road stretch — whole stretch dark after 7 PM; unsafe for walkers. (Demo data)", "VERIFIED", "High", "Secunderabad", "Tank Bund service road, Secunderabad", "Electrical / Streetlights", 3, 17.4399, 78.4983, "2026-11-20 19:22"),
    ("CP-2026-0005", "66666666-6666-6666-6666-666666666666", "Waterlogging", "Underpass floods after 20 minutes of rain — water reaches knee height; two-wheelers stall mid-underpass. (Demo data)", "IN PROGRESS", "High", "Begumpet", "Begumpet underpass", "Drainage Crew", 8, 17.4447, 78.4667, "2026-11-19 07:05"),
    ("CP-2026-0006", "77777777-7777-7777-7777-777777777777", "Drainage", "Blocked storm drain outside the school gate — drain choked with plastic; street floods even in light rain. (Demo data)", "SUBMITTED", "Medium", "Malakpet", "School gate, Malakpet", None, 1, 17.3719, 78.5053, "2026-11-23 07:48"),
    ("CP-2026-0007", "22222222-2222-2222-2222-222222222222", "Garbage", "Construction debris dumped on Road No. 12 footpath — debris cleared after admin verification, see history. (Demo data)", "RESOLVED", "Medium", "Banjara Hills", "Road No. 12, Banjara Hills", "Sanitation Team", 2, 17.4156, 78.4347, "2026-11-17 10:12"),
    ("CP-2026-0008", "33333333-3333-3333-3333-333333333333", "Traffic", "Peak-hour gridlock at KPHB junction, daily 6-8 PM — signal cycle too short for metro-station outflow. (Demo data)", "UNDER REVIEW", "Medium", "Kukatpally", "KPHB junction, Kukatpally", "Traffic Cell", 11, 17.4862, 78.4155, "2026-11-21 18:35"),
    ("CP-2026-0009", "44444444-4444-4444-4444-444444444444", "Traffic", "Wrong-side driving near LB Nagar metro pillar 42 — autos cut across the divider gap every evening. (Demo data)", "SUBMITTED", "High", "LB Nagar", "LB Nagar metro pillar 42", None, 3, 17.3457, 78.5522, "2026-11-22 20:10"),
    ("CP-2026-0010", "55555555-5555-5555-5555-555555555555", "Road Damage", "Broken road edge and exposed aggregate, Uppal main road — edge crumbling into the shoulder; buses mount it daily. (Demo data)", "VERIFIED", "Medium", "Uppal", "Uppal main road", "Roads Team — Zone 6", 2, 17.4056, 78.5591, "2026-11-20 08:50"),
    ("CP-2026-0011", "66666666-6666-6666-6666-666666666666", "Safety", "Missing railing on the Golconda approach footpath — open drop beside the footpath near the bus stop. (Demo data)", "IN PROGRESS", "High", "Golconda", "Golconda approach footpath", "Roads Team — Zone 6", 5, 17.3833, 78.4011, "2026-11-18 16:05"),
    ("CP-2026-0012", "77777777-7777-7777-7777-777777777777", "Streetlight", "Colony streetlights repaired, LB Nagar — all 6 lamps on the street replaced with LED units. (Demo data)", "RESOLVED", "Low", "LB Nagar", "LB Nagar colony street", "Electrical / Streetlights", 2, 17.3470, 78.5535, "2026-11-16 19:00"),
    ("CP-2026-0013", "22222222-2222-2222-2222-222222222222", "Waterlogging", "Low-lying lane floods near Malakpet railway bridge — cleared after drain de-silting; recurring spot, kept on watch list. (Demo data)", "RESOLVED", "Medium", "Malakpet", "Malakpet railway bridge", "Drainage Crew", 4, 17.3730, 78.5065, "2026-11-15 08:20"),
    ("CP-2026-0014", "88888888-8888-8888-8888-888888888888", "Pothole", "Reported pothole, private driveway (rejected, demo reason) — photo showed a private driveway inside a gated premises. (Demo data)", "REJECTED", "Low", "Banjara Hills", "Gated premises, Banjara Hills", None, 1, 17.4168, 78.4360, "2026-11-19 12:00"),
    ("CP-2026-0015", "88888888-8888-8888-8888-888888888888", "Garbage", "Same Laad Bazaar dump point, second report — filed from the opposite side of the same dump point. (Demo data)", "DUPLICATE_MERGED", "Medium", "Charminar", "Laad Bazaar, Charminar", "Sanitation Team", 1, 17.3618, 78.4749, "2026-11-22 18:05"),
    ("CP-2026-0016", "22222222-2222-2222-2222-222222222222", "Chemical Factory Pollution", "Strong chemical smell reported in the evenings, allegedly from nearby pharma and chemical units; residents report headaches and eye irritation. (Demo data — resident-reported, not verified)", "UNDER REVIEW", "High", "Bachupally", "Bachupally Main Road, Bachupally", "Environment Cell", 2, 17.5127, 78.3617, "2026-11-23 09:30"),
    ("CP-2026-0017", "33333333-3333-3333-3333-333333333333", "Traffic Police Challan", "Challans being issued on this stretch every evening; citizens report fines for minor stops with no clear signage. (Demo data)", "SUBMITTED", "Medium", "Jubilee Hills", "Road No. 36, Jubilee Hills", "Traffic Cell", 1, 17.4326, 78.4071, "2026-11-23 18:20"),
    ("CP-2026-0018", "44444444-4444-4444-4444-444444444444", "Wrong-Way Driving", "Vehicles driving the wrong way near the metro pillar, cutting across the divider gap every evening. (Demo data)", "VERIFIED", "High", "LB Nagar", "LB Nagar metro pillar 42", "Traffic Cell", 3, 17.3457, 78.5522, "2026-11-22 20:10"),
    ("CP-2026-0019", "55555555-5555-5555-5555-555555555555", "Political Complaint", "Political banner blocking the footpath and the junction view for two weeks. (Demo data)", "UNDER REVIEW", "Medium", "Begumpet", "Begumpet Main Road", None, 1, 17.4415, 78.4585, "2026-11-22 11:05"),
    ("CP-2026-0020", "66666666-6666-6666-6666-666666666666", "Drainage Overflow", "Drain overflowing onto the road after rain, dirty water across the carriageway near the market. (Demo data)", "IN PROGRESS", "High", "Malakpet", "Malakpet Market Road", "Drainage Crew", 3, 17.3777, 78.4848, "2026-11-21 15:40"),
    ("CP-2026-0021", "22222222-2222-2222-2222-222222222222", "Rainwater Harvesting", "Apartment block requests a rainwater harvesting pit — rooftop runoff currently flows straight to the storm drain. (Demo data)", "SUBMITTED", "Medium", "Kukatpally", "Kukatpally Housing Colony", None, 1, 17.4849, 78.4138, "2026-11-23 10:15"),
    ("CP-2026-0022", "33333333-3333-3333-3333-333333333333", "Water Conservation", "Residents ask for guidance on saving water — tanker use is high and borewell levels are falling in the colony. (Demo data)", "VERIFIED", "Low", "Banjara Hills", "Road No. 12, Banjara Hills", None, 1, 17.4126, 78.4356, "2026-11-22 09:50"),
    ("CP-2026-0023", "44444444-4444-4444-4444-444444444444", "Waterlogging", "Waterlogging at the underpass after heavy rain, two-wheelers stalling in knee-deep water. (Demo data)", "RESOLVED", "Medium", "Secunderabad", "MG Road underpass, Secunderabad", "Drainage Crew", 2, 17.4399, 78.4983, "2026-11-20 08:05"),
]

# ticket -> (predicted_category, confidence, severity, evidence, needs_review, correction)
AI_ROWS = {
    "CP-2026-0001": ("Pothole", 0.93, "High", "Large cavity in asphalt visible; cracked edges, loose gravel", False, None),
    "CP-2026-0002": ("Pothole", 0.58, "Medium", "Road damage visible but image partly shadowed; multiple depressions suspected", True, None),
    "CP-2026-0003": ("Garbage", 0.89, "Medium", "Overflowing waste pile on roadside; mixed plastic and organic waste", False, None),
    "CP-2026-0004": ("Streetlight", 0.81, "High", "Lamp posts visible, unlit; extended dark stretch in frame", False, None),
    "CP-2026-0005": ("Waterlogging", 0.90, "High", "Standing water across carriageway; submerged road markings", False, None),
    "CP-2026-0006": ("Drainage", 0.74, "Medium", "Debris blocking drain grate; water pooling at inlet", False, None),
    "CP-2026-0007": ("Garbage", 0.86, "Medium", "Rubble and debris pile on footpath", False, None),
    "CP-2026-0008": ("Traffic", 0.79, "Medium", "Dense stationary vehicles across lanes", False, None),
    "CP-2026-0009": ("Traffic", 0.66, "High", "Vehicles facing opposing flow in frame", True, "Traffic"),
    "CP-2026-0010": ("Road Damage", 0.84, "Medium", "Broken carriageway edge; exposed aggregate layer", False, None),
    "CP-2026-0011": ("Safety", 0.77, "High", "Footpath edge without barrier; drop visible beside walkway", False, None),
    "CP-2026-0012": ("Streetlight", 0.88, "Low", "Unlit lamp posts in frame", False, None),
    "CP-2026-0013": ("Waterlogging", 0.85, "Medium", "Standing water in lane; silt deposits at drain mouth", False, None),
    "CP-2026-0014": ("Pothole", 0.71, "Low", "Surface depression visible", False, None),
    "CP-2026-0015": ("Garbage", 0.87, "Medium", "Overflowing waste pile", False, None),
    "CP-2026-0016": ("Chemical Factory Pollution", 0.64, "High", "Faint haze visible near the industrial estate boundary; odour cannot be verified from the photo", True, None),
    "CP-2026-0017": ("Traffic Police Challan", 0.68, "Medium", "Challan notice visible in the photo; road signage not visible in frame", True, None),
    "CP-2026-0018": ("Wrong-Way Driving", 0.81, "High", "Vehicles facing opposing traffic flow in the photo", False, None),
    "CP-2026-0021": ("Rainwater Harvesting", 0.74, "Medium", "Rooftop downpipe discharging onto the road; no recharge pit visible", False, None),
}

# ticket -> [(new_status, remarks, reason)]
HISTORY_ROWS = {
    "CP-2026-0001": [
        ("UNDER REVIEW", "Photo and location checked. (Demo data)", None),
        ("VERIFIED", "Confirmed on ward inspection list. (Demo data)", None),
        ("IN PROGRESS", "Crew scheduled; cold-mix repair planned this week. (Demo data)", None),
    ],
    "CP-2026-0003": [("UNDER REVIEW", "Routed to sanitation for verification. (Demo data)", None)],
    "CP-2026-0004": [
        ("UNDER REVIEW", "Checked against outage list. (Demo data)", None),
        ("VERIFIED", "Feeder fault suspected; electrician visit booked. (Demo data)", None),
    ],
    "CP-2026-0005": [
        ("UNDER REVIEW", "Cluster matched with 2 nearby drainage reports. (Demo data)", None),
        ("VERIFIED", "Confirmed recurring hotspot. (Demo data)", None),
        ("IN PROGRESS", "De-silting scheduled; pump requested for next rain spell. (Demo data)", None),
    ],
    "CP-2026-0007": [
        ("UNDER REVIEW", "Photo verified. (Demo data)", None),
        ("VERIFIED", "Confirmed public footpath obstruction. (Demo data)", None),
        ("IN PROGRESS", "Tipper booked for clearance. (Demo data)", None),
        ("RESOLVED", "Debris lifted; footpath washed. Reporter confirmed. (Demo data)", None),
    ],
    "CP-2026-0008": [("UNDER REVIEW", "Aggregating citizen reports for this junction. (Demo data)", None)],
    "CP-2026-0010": [
        ("UNDER REVIEW", "Checked. (Demo data)", None),
        ("VERIFIED", "Added to resurfacing list. (Demo data)", None),
    ],
    "CP-2026-0011": [
        ("UNDER REVIEW", "Safety flag raised. (Demo data)", None),
        ("VERIFIED", "Temporary barricade ordered same day. (Demo data)", None),
        ("IN PROGRESS", "Barricade placed; permanent railing fabrication under way. (Demo data)", None),
    ],
    "CP-2026-0012": [
        ("UNDER REVIEW", "Checked. (Demo data)", None),
        ("VERIFIED", "Confirmed outage. (Demo data)", None),
        ("IN PROGRESS", "LED replacement scheduled. (Demo data)", None),
        ("RESOLVED", "All lamps working; night check passed. (Demo data)", None),
    ],
    "CP-2026-0013": [
        ("UNDER REVIEW", "Checked. (Demo data)", None),
        ("VERIFIED", "Confirmed. (Demo data)", None),
        ("IN PROGRESS", "De-silting under way. (Demo data)", None),
        ("RESOLVED", "Drain cleared; lane dry after test flush. (Demo data)", None),
    ],
    "CP-2026-0014": [
        ("REJECTED", "Not a civic issue. (Demo data)",
         "Location is a private driveway, outside public-road scope. Citizen advised to contact the premises association."),
    ],
    "CP-2026-0015": [
        ("DUPLICATE_MERGED", "Merged into CP-2026-0003. (Demo data)",
         "Same dump point as CP-2026-0003 (about 25 m away). Reports merged; count added to the original ticket."),
    ],
    "CP-2026-0016": [
        ("UNDER REVIEW", "Sent to human review — odour reports cannot be verified from a photo. (Demo data)", None),
    ],
    "CP-2026-0018": [
        ("UNDER REVIEW", "Checked. (Demo data)", None),
        ("VERIFIED", "Confirmed wrong-way driving at this spot. (Demo data)", None),
    ],
    "CP-2026-0019": [
        ("UNDER REVIEW", "Taken up for review. (Demo data)", None),
    ],
    "CP-2026-0020": [
        ("UNDER REVIEW", "Checked. (Demo data)", None),
        ("VERIFIED", "Confirmed overflowing drain. (Demo data)", None),
        ("IN PROGRESS", "Drainage crew assigned. (Demo data)", None),
    ],
    "CP-2026-0022": [
        ("UNDER REVIEW", "Checked. (Demo data)", None),
        ("VERIFIED", "Guidance request accepted. (Demo data)", None),
    ],
    "CP-2026-0023": [
        ("UNDER REVIEW", "Checked. (Demo data)", None),
        ("VERIFIED", "Confirmed recurring waterlogging spot. (Demo data)", None),
        ("IN PROGRESS", "Pump and de-silting scheduled. (Demo data)", None),
        ("RESOLVED", "Underpass drained; water flow restored. (Demo data)", None),
    ],
}

# (user_id, points, reason)
POINTS_ROWS = [
    ("22222222-2222-2222-2222-222222222222", 50, "Report submitted: CP-2026-0001"),
    ("22222222-2222-2222-2222-222222222222", 50, "Report submitted: CP-2026-0007"),
    ("22222222-2222-2222-2222-222222222222", 50, "Report submitted: CP-2026-0013"),
    ("22222222-2222-2222-2222-222222222222", 20, "Issue resolved: CP-2026-0007"),
    ("22222222-2222-2222-2222-222222222222", 20, "Issue resolved: CP-2026-0013"),
    ("33333333-3333-3333-3333-333333333333", 50, "Report submitted: CP-2026-0002"),
    ("33333333-3333-3333-3333-333333333333", 30, "Traffic report submitted: CP-2026-0008"),
    ("44444444-4444-4444-4444-444444444444", 50, "Report submitted: CP-2026-0003"),
    ("44444444-4444-4444-4444-444444444444", 30, "Traffic report submitted: CP-2026-0009"),
    ("55555555-5555-5555-5555-555555555555", 50, "Report submitted: CP-2026-0004"),
    ("55555555-5555-5555-5555-555555555555", 50, "Report submitted: CP-2026-0010"),
    ("66666666-6666-6666-6666-666666666666", 50, "Report submitted: CP-2026-0005"),
    ("66666666-6666-6666-6666-666666666666", 50, "Report submitted: CP-2026-0011"),
    ("77777777-7777-7777-7777-777777777777", 50, "Report submitted: CP-2026-0006"),
    ("77777777-7777-7777-7777-777777777777", 50, "Report submitted: CP-2026-0012"),
    ("77777777-7777-7777-7777-777777777777", 20, "Issue resolved: CP-2026-0012"),
    ("88888888-8888-8888-8888-888888888888", 50, "Report submitted: CP-2026-0014"),
    ("88888888-8888-8888-8888-888888888888", 50, "Report submitted: CP-2026-0015"),
    ("88888888-8888-8888-8888-888888888888", 10, "Supported a duplicate: CP-2026-0015"),
    ("22222222-2222-2222-2222-222222222222", 50, "Report submitted: CP-2026-0016"),
    ("33333333-3333-3333-3333-333333333333", 50, "Report submitted: CP-2026-0017"),
    ("44444444-4444-4444-4444-444444444444", 50, "Report submitted: CP-2026-0018"),
    ("55555555-5555-5555-5555-555555555555", 50, "Report submitted: CP-2026-0019"),
    ("66666666-6666-6666-6666-666666666666", 50, "Report submitted: CP-2026-0020"),
    ("22222222-2222-2222-2222-222222222222", 50, "Report submitted: CP-2026-0021"),
    ("33333333-3333-3333-3333-333333333333", 50, "Report submitted: CP-2026-0022"),
    ("44444444-4444-4444-4444-444444444444", 50, "Report submitted: CP-2026-0023"),
]

NOTIFICATIONS = [
    ("22222222-2222-2222-2222-222222222222", "Your report CP-2026-0001 was received and is now in progress. (Demo data)"),
    ("33333333-3333-3333-3333-333333333333", "Your report CP-2026-0002 needs human review — AI confidence was 58%. (Demo data)"),
    ("22222222-2222-2222-2222-222222222222", "Good news — your report CP-2026-0007 has been resolved. (Demo data)"),
    ("77777777-7777-7777-7777-777777777777", "Good news — your report CP-2026-0012 has been resolved. (Demo data)"),
    ("22222222-2222-2222-2222-222222222222", "Good news — your report CP-2026-0013 has been resolved. (Demo data)"),
    ("22222222-2222-2222-2222-222222222222", "Your report CP-2026-0016 needs human review — AI confidence was 64%. (Demo data)"),
]


def main() -> None:
    db = SessionLocal()
    try:
        if db.query(models.Complaint).count() > 0:
            print("Database already has complaints — skipping seed.")
            return
        for user_id, name, email, role in DEMO_USERS:
            db.add(models.User(
                id=user_id, name=name, email=email,
                password_hash=hash_password("demo1234"), role=role,
            ))
        db.flush()
        admin_id = DEMO_USERS[0][0]
        for i, row in enumerate(DEMO_COMPLAINTS, start=1):
            (ticket, user_id, category, desc, status_, severity,
             ward, address, team, reports, lat, lng, created) = row
            complaint = models.Complaint(
                id=f"c{i:07d}-0000-0000-0000-0000000000{i:02d}",
                ticket_no=ticket, user_id=user_id, category=category,
                description=desc, status=status_, severity=severity,
                ward=ward, address=address, is_demo=True,
                created_at=datetime.strptime(created, "%Y-%m-%d %H:%M"),
            )
            db.add(complaint)
            db.flush()
            db.add(models.Location(
                complaint_id=complaint.id, latitude=lat, longitude=lng,
                address=address,
            ))
            db.add(models.StatusHistory(
                complaint_id=complaint.id, old_status=None,
                new_status="SUBMITTED", updated_by=user_id,
                remarks="Report created by citizen. (Demo data)",
            ))
            previous = "SUBMITTED"
            for new_status, remarks, reason in HISTORY_ROWS.get(ticket, []):
                db.add(models.StatusHistory(
                    complaint_id=complaint.id, old_status=previous,
                    new_status=new_status, updated_by=admin_id,
                    remarks=remarks, reason=reason,
                ))
                previous = new_status
            if ticket in AI_ROWS:
                cat, conf, sev, evidence, review, correction = AI_ROWS[ticket]
                db.add(models.AiAnalysis(
                    complaint_id=complaint.id,
                    model="citypulse-vision-mock-v1",
                    predicted_category=cat, confidence=conf,
                    suggested_severity=sev, visible_evidence=evidence,
                    needs_human_review=review, human_verified=not review,
                    human_correction=correction,
                ))
            # Points for this report are added from POINTS_ROWS below.
        db.add(models.DuplicateMatch(
            complaint_id="c0000015-0000-0000-0000-000000000015",
            matched_id="c0000003-0000-0000-0000-000000000003",
            distance_m=25.0, similarity=0.91, decision="duplicate",
        ))
        db.add(models.DuplicateMatch(
            complaint_id="c0000006-0000-0000-0000-000000000006",
            matched_id="c0000013-0000-0000-0000-000000000013",
            distance_m=130.0, similarity=0.58, decision="separate",
        ))
        for user_id, points, reason in POINTS_ROWS:
            db.add(models.CitizenPoints(
                user_id=user_id, points=points, reason=reason
            ))
        for user_id, message in NOTIFICATIONS:
            db.add(models.Notification(user_id=user_id, message=message))
        db.add(models.IssueComment(
            complaint_id="c0000001-0000-0000-0000-000000000001",
            user_id="22222222-2222-2222-2222-222222222222",
            comment="This pothole has been there for two weeks now. (Demo data)",
        ))
        db.add(models.IssueComment(
            complaint_id="c0000005-0000-0000-0000-000000000005",
            user_id="11111111-1111-1111-1111-111111111111",
            comment="Drainage team will visit after the next rain spell. (Demo data)",
        ))
        db.commit()
        print("Seeded 8 demo users and 23 demo complaints.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
