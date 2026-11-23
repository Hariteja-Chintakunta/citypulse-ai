# Backend — CityPulse AI API

FastAPI + Pydantic REST API for the CityPulse AI platform, implementing the
`/api/v1` contract from Blueprint section 6.

## Run

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env        # set DATABASE_URL / SECRET_KEY
python seed.py                 # optional: load the 15 labelled demo complaints
uvicorn main:app --reload      # http://localhost:8000, docs at /docs
```

Without `DATABASE_URL` the API uses a local SQLite file (`citypulse.db`).
For PostgreSQL / Supabase set
`DATABASE_URL=postgresql://user:password@host:5432/citypulse` and apply
`../database/schema.sql` (+ `seed.sql`) first.

## Endpoints (`/api/v1`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /auth/register | Register citizen (TC01) |
| POST | /auth/login | Login (TC02 — invalid credentials rejected) |
| POST | /complaints | Create complaint (TC03, TC05, TC10) |
| GET | /complaints | List permitted complaints |
| GET | /complaints/{id} | Complaint details (TC11 — owner/admin only) |
| GET | /complaints/{id}/history | Append-only audit history (TC14) |
| POST | /complaints/{id}/media | Upload image (TC04, TC19) |
| GET | /complaints/{id}/duplicates | Possible matches (TC08, TC09) |
| POST | /complaints/{id}/comments | Add comment |
| POST | /ai/analyze | Analyse image (TC06, TC07, TC18) |
| PATCH | /admin/complaints/{id}/status | Admin status update (TC12, TC13, TC17) |
| GET | /map/issues | Map issue markers (TC15) |
| GET | /analytics/overview | Dashboard metrics (TC16) |
| GET | /notifications | User notifications |
| PATCH | /notifications/{id}/read | Mark notification read |
| GET | /leaderboard | Citizen leaderboard (P2) |

## Workflow enforcement

`SUBMITTED → UNDER REVIEW → VERIFIED → IN PROGRESS → RESOLVED`, enforced
in `app/core/workflow.py`. `REJECTED` and `DUPLICATE_MERGED` require a
reason. Invalid transitions return HTTP 422. Citizens get HTTP 403 on
admin-only routes. Every status change writes a `status_history` row and a
notification for the citizen.

## AI analysis — mock/suggestion mode

Until `VISION_API_KEY` is set, `POST /api/v1/ai/analyze` runs the
**clearly-labelled mock analyser** (`app/services/ai_service.py`): it
classifies from the filename and an optional hint, reports `mode: "mock"`,
and flags `needs_human_review` when confidence is below the 0.70 threshold.
With a key set, the real vision provider call is the documented extension
point in the same module — it is intentionally not faked. A provider
timeout returns HTTP 503 with `needs_human_review: true` (TC18).

## Demo accounts (seeded by `seed.py`)

- `admin@citypulse.demo` / `demo1234` (admin)
- `priya@citypulse.demo` / `demo1234` (citizen)
- All demo data is labelled `is_demo = true`.
