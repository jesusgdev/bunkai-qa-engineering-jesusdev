# Test Analysis - BK-39

## Story

TMS-Run Execution | Finish a run with a final verdict.

## Scope

Validate that an in-progress Run can be finished with `passed` or `failed`, stamps `finished_at`, skips pending steps, blocks invalid/terminal finish attempts, and exposes the final verdict in UI/API/DB.

## Test Data

| Entity | ID / Value | Notes |
|---|---|---|
| Workspace | `545d5efe-a168-4f32-a4be-a148a2fc96db` | Active workspace from `/api/v1/me`; role `owner`. |
| Project | `d75e73ac-b42a-487e-99e8-ac55859fc392` | `BK-34 QA Seed 20260622020420`. |
| Environment | `e905be94-512c-4e75-af29-8430eebb9ab1` | `Staging`. |
| Test | `174d3ad2-89d0-49b0-aafa-469d0b11d9a0` | Created for BK-39 fixture; chained to ATC `868229e0-d54c-4dcb-abe3-9008e2ee1d8d`. |

## Planned Coverage

| TC | Target | Surface | Result |
|---|---|---|---|
| BK-39-ATC-01 | Finish running Run with `passed`; final verdict and finish time visible | UI + API + DB | PASS |
| BK-39-ATC-02 | Pending steps become `skipped` | API + DB | PASS |
| BK-39-ATC-03 | Already-executed results preserved | API + DB | NOT RUN - no public step-result update endpoint available in this scope |
| BK-39-ATC-04 | Missing final verdict blocked; no mutation | API | PASS |
| BK-39-ATC-05 | Finished Run cannot be finished again | API + DB | PASS |
| BK-39-ATC-06 | Concurrent finish attempts are first-wins | API + DB | PASS |
| BK-39-ATC-07 | Human/agent/ci finish handling consistent | API | PASS for finish endpoint; follow-up on Bearer start-run workspace resolution |
| BK-39-ATC-08 | Pending-step warning/confirmation before finish | UI | PASS |
| BK-39-ATC-09 | Failed verdict does not require defect | API contract | PASS by implementation scope; defect lifecycle untouched |

## Risk Notes

- `POST /api/v1/runs` with Bearer failed with `No active workspace could be resolved for this request`; cookie-session run creation works. This is now tracked as BK-182 and is not a BK-39 finish failure.
- BK-39 finish endpoint itself works with Bearer `run:execute` on an existing Run.
