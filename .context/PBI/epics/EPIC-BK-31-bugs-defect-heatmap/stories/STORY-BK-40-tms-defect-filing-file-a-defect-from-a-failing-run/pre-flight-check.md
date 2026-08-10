# Pre-Flight Check — BK-40

**Verdict**: CONDITIONAL-GO
**Date**: 2026-08-10
**Story**: TMS-Defect Filing | File a defect from a failing run step

## ATP Reconciliation

| TC | Group | Status | Notes |
|---|---|---|---|
| ATP-P1 | Happy Path — Run-linked form | SYNCED | Prefill context is server-derived (never client-supplied), verified live |
| ATP-P2 | Happy Path — Save run-linked defect | SYNCED | 201 with run/step/ATC/module derived from run_step_id (ed0e619d, fae5bf5d) |
| ATP-P3 | Happy Path — Save standalone defect | SYNCED | 201 with explicit project_id + module_id (c4c412c4, 6b49f048, c577dd24) |
| ATP-N1 | Negative — Non-failed step action | SYNCED | API backstop 422 reason `run_step_not_failed`; UI hidden state pending Stage 1 |
| ATP-N2 | Negative — Invalid title length | SYNCED | 422 title 5-200 message |
| ATP-N3 | Negative — Missing/cross-project module | SYNCED | 422 `module not in project`; no defect created |
| ATP-N4 | Negative — Invalid severity | SYNCED | 422 `invalid_value`, values P1-P4 |
| ATP-B1 | Boundary — Evidence limit | SYNCED | 10 evidence links accepted and stored (195b5834); 11th blocked |
| ATP-I1 | Integration — No Jira sync | SYNCED | TMS-native defect in `open` state; no Jira sync in scope |

**Summary**: 9 claimed → 9 executable → 0 new ACs → 0 deferred

## Modality

**Modality**: jira-xray

## Xray Entity Keys

| Key | Value |
|---|---|
| ATP (Test Plan) | PENDING — created in this pass (plan B) |
| ATR (Test Execution) | PENDING — created in this pass (plan B) |
| Test Environment | staging |

## Test-Data Readiness

Soft block: 6 seed bugs left in staging from API verification (c4c412c4, 6b49f048, c577dd24, ed0e619d, fae5bf5d, 195b5834) — cleanup required after Stage 2/3 (no DELETE endpoint in spec). Run-linked preconditions available: run `866e6f5c` in `running` state with failed step `30fd6410`.

## Smoke Subset

| Subset | TCs | Coverage |
|---|---|---|
| Smoke | ATP-P2, ATP-P3, ATP-N3 | Core ACs (3/9) — run-linked save, standalone save, cross-project isolation |

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | Jira status shows "Ready For QA" but impl-plan metadata reads "READY FOR DEV" — reconcile before Stage 3 reporting | QA | MEDIUM |

## Verdict Rationale

CONDITIONAL-GO — 9/9 TCs SYNCED; API contract verified live on staging. Conditions (non-blocking, per expert-panel review):
1. Reconcile Jira status before Stage 3 (open question 1).
2. Stage 1 must cover the UI layer of `BugFormDialog` (run-linked prefill + hidden report action on non-failed steps).
3. Clean up the 6 seed bugs after execution.

**Next step**: Create Xray ATP/ATR + 9 Cucumber Tests (plan B) → then proceed to `/sprint-testing` Stage 1.