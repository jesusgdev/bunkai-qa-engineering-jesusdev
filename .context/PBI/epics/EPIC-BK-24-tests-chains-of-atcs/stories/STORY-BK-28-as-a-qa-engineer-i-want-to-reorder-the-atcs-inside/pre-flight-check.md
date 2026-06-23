# Pre-Flight Check — BK-28

**Story**: TMS-Test Builder | Reorder ATCs inside a test
**Executed**: 2026-06-22
**Verdict**: GO

---

## ATP Reconciliation

| TC | Group | Status | Notes |
|---|---|---|---|
| TC-1 | Happy | SYNCED | Successful reorder [A,B,C,D] → [A,D,B,C] |
| TC-2 | Happy | SYNCED | Reorder persists across GET |
| TC-3 | No-op | SYNCED | Same order submitted → no version bump |
| TC-4 | No-op | SYNCED | Single-ATC Test → no-op (use existing 1-ATC Test) |
| TC-5 | Negative | SYNCED | 401 unauthenticated |
| TC-6 | Negative | SYNCED | 403 viewer role (cross-workspace 403 proxy) |
| TC-7 | Boundary | SYNCED | 409 version conflict |
| TC-8 | Negative | SYNCED | 422 chain_mismatch (missing/extra) |
| TC-9 | Negative | SYNCED | 422 chain_invalid (duplicate step_ids) |
| TC-10 | Negative | SYNCED | 422 chain_invalid (empty chain) |
| TC-11 | Integration | SYNCED | Activity log test.reordered event |
| TC-12 | Integration | SYNCED | Retry-safe double-click → no-op |

**Summary**: 12 TCs claimed → 12 executable → 0 new ACs → 0 deferred

---

## Test-Data Readiness

| Data | Available? | Details |
|---|---|---|
| Test with 4 ATCs [A,B,C,D] | Yes | Test `7b14c384-c4f9-403f-8cae-0b85a1cfcfe5`, version 1 |
| Test with 1 ATC (for TC-4) | Yes | Test `09d28d3c-ad29-45d9-a014-dbb7ba6ccbb2`, version 11 |
| Step IDs for reorder | Yes | 4 step_ids: 2203e0bd, 4b590d93, 92f763b4, 28e30490 |
| Active workspace match | Yes | Workspace a222895a, owner role |

---

## Smoke Subset

| Subset | TCs | Coverage |
|---|---|---|
| Smoke | TC-1, TC-3, TC-5 | Core happy + no-op + auth gate |
| Full | All 12 TCs | Full coverage |

---

## Verdict

**GO**

All 12 TCs SYNCED. Test data available (4-ATC Test + 1-ATC Test). BK-27 dependency resolved (QA Approved). Staging reachable. API token valid with atc:write scope.

**Recommended next step**: Proceed to /sprint-testing Stage 1.
