# API Contract — CityPulse AI (`/api/v1`)

Source: Blueprint section 6. Full implementation: `backend/`. Interactive
docs (when the backend runs): `http://localhost:8000/docs`.

## Conventions

- Base path: `/api/v1`.
- Auth: `Authorization: Bearer <JWT>` (from `POST /auth/login`) on all
  protected resources. Public: `/health`, `/`, `GET /map/issues`,
  `GET /analytics/overview`, `GET /leaderboard`.
- Errors: consistent JSON, `{ "detail": "<message>" }`, with standard HTTP
  status codes (400 validation, 401 unauthenticated, 403 forbidden,
  404 not found, 413 too large, 415 unsupported media, 422 invalid
  transition / missing reason, 503 AI unavailable).
- All request bodies are validated with Pydantic; latitude/longitude ranges
  are enforced.

## Endpoints

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| POST | /auth/register | Register citizen (TC01) | — |
| POST | /auth/login | Login (TC02) | — |
| POST | /complaints | Create complaint (TC03, TC05, TC10) | Citizen |
| GET | /complaints | List permitted complaints | Citizen (own) / Admin (all) |
| GET | /complaints/{id} | Complaint details (TC11) | Owner / Admin |
| GET | /complaints/{id}/history | Append-only audit history (TC14) | Owner / Admin |
| POST | /complaints/{id}/media | Upload image (TC04, TC19) | Owner / Admin |
| GET | /complaints/{id}/duplicates | Possible matches (TC08, TC09) | Owner / Admin |
| POST | /complaints/{id}/comments | Add comment | Owner / Admin |
| POST | /ai/analyze | Analyse image (TC06, TC07, TC18) | Citizen |
| PATCH | /admin/complaints/{id}/status | Admin status update (TC12, TC13, TC17) | Admin |
| GET | /map/issues | Map issue markers (TC15) | Public |
| GET | /analytics/overview | Dashboard metrics (TC16) | Public |
| GET | /notifications | User notifications | Citizen |
| PATCH | /notifications/{id}/read | Mark notification read | Citizen |
| GET | /leaderboard | Citizen leaderboard (P2) | Public |

## Key request/response shapes

**Create complaint** — `POST /complaints`

```json
{
  "category": "Pothole",
  "description": "Deep pothole near the junction.",
  "ward": "Jubilee Hills",
  "location": { "latitude": 17.4326, "longitude": 78.4071, "address": "Road No. 36, Jubilee Hills" }
}
```

→ `201` with the complaint, including a unique `ticket_no` (`CP-2026-XXXX`).

**AI analysis** — `POST /ai/analyze` (multipart `file`, or form fields)

```json
{
  "predicted_category": "Pothole",
  "confidence": 0.92,
  "suggested_severity": "High",
  "visible_evidence": "Dark cavity in road surface with broken edges",
  "needs_human_review": false,
  "model_version": "citypulse-vision-mock-v1",
  "analysed_at": "2026-11-23T16:00:00Z",
  "mode": "mock"
}
```

**Status update** — `PATCH /admin/complaints/{id}/status`

```json
{ "new_status": "UNDER REVIEW", "remarks": "Photo and location checked." }
```

`REJECTED` and `DUPLICATE_MERGED` require a `reason`. Invalid transitions
return `422`. A successful update writes a `status_history` row and a
notification for the citizen.

**Analytics** — `GET /analytics/overview`

```json
{
  "total": 15, "open": 10, "resolved": 2,
  "by_status": { "SUBMITTED": 3, "UNDER REVIEW": 2, "...": "..." },
  "by_category": { "Pothole": 4, "...": "..." },
  "by_ward": { "Jubilee Hills": 2, "...": "..." }
}
```
