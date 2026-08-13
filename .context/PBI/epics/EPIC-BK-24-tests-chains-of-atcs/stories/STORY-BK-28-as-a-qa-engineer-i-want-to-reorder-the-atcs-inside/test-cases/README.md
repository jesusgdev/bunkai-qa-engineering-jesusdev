# BK-28 Test Cases — TMS-Test Builder Reorder

**Story**: BK-28 — TMS-Test Builder | Reorder ATCs inside a test
**Epic**: BK-24 (Test Builder)
**Modality**: jira-xray
**Test Set**: BK-403 (Test Set: BK-24 Test Builder)

## Test Cases (12 — all Candidate)

| Key | TC | Category | Description | Status |
|---|---|---|---|---|
| BK-404 | TC-1 | Happy | Successful reorder [A,B,C,D] → [A,D,B,C] | Candidate |
| BK-405 | TC-2 | Happy | Reorder persists across GET reads | Candidate |
| BK-406 | TC-3 | No-op | Same order submitted → no version bump | Candidate |
| BK-407 | TC-4 | No-op | Single-ATC Test → no-op | Candidate |
| BK-408 | TC-5 | Negative | 401 unauthenticated | Candidate |
| BK-409 | TC-6 | Negative | 403 viewer role | Candidate |
| BK-410 | TC-7 | Boundary | 409 version conflict | Candidate |
| BK-411 | TC-8 | Negative | 422 chain_mismatch (missing/extra) | Candidate |
| BK-412 | TC-9 | Negative | 422 chain_invalid (duplicates) | Candidate |
| BK-413 | TC-10 | Negative | 422 chain_invalid (empty) | Candidate |
| BK-414 | TC-11 | Integration | Activity log test.reordered event | Candidate |
| BK-415 | TC-12 | Integration | Retry-safe double-click → no-op | Candidate |

## Regression Plan

**BK-403** (Test Set: BK-24 Test Builder) — 12/12 Candidate
