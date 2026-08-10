# BK-40 Context — TMS-Defect Filing | File a defect from a failing run step

## Story Reference
- **Key**: BK-40
- **Status**: Ready For QA (sync pending — see Open Question 1 in pre-flight-check.md)
- **Epic**: BK-31 (Bugs / Defect Heatmap)
- **Module**: Run Execution
- **TMS Modality**: jira-xray

## Pre-Flight Check
**Verdict**: CONDITIONAL-GO · **Date**: 2026-08-10 · **Report**: pre-flight-check.md · **Deferred**: none
**Xray Keys**: ATP=PENDING (plan B) · ATR=PENDING (plan B) · Env=staging
**Reporting handoff**: final ATR must embed `QA Completion Summary` with environment, result, defects, test data, AC verified behaviors, and cleanup/restoration notes where applicable.
**Bug reporting handoff**: if a follow-up defect is filed, Stage 3 must populate Jira-native Bug fields and rich ADF description; comments are supplemental only and redundant comment-only reports must be removed after confirmation.
**Expert audit handoff**: Stage 3 must publish `Expert Panel Review - Sprint Testing Audit BK-40` with green `VALIDATED` success panel when accepted, or red `FAILED`/`REJECTED`/`BLOCKED` panel when not accepted.

## Session Notes
- 2026-08-10: API verification complete against staging. 9 ATP TCs verified live: happy paths (run-linked + standalone), negatives N1-N4 (422), boundary B1 (10 evidence links), I1 (open, no Jira sync). 6 seed bugs left in staging (cleanup pending): c4c412c4, 6b49f048, c577dd24, ed0e619d, fae5bf5d, 195b5834.
- Auth: PAT-only for API (session token rejected). Test user: bunkai-staging-user@xenievzoau.resend.app. Workspace: BK-34 Sprint QA. Project: BK-34 QA Seed.
- Run-linked preconditions: run `866e6f5c` (running) has failed step `30fd6410`.
- Expert-panel review verdict: GO (CONDITIONAL-GO operative, non-blocking). 3 conditions: reconcile Jira status, cover BugFormDialog UI layer in Stage 1, clean up seed bugs.
- Pre-flight report written; plan approved by user: A (pre-flight-check.md + context.md, commit/push) → B (create Xray ATP/ATR + 9 Tests).