# Database

PostgreSQL schema and labelled demo seed for CityPulse AI, matching
Blueprint section 5 (Database design) and the project documentation.

## Files

- `migrations/001_create_tables.sql` — the 10 tables: `users`, `complaints`,
  `complaint_media`, `locations`, `ai_analysis`, `duplicate_matches`,
  `status_history`, `issue_comments`, `citizen_points`, `notifications`, plus
  enums, indexes and latitude/longitude checks.
- `seed_data.sql` — **demo data, clearly labelled**: 1 admin + 7 demo citizens
  and the same 23 demo complaints (`CP-2026-0001` … `CP-2026-0023`) shown in
  the live demo prototype, with the same reporters, wards, AI confidences and
  status histories, across all 10 Hyderabad wards and every workflow state
  (including one `DUPLICATE_MERGED` and one `REJECTED`, both with a recorded
  reason). Demo accounts share the password `demo1234` (real bcrypt hash in
  the file — demo only, replace before any real use).

## Apply (Supabase / PostgreSQL)

```bash
psql "$DATABASE_URL" -f database/migrations/001_create_tables.sql
psql "$DATABASE_URL" -f database/seed_data.sql
```

In Supabase: SQL Editor → paste `migrations/001_create_tables.sql`, run;
then paste `seed_data.sql`, run.

## Notes

- Status changes live only in `status_history` — the audit trail is
  append-only; the backend never updates or deletes history rows.
- Ticket numbers are unique (`complaints.ticket_no`).
- Images are stored in object storage (Supabase Storage); only the
  `storage_path` reference is kept in `complaint_media`.
- `complaints.assigned_team` records the admin-assigned resolution team;
  `complaints.report_count` records how many citizens reported the same issue
  (used by the duplicate flow).
