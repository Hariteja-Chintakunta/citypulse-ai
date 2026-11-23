# Frontend — CityPulse AI

Next.js 14 + React 18 + TypeScript + Tailwind CSS citizen and admin app,
implementing Blueprint section 4 (Application screens).

## Run

```bash
npm install
cp ../.env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                      # http://localhost:3000
npm run build && npm run start   # production build
npm run typecheck                # tsc --noEmit
```

## Pages

| Route | Screen |
| --- | --- |
| `/` | Home dashboard — report CTA, metrics, how it works, map preview, recent reports, alerts |
| `/report` | Report issue — photo upload, category, description, ward/location, AI panel, duplicate check, ticket |
| `/complaints/[id]` | Complaint details — ticket, location, status timeline, comments note |
| `/map` | City map — Leaflet + OpenStreetMap markers with category filters (TC15) |
| `/admin` | Admin dashboard — overview, review queue, verify/assign/status with remarks, reason enforced for Rejected/Duplicate-merged, analytics, hotspots |
| `/alerts` | Traffic intelligence + rain/waterlogging alerts (P1) + report-an-alert form |
| `/leaderboard` | Citizen points + leaderboard (P2) |
| `/login` | Sign in / register (full-stack API mode) |

## Demo mode vs live API

- **Demo mode (default):** no backend needed. Reports, points and status
  changes persist in the browser (`localStorage`, `lib/store.ts`) and the
  UI carries a "Demo data" banner. The AI panel uses the client-side mock
  analyser (`lib/api.ts: mockAnalyse`), mirroring
  `backend/app/services/ai_service.py`, and reports `mode: "mock"`.
- **Live API mode:** sign in at `/login` (or set a token). The app then
  calls `NEXT_PUBLIC_API_URL` (`/api/v1`) for complaints, AI analysis,
  duplicates, map, analytics and leaderboard.

## Map

Leaflet 1.9.4 + OpenStreetMap tiles, loaded client-side (`components/CityMap.tsx`).
Markers render at the exact complaint coordinates.
