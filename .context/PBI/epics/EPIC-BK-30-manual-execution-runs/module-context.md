# EPIC-BK-30: Manual Execution & Runs - Module Context

**Epic:** BK-30 - Manual Execution & Runs  
**Last updated:** 2026-06-22 02:42 UTC  
**Source:** BK-34 Session Start targeted exploration

## Module Purpose

Manual Execution & Runs covers the lifecycle of executing an existing Test against a Project Environment. BK-34 is the run-start entry point: create a Run, snapshot the executable Test checklist, and expose the newly created Run for execution.

## Business Scope

- Start a manual Run from an existing Test.
- Select a Project Environment before starting.
- Snapshot ordered executable steps into pending Run steps.
- Reuse an existing Run for the same Test/start token within 24 hours.
- Expose Run detail/history data to authorized Project members.

## Related Routes And Code

| Surface | Path | Relevance |
|---|---|---|
| API | `../upex-bunkai-tms/app/api/v1/runs/route.ts` | `POST /api/v1/runs`; validates payload, derives executor mode, requires `run:execute`, handles request idempotency, calls `bunkai_create_run`. |
| API | `../upex-bunkai-tms/app/api/v1/runs/[id]/route.ts` | `GET /api/v1/runs/{id}`; returns expanded Run header, run ATCs, and run steps via `bunkai_get_run_expanded`. |
| UI | `../upex-bunkai-tms/app/(app)/projects/[projectSlug]/runs/[runId]/page.tsx` | Read-only Run detail page using the same expanded Run RPC as the API read route. |
| Auth | `../upex-bunkai-tms/lib/api/principal.ts` | Resolves cookie/PAT principals; bearer callers carry PAT workspace binding and scopes. |
| Bearer | `../upex-bunkai-tms/lib/api/middleware/bearer.ts` | Validates PAT prefix/hash, expiry/revoke state, scopes, and workspace binding. |
| DB | `../upex-bunkai-tms/supabase/migrations/0031_runs.sql` | Adds `project_environments`, `runs`, `run_atcs`, `run_steps`, `bunkai_create_run`, and `bunkai_get_run_expanded`. |

## Data Model

| Entity | Role In BK-34 |
|---|---|
| `tests` | Existing Test definition used as the Run source. |
| `test_steps` | Ordered Test chain rows that identify ATCs included in the Test. |
| `atc_steps` | Executable steps copied into Run snapshots. |
| `project_environments` | Target environment selected for the Run; must belong to the Test Project. |
| `runs` | Run header with workspace, project, Test, environment, status, executor mode, start token, and Test title snapshot. |
| `run_atcs` | Per-Run snapshot of each chained ATC in source order, initial status `pending`. |
| `run_steps` | Per-Run snapshot of executable ATC steps in source order, initial status `pending`. |
| `activity_log` | Receives `run.started` audit event after successful Run creation. |

## Key Rules For Testing

- `POST /api/v1/runs` requires authentication and `run:execute` capability.
- HTTP `Idempotency-Key` is required for request replay protection; `start_token` is the domain retry token for the 24-hour same-Test window.
- Cookie sessions always derive executor mode as `human`.
- Bearer/PAT callers may send `executor_mode` as `human`, `agent`, or `ci`; omitted value defaults to `human`.
- A selected Project Environment must belong to the Test's Project.
- A Test with zero executable `atc_steps` is rejected with the run-domain `no_executable_steps` error.
- Same `test_id` + `start_token` within 24 hours returns the existing Run and should map to HTTP 200.
- A fresh Run maps to HTTP 201 and snapshots current ATC/step text/order.
- Run read paths collapse missing, foreign, or unauthorized Runs into non-disclosing not-found behavior.

## Known Open Questions From Shift-Left

- Product copy for expired `start_token` remains a clarification; current implementation creates a new Run after the 24-hour window rather than rejecting the token.
- Success UX copy/redirect should be confirmed by Design during Stage 1 if UI coverage is planned.
- BK-70 dependency was previously ignored for provisional refinement, but current Jira parent is BK-30.
