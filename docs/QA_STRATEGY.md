# QA Strategy — CityPulse AI

Source: Blueprint sections 9–10. QA Lead: Hariteja Chintakunta.

## Principle

QA validates the complete citizen-to-admin journey, API contracts, role
permissions, data integrity and AI output quality. **Only actual execution
evidence is reported as test results — planned targets are never published
as results.**

## Test areas

| Test area | Coverage | Tool / evidence |
| --- | --- | --- |
| Functional | Create, view and track complaint | Manual / Playwright |
| API | Status codes, schema, validation, auth | Postman |
| Integration | AI, image storage, database, notifications | API + integration tests |
| UI automation | Citizen report and admin update journey | Playwright |
| Negative | Missing fields, invalid images, low confidence | API / UI tests |
| Security | Role access, IDOR, protected status updates | API security tests |
| Data integrity | Ticket uniqueness and status history | SQL checks |
| AI quality | Classification and human correction | Labelled evaluation set |
| Performance | Upload and API latency under test load | JMeter, if time permits |

## Minimum test scenario set (TC01–TC20)

Implemented in `automation/` (Playwright + TypeScript) and `postman/`.

| ID | Scenario | Where |
| --- | --- | --- |
| TC01 | Register a new citizen with valid details | `tests/auth-reporting.spec.ts` |
| TC02 | Reject invalid login credentials | `tests/auth-reporting.spec.ts` |
| TC03 | Submit a complaint with a supported image | `tests/auth-reporting.spec.ts` |
| TC04 | Reject unsupported image formats and oversized files | `tests/auth-reporting.spec.ts` |
| TC05 | Validate mandatory category and location | `tests/auth-reporting.spec.ts` |
| TC06 | Verify AI category suggestion for a labelled sample image | `tests/ai-duplicates.spec.ts` |
| TC07 | Route low-confidence AI output to human review | `tests/ai-duplicates.spec.ts` |
| TC08 | Flag a possible duplicate at the same location | `tests/ai-duplicates.spec.ts` |
| TC09 | Allow a similar issue at a different location | `tests/ai-duplicates.spec.ts` |
| TC10 | Generate a unique complaint ticket number | `tests/ai-duplicates.spec.ts` |
| TC11 | Restrict complaint details to authorised users | `tests/access-workflow.spec.ts` |
| TC12 | Prevent a citizen from changing admin-only status | `tests/access-workflow.spec.ts` |
| TC13 | Reject invalid status transitions | `tests/access-workflow.spec.ts` |
| TC14 | Persist every status change in audit history | `tests/access-workflow.spec.ts` |
| TC15 | Display issue markers at the correct coordinates | `tests/access-workflow.spec.ts` |
| TC16 | Refresh dashboard metrics after a new complaint | `tests/dashboard-notify.spec.ts` |
| TC17 | Notify the citizen after a status update | `tests/dashboard-notify.spec.ts` |
| TC18 | Handle AI provider timeout gracefully | `tests/dashboard-notify.spec.ts` |
| TC19 | Prevent unauthorised image access | `tests/dashboard-notify.spec.ts` |
| TC20 | Verify mobile layout and keyboard accessibility | `tests/accessibility.spec.ts` |

Run: `cd automation && npm install && npx playwright install chromium && npm test`
(see `automation/README.md`). API-only scenarios skip gracefully when the
backend is not running; UI scenarios run against the frontend in demo mode.

## QA dashboard measures (populated only from actual runs)

Executed tests, passed / failed / blocked, open defects by severity, API
error rate, AI human-correction rate, duplicate review outcomes, workflow
coverage.

## Demo narrative for judges

One complete scenario, shown end to end: a citizen uploads a pothole photo
→ the AI suggests a category and a confidence score → the platform flags a
possible nearby duplicate → the citizen confirms the report → a unique
ticket is created → the issue appears on the map → an admin verifies it and
updates the status → the status history is visible → Playwright runs the
reporting journey and produces test evidence. The demo and the test evidence
tell the same story.
