# Postman — CityPulse AI API

API contract and integration tests for `/api/v1` (Blueprint sections 6, 9).

## Import

1. Postman → Import → `CityPulse_AI_API.postman_collection.json`
2. Postman → Import → `CityPulse_AI_Local.postman_environment.json`
3. Select the **CityPulse AI — Local** environment.
4. Start the backend first: `cd ../backend && uvicorn main:app --reload`
   (seed demo data with `python seed.py` if the database is empty).

## Flow

1. **Login** — the test script saves the JWT to the `{{token}}` variable.
2. **Create complaint** — the test script saves the id to `{{complaint_id}}`.
3. Run the remaining requests in order: details, history, media upload,
   duplicates, comments, AI analyse, admin status update, map, analytics,
   notifications, leaderboard.

Negative cases are included as separate requests: invalid login (TC02),
oversized image (TC04), invalid transition (TC13), and the AI timeout
case (TC18). Expected codes: 401, 413, 422, 503 respectively.

## Notes

- The collection uses `{{base_url}}` (default `http://localhost:8000/api/v1`).
- Demo accounts: `admin@citypulse.demo` / `demo1234`,
  `priya@citypulse.demo` / `demo1234` (seeded demo data only).
- No real credentials are stored in this folder.
