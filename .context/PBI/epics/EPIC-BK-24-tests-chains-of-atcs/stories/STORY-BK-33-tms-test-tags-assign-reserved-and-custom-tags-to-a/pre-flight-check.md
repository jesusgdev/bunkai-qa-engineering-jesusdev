# Pre-Flight Check — BK-33

**Verdict**: GO
**Date**: 2026-06-22
**Story**: TMS-Test Tags | Assign reserved and custom tags to a test

## ATP Reconciliation

| TC | Group | Status | Notes |
|---|---|---|---|
| TC-1: Assign reserved tags | Happy path | SYNCED | API endpoint exists (401 = auth required) |
| TC-2: Custom + reserved tags | Happy path | SYNCED | — |
| TC-3: Replace full tag set | Happy path | SYNCED | — |
| TC-4: Remove all tags | Happy path | SYNCED | — |
| TC-5: Reject >50 chars | Negative | SYNCED | — |
| TC-6: Reject comma | Negative | SYNCED | — |
| TC-7: Reject >20 tags | Negative | SYNCED | — |
| TC-8: Reject stale concurrent | Negative | SYNCED | Soft block: needs 2 concurrent sessions |
| TC-9: Reject no-edit-permission | Negative | SYNCED | — |
| TC-10: Normalize reserved casing | Boundary | SYNCED | — |
| TC-11: Trim + deduplicate | Boundary | SYNCED | — |
| TC-12: Preserve custom casing | Boundary | SYNCED | — |
| TC-13: Filter returns matching | Integration | SYNCED | Soft block: needs Test in another workspace |
| TC-14: Tag updates refresh | Integration | SYNCED | — |

**Summary**: 14 claimed → 14 executable → 0 new ACs → 0 deferred

## Smoke Subset

| Subset | TCs | Coverage |
|---|---|---|
| Smoke | TC-1, TC-3, TC-5, TC-13 | Core happy path + replacement + validation + filtering |
| Full | 14 TCs | All ACs + risk-beyond-AC |

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | BK-70 Jira status is `Backlog` but implementation is deployed (endpoint responds). Jira desync or real dependency gap? | PO/Dev | LOW |

**Next step**: proceed to `/sprint-testing` Stage 1 — all 14 TCs executable, staging reachable, PR merged 6/20
