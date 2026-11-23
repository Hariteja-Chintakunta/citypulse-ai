# Automation — CityPulse AI (Playwright + TypeScript)

End-to-end UI and API tests implementing the blueprint's minimum test
scenario set **TC01–TC20** (Blueprint section 10).

## Run

```bash
npm install
npx playwright install chromium

# Frontend dev server must be running for UI tests:
#   cd ../frontend && npm run dev        (http://localhost:3000)
# Backend must be running for API tests (they skip if it is down):
#   cd ../backend && uvicorn main:app --reload   (http://localhost:8000)

npm test
```

Environment overrides:

```bash
BASE_URL=http://localhost:3000 API_URL=http://localhost:8000/api/v1 npm test
```

## Scenario map

| File | Scenarios |
| --- | --- |
| `tests/auth-reporting.spec.ts` | TC01 register, TC02 invalid login, TC03 submit with image, TC04 bad/oversized image, TC05 mandatory fields |
| `tests/ai-duplicates.spec.ts` | TC06 AI suggestion, TC07 low confidence → human review, TC08 duplicate flagged, TC09 different location allowed, TC10 unique ticket |
| `tests/access-workflow.spec.ts` | TC11 authorised-only details, TC12 citizen cannot change status, TC13 invalid transition rejected, TC14 audit history, TC15 map markers/coordinates |
| `tests/dashboard-notify.spec.ts` | TC16 dashboard metrics refresh, TC17 status-update notification, TC18 AI timeout graceful, TC19 unauthorised image access |
| `tests/accessibility.spec.ts` | TC20 mobile layout + keyboard accessibility (Pixel 7 project) |

## Notes

- UI tests run in the frontend's clearly-labelled **demo mode** (localStorage)
  unless a user is signed in; API tests target the FastAPI backend and skip
  gracefully with "Backend not running" when it is not up.
- Tests never publish planned targets as results: only actual runs count,
  per the blueprint's QA rule. HTML reports are written to
  `playwright-report/` after a run.
- Page objects live in `pages/` (`ReportPage`, `AdminPage`, `MapPage`,
  `LoginPage`); shared data and helpers in `fixtures/testData.ts`.
