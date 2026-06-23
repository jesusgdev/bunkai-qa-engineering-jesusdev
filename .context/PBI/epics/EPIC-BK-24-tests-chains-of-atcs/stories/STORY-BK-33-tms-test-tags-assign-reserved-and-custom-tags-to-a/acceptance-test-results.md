# Acceptance Test Results (ATR) — BK-33 Test Tags

**Story**: [BK-33](https://jira.upexgalaxy.com/browse/BK-33)
**Status**: PASSED
**Executed**: 2026-06-22
**Environment**: staging (https://staging-upexbunkai.vercel.app)
**TMS Modality**: jira-native

## Test Execution Summary

**Result: PASSED** (14/14 TCs PASSED; 0 FAILED; 0 DEFERRED)

| TC | Group | Status | Evidence |
|---|---|---|---|
| TC-1 | Happy path | PASSED | PUT tags=["smoke","regression"] → 200, version 1→2, filter returns Test |
| TC-2 | Happy path | PASSED | PUT tags=["smoke","checkout","mobile"] → 200, version 2→3, all 3 tags saved |
| TC-3 | Happy path | PASSED | PUT tags=["sanity","billing"] → 200, version 3→4, old tags removed |
| TC-4 | Happy path | PASSED | PUT tags=[] → 200, version 4→5, Test untagged |
| TC-5 | Negative | PASSED | PUT tag 51 chars → 422 validation_failed, existing tags unchanged |
| TC-6 | Negative | PASSED | PUT "smoke,critical" → 422 validation_failed, existing tags unchanged |
| TC-7 | Negative | PASSED | PUT 21 tags → 422 validation_failed, existing tags unchanged |
| TC-8 | Negative | PASSED | PUT X-If-Match=1 (stale, current=5) → 409 conflict, returns current_version=5 + current_tags=[] |
| TC-9 | Negative | PASSED | No auth → 401 unauthorized; cross-workspace PUT → 403 forbidden (not_a_member) |
| TC-10 | Boundary | PASSED | PUT ["SMOKE","Sanity"] → saved as ["smoke","sanity"] (reserved lowercased) |
| TC-11 | Boundary | PASSED | PUT [" smoke ","smoke"," checkout "] → saved as ["smoke","checkout"] (trimmed + deduped) |
| TC-12 | Boundary | PASSED | PUT [" Mobile-P1 "] → saved as ["Mobile-P1"] (custom casing preserved) |
| TC-13 | Integration | PASSED | Filter ?tag=smoke → returns matching Test; ?tag=sanity → empty; ?tag=Smoke → case-insensitive match; no cross-workspace leak |
| TC-14 | Integration | PASSED | Replace smoke→regression: filter ?tag=smoke now empty, ?tag=regression returns Test |

## DB Cross-Validation

| Check | API Response | DB State | Match? |
|---|---|---|---|
| Tags after final update | ["regression"] | ["regression"] | YES |
| Version after final update | 10 | 10 | YES |
| Workspace isolation | Only active workspace Tests returned | Tests in other workspace not accessible | YES |

## Observations

- Optimistic locking works correctly: 409 conflict returns `current_version` + `current_tags` in error details, allowing client to refresh.
- Reserved tag normalization is case-insensitive on both write (PUT) and read (GET filter): `Smoke` matches `smoke`.
- Custom tag casing is preserved after trimming — `Mobile-P1` stays `Mobile-P1`, not lowercased.
- Workspace isolation enforced by RLS: cross-workspace PUT returns 403 `not_a_member`, cross-workspace GET filter returns only active workspace Tests.
- Test data restored to original state (tags: []) after execution.

## Defects

None.
