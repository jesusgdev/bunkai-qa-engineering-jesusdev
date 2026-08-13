# BK-40 Test Cases — TMS-Defect Filing

**Story**: BK-40 — TMS-Defect Filing | File a defect from a failing run step
**Epic**: BK-31 (Bugs/Defect Heatmap)
**Modality**: jira-xray
**Test Set**: BK-402 (Test Set: BK-31 Bugs & Defect Heatmap)
**ATP**: BK-347 (Test Plan)
**ATR**: BK-348 (Test Execution, env=staging)

## Test Cases (9 — all Candidate)

| Key | ATP | Gherkin | Status |
|---|---|---|---|
| BK-338 | ATP-P1 | Happy Path — Run-linked form (prefill context server-derived) | Candidate |
| BK-339 | ATP-P2 | Happy Path — Save run-linked defect (201 with run/step/ATC/module) | Candidate |
| BK-340 | ATP-P3 | Happy Path — Save standalone defect (201 with explicit project+module) | Candidate |
| BK-341 | ATP-N1 | Negative — Non-failed step action (422 run_step_not_failed) | Candidate |
| BK-342 | ATP-N2 | Negative — Invalid title length (422 title 5-200) | Candidate |
| BK-343 | ATP-N3 | Negative — Missing/cross-project module (422 module not in project) | Candidate |
| BK-344 | ATP-N4 | Negative — Invalid severity (422 invalid_value, P1-P4) | Candidate |
| BK-345 | ATP-B1 | Boundary — Evidence limit (10 accepted, 11th blocked) | Candidate |
| BK-346 | ATP-I1 | Integration — No Jira sync (TMS-native defect, open state) | Candidate |

## Regression Plan

**BK-402** (Test Set: BK-31 Bugs & Defect Heatmap) — 9/9 Candidate

## Traceability

- Story → ATP (is tested by): BK-40 → BK-347
- Story → ATR (is tested by): BK-40 → BK-348
- ATP → Tests (Test Design): BK-347 → BK-338…346
- ATR → Tests (Test Execute): BK-348 → BK-338…346
