# Architecture — CityPulse AI

Source: **CityPulse AI Architecture Blueprint** (CityFix Buildathon,
Hyderabad civic intelligence platform), sections 2–5, 11, 13. The full
project documentation is in
[`CityPulse_AI_Project_Documentation_Hariteja.docx`](CityPulse_AI_Project_Documentation_Hariteja.docx).

## System overview

```
Citizen Web App (Next.js • React • TypeScript)
        │  HTTPS / JSON, base path /api/v1
        ▼
API Layer (FastAPI • Auth • Validation • RBAC)
        │
        ├── Application Services — Complaints • Workflow • Notifications
        ├── AI Engine — Vision analysis (confidence, review flag)
        ├── Database — Supabase PostgreSQL (users, complaints, audit history)
        ├── Media Store — Supabase Storage (photos, referenced only)
        └── Maps — Leaflet + OpenStreetMap
        │
        ▼
Admin & Civic Intelligence Dashboard
(Review • Map hotspots • Analytics • Status management)
```

## Technology stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS | Citizen and admin interfaces |
| Backend | Python FastAPI, Pydantic | REST APIs, validation, workflow |
| Database | Supabase PostgreSQL | Users, complaints, audit history |
| Authentication | Supabase Auth (JWT in this repo) | Login and identity |
| Image storage | Supabase Storage | Uploaded complaint evidence |
| Maps | Leaflet + OpenStreetMap | Issue markers and map filters |
| AI | Vision-capable AI API | Image classification suggestions |
| Automation | Playwright + TypeScript | End-to-end UI tests (TC01–TC20) |
| API testing | Postman | API contract and integration tests |
| Hosting | Vercel + Render | Frontend and backend deployment |
| Source control | GitHub | Branches, pull requests and documentation |

## Application screens

### Citizen portal

| Screen | Key components |
| --- | --- |
| Home dashboard | Report issue, city map, my complaints, alerts, community metrics |
| Report issue | Image capture/upload, category, description, location picker |
| AI analysis | Suggested category, confidence, severity estimate, evidence, correction option |
| Complaint details | Ticket number, location, status timeline, comments, updates |
| City map | Issue markers, category filters, report freshness |
| Carpool | Offer a ride, find a ride, available rides — one car, 4 members |
| Pollution Map | Area insights, ward-level pollution picture |
| Community Feed | Neighbourhood posts, updates and discussions |
| Water Dashboard | Rainwater harvesting status, water-use education |
| AI Assistant | Ask about issues, guidance on reporting and next steps |

### Report categories (grouped dropdown)

The report form groups the categories so citizens find the right one fast.
Every report, in any category, creates a unique ticket and follows the same
SUBMITTED → RESOLVED workflow with a visible status timeline.

- **Roads & traffic:** Pothole, Traffic Congestion, Traffic Police Challan, Wrong-Way Driving, Footpath
- **Water & drainage:** Waterlogging, Drainage, Drainage Overflow, Rainwater Harvesting, Water Conservation
- **Environment & community:** Garbage, Streetlight, Chemical Factory Pollution, Political Complaint, Other

Bachupally is covered as an additional area for the resident-reported
chemical-factory pollution issue (ticket CP-2026-0016): chemical odours and
fumes, especially in the evenings, allegedly from nearby pharma and chemical
units, plus construction dust and the headaches, breathing difficulty and eye
irritation residents report. It is labelled resident-reported, not verified.

### Admin portal

| Screen | Key components |
| --- | --- |
| Overview | Total/open/resolved counts, categories, recent activity |
| Issue management | Search, filters, review queue, complaint details |
| Map view | Geographic distribution, recurring hotspots |
| Resolution management | Verify, assign, update status, record remarks |
| Quality dashboard | Duplicate flags, AI review outcomes, defect and test metrics |

## Data model

See [`../database/schema.sql`](../database/schema.sql). Ten tables:
`users`, `complaints`, `complaint_media`, `locations`, `ai_analysis`,
`duplicate_matches`, `status_history`, `issue_comments`, `citizen_points`,
`notifications`.

Data integrity rules (enforced in schema + backend):

- Unique ticket number for every complaint.
- Foreign keys for complaint ownership and related records.
- Indexes on ticket number, status and geographic fields.
- Latitude/longitude ranges validated.
- Every status transition recorded with actor and timestamp.
- Admin permissions enforced on the backend.
- Image objects stored outside database rows; controlled references only.

## AI analysis and duplicate workflow

1. **Upload** — receive image and metadata; validate type, size, content.
2. **Pre-check** — image quality and supported format; reject invalid files.
3. **Vision analysis** — suggest category and visible evidence; record model and timestamp.
4. **Confidence gate** — below 0.70 → human review.
5. **Duplicate check** — category, location (50 m default) and time window
   (14 days); flag possible matches, never silently discard.
6. **Confirmation** — citizen/reviewer confirms or corrects; store correction.
7. **Complaint creation** — ticket and status history; return ticket number.

AI response fields: `predicted_category`, `confidence`,
`suggested_severity`, `visible_evidence`, `needs_human_review`,
`model_version`, `analysed_at`.

## Complaint workflow

```
SUBMITTED → UNDER REVIEW → VERIFIED → IN PROGRESS → RESOLVED
```

`Rejected` and `Duplicate-merged` are separate outcomes and must include a
reason. Transitions are enforced server-side
(`backend/app/core/workflow.py`). Citizens can view progress but cannot
change admin-controlled statuses.

## Deployment

| Component | Hosting | Release checks |
| --- | --- | --- |
| Frontend | Vercel | Public URL, mobile layout, API base URL |
| Backend | Render | Health endpoint, CORS, logs, secrets |
| Database | Supabase PostgreSQL | Migrations, indexes, access policies |
| Image storage | Supabase Storage | Upload limits, private access, signed URLs |
| Source | GitHub | Fresh repository, README, no secrets |
| API docs | FastAPI OpenAPI / Swagger | Verify public docs policy and test endpoints |
| QA evidence | GitHub Actions artifacts | Test report, screenshots, traces without PII |

Security and release gates: environment variables for credentials, never
commit secrets; restrict CORS to expected origins; enforce role checks in
the backend; avoid public access to private complaint photos; use synthetic
demo accounts and clearly labelled demo data; test the deployed public
journey end-to-end before submission.
