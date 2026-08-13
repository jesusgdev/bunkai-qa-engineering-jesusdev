# BK-33 Test Cases — TMS-Test Tags

**Story**: BK-33 — TMS-Test Tags | Assign reserved and custom tags to a test
**Epic**: BK-24 (Test Builder)
**Modality**: jira-xray
**Test Set**: BK-403 (Test Set: BK-24 Test Builder)

## Test Cases (14 — all Candidate)

| Key | TC | Category | Description | Status |
|---|---|---|---|---|
| BK-425 | TC-1 | Happy | Assign reserved tags to Test | Candidate |
| BK-426 | TC-2 | Happy | Assign custom tags alongside reserved | Candidate |
| BK-427 | TC-3 | Happy | Replace full tag set on Test | Candidate |
| BK-428 | TC-4 | Happy | Remove all tags from Test | Candidate |
| BK-429 | TC-5 | Negative | Reject tag >50 chars | Candidate |
| BK-430 | TC-6 | Negative | Reject tag containing comma | Candidate |
| BK-431 | TC-7 | Negative | Reject >20 tags | Candidate |
| BK-432 | TC-8 | Negative | Reject stale concurrent tag updates | Candidate |
| BK-433 | TC-9 | Negative | Reject tag updates for read-only user | Candidate |
| BK-434 | TC-10 | Boundary | Normalize reserved tag casing | Candidate |
| BK-435 | TC-11 | Boundary | Trim whitespace and deduplicate tags | Candidate |
| BK-436 | TC-12 | Boundary | Preserve valid custom tag casing | Candidate |
| BK-437 | TC-13 | Integration | Filter returns only matching Tests | Candidate |
| BK-438 | TC-14 | Integration | Tag updates refresh search and suite grouping | Candidate |

## Regression Plan

**BK-403** (Test Set: BK-24 Test Builder) — 14/14 Candidate
