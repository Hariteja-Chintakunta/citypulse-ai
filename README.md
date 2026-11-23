# CityPulse AI

**Your city. Your voice. Your impact.**

CityPulse AI is an AI-powered platform to report, understand, track and improve
urban issues in Hyderabad. It was built for the **CityFix Buildathon (Tutedude)** —
submission deadline **Saturday, 28 November 2026, 11:59 PM IST**.

> **Core message:** Most civic applications stop at collecting complaints.
> CityPulse AI adds intelligence, quality validation and transparent tracking,
> so citizens can understand whether issues are being reviewed and what
> happens next.

## The core journey (demo narrative for judges)

1. A citizen uploads a pothole photo.
2. The AI suggests a category and a confidence score.
3. The platform flags a possible nearby duplicate.
4. The citizen confirms the report.
5. A unique ticket is created (for example `CP-2026-XXXX`).
6. The issue appears on the city map.
7. An admin verifies it and updates the status.
8. The status history is visible, and the citizen is notified.
9. Playwright runs the reporting journey and produces test evidence.

## Honest note about the live demo

The **live demo link** submitted with this entry is a **client-side working
prototype** of the journey above: reporting with a photo, the AI suggestion
panel, duplicate flagging, ticket creation, the city map, the admin dashboard
and the status timeline all work in the demo, with data kept in the browser.

**This repository carries the full-stack code** — the Next.js frontend, the
FastAPI backend, the Supabase/PostgreSQL database design, the Playwright
automation and the Postman collection. No deployed FastAPI or Supabase backend
is claimed unless it is actually running at submission time. All demo data is
clearly labelled as demo data. CityPulse AI claims **no government affiliation**
and no official complaint integration.

## Repository structure

```
citypulse-ai/
├── frontend/     Next.js + React + TypeScript + Tailwind citizen & admin app
├── backend/      FastAPI + Pydantic REST API (/api/v1)
├── database/     PostgreSQL schema (schema.sql) and labelled demo seed (seed.sql)
├── automation/   Playwright + TypeScript tests for TC01–TC20
├── postman/      API collection + environment template
├── docs/         Architecture, API contract, QA strategy, limitations
├── .env.example
├── README.md
└── LICENSE        MIT
```

## Quick start

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env        # set DATABASE_URL / secrets
uvicorn main:app --reload      # API at http://localhost:8000, docs at /docs
python seed.py                 # load the 15 labelled demo complaints (optional)
```

### Frontend (Next.js)

```bash
cd frontend
npm install
cp ../.env.example .env.local  # set NEXT_PUBLIC_API_URL
npm run dev                    # http://localhost:3000
```

### Database (Supabase / PostgreSQL)

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

### Automation (Playwright, TC01–TC20)

```bash
cd automation
npm install
npx playwright install chromium
npm test                       # runs against $BASE_URL (default http://localhost:3000)
```

### API tests (Postman)

Import `postman/CityPulse_AI_API.postman_collection.json` and
`postman/CityPulse_AI_Local.postman_environment.json` into Postman.

## Workflow (enforced server-side)

```
SUBMITTED → UNDER REVIEW → VERIFIED → IN PROGRESS → RESOLVED
```

`Rejected` and `Duplicate-merged` are separate outcomes and **must include a
reason**. Invalid transitions are rejected (HTTP 422). Citizens can view
progress but cannot change admin-controlled statuses. Every status change is
recorded in an append-only audit history with actor, timestamp and remarks.

## AI behaviour

AI outputs are **suggestions, not authoritative civic findings**. The citizen
or an authorised reviewer can correct the category. Low confidence
(< 70%) routes the report to human review. The AI never infers road depth,
ownership, legal responsibility or completed repairs from a photo, and an
estimated severity is never presented as a verified engineering assessment.
Until a vision API key is configured, `POST /api/v1/ai/analyze` runs in a
clearly-labelled **mock/suggestion mode** (see `backend/README.md`).

## Modules

| Module | Priority |
| --- | --- |
| Citizen reporting (photo, category, description, location) | P0 |
| AI issue detection (category, confidence, review flag) | P0 |
| Complaint tracking (unique ticket + status timeline) | P0 |
| Duplicate detection (category, distance, time) | P0 |
| Admin dashboard (review, verify, update) | P0 |
| City map (markers + category filters) | P0 |
| Traffic intelligence | P1 |
| Rain / waterlogging alerts | P1 |
| Civic analytics | P1 |
| Citizen rewards (points + leaderboard) | P2 |
| Carpool (offer/find rides, available rides — one car, 4 members) | P1 |
| Pollution Map (area insights) | P1 |
| Water Dashboard (rainwater harvesting, water-use education) | P1 |
| AI Assistant (ask about issues, reporting guidance) | P1 |
| Community Feed | P2 |

Wards covered: Jubilee Hills, Banjara Hills, Begumpet, Secunderabad,
Kukatpally, LB Nagar, Uppal, Malakpet, Charminar, Golconda, plus Bachupally
(for the resident-reported chemical-factory pollution issue).

## Team

- **Hariteja Chintakunta — QA Lead / Product Owner / Automation**
- Developer 1 — Next.js citizen portal
- Developer 2 — FastAPI, database and authentication
- Developer 3 — AI analysis and duplicate matching
- Member 5 — Designer / media (UX, brand kit, landing page, videos)

## Limitations

See [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md). In short: reports are
unverified until reviewed; demo data is labelled; no government affiliation;
no live traffic enforcement, official repair status or guaranteed route safety
is claimed without a verified data source; faces and number plates are blurred
in published content unless consent was obtained.

## Licence

MIT — see [LICENSE](LICENSE).
