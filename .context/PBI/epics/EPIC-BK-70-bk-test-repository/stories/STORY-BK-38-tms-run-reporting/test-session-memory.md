# Test Session Memory: BK-38

> Shared memory across sub-agents. Each stage updates its section.
> Last updated: 2026-08-08 by Stage 2 Execution (UI/API/DB triforce + Xray)

## Ticket

- ID: BK-38
- Title: TMS-Run Reporting | Filter project runs with pass/fail totals
- Type: Story
- Priority: Medium
- Status: Ready For QA
- Story Points: - (expert panel recommends 3)
- Epic / Module: BK-70 — Test Repository / Run Reporting (synced parent epic field: BK-30 - Manual Execution & Runs)
- Assignee: jesusgpythondev
- Labels: implementation-plan-ready, shift-left-2026-06-15, shift-left-reviewed

## Story Explanation

BK-38 delivers a project-scoped Run Reporting view in the TMS. A QA Lead opens the report for a selected Project and sees every Run executed in that Project — one filterable list with rows showing Test, module, environment, executor type, status/outcome, and started date, plus live pass and fail totals. The core promise is answering "what did we execute and how did it go?" in under a minute.

Each Run stores a `test_id`, `module_id` snapshot (taken at creation), `environment`, `executor_type`, `status`, and `started_at` in Project scope. The report reads them through `GET /api/v1/projects/{projectId}/runs/report`, and rows plus totals come from the same filtered query. Pass/fail totals count only final `passed` and `failed` Runs; `running`, `blocked`, `skipped`, and `aborted` may appear in rows and status filters but never in totals. Date filtering is inclusive on `started_at` (UTC storage, Project-timezone interpretation). Distinct no-runs and no-matches empty states both render zeroed totals with no stale numbers.

QA will cover the full ATP set (BK-38-ATC-01..08): happy-path baseline, combined filters recomputing totals, empty-state zeroing, date boundary inclusion, clear-filters reset, first-use no-runs state, and cross-project data isolation. Out of scope: starting/aborting Runs (BK-34/BK-39), defect filing (BK-40..43), exports, charts, dashboards, saved views. Note for Stage 2: dev suspended live-UI/browser validation for this batch, so a normal visual pass on `/projects/{slug}/runs` (combined filters, date boundaries, empty states, cross-project isolation) is recommended since the view has not had a live-render check yet.

## Acceptance Criteria

1. QA Lead views all project Runs with totals — every authorized Run listed, each row shows Test, module, environment, executor type, status/outcome, started date; pass total equals visible Runs with status "passed"; fail total equals visible Runs with status "failed".
2. Combined filters narrow the Run list and recompute totals — date range, module, status, and executor type applied together show only Runs matching every filter; totals recalculated from the filtered set.
3. Date range boundaries are inclusive by `started_at` — Runs on the start and end dates are included, outside dates excluded, totals match included Runs.
4. Empty filter result shows zeroed totals — no-matches empty state shown, pass 0, fail 0, no stale totals remain.
5. Clearing filters restores the full project report — full Run list and unfiltered Project totals restored.
6. Project with no Runs shows first-use empty state — no-runs state shown, pass 0, fail 0, no filter error shown.
7. Unauthorized or cross-project Runs are not exposed — only current authorized Project Runs returned; no cross-project data in rows or totals.

## Team Discussion

- [Jira] jesusgpythondev (2026-06-15): QA Shift-Left Handoff Mirror — expert panel closed contract decisions: project-scoped Runs only, `GET /api/v1/projects/{projectId}/runs/report`, totals count only final passed/failed, inclusive `started_at` range (UTC storage / Project TZ), Run `module_id` snapshot, executor types human/agent/ci, 3 story points. 8 ATP rows; high-priority QA = full baseline, combined filters, stale-total prevention, cross-project isolation. Risks: stale totals, cross-project leakage, date boundary mismatch, module snapshot mismatch.
- [Jira] Ely (2026-07-30): Mockup — Test Runs index (project-wide list + filters). Source: `.context/designs/bunkai-test-management-tool/bk-30-test-runs-index/test-runs-index.html`; spec: master-design-plan §4.8.
- [Jira] Ely (2026-07-31): Workload Forecast gate resolved — chained-PR strategy `feature-branch-chain`; integration branch `feat/BK-38-runs-report` from `staging`; child PR 1 DB (migrations 0040+0041), PR 2 API (report-constants, report-validation, rpc.ts wrapper, route+openapi), PR 3 UI+Security (report-view.ts, ProjectRunsReportView.tsx, runs/page.tsx, report-isolation.test.ts), final PR integration → staging. Rationale: isolating the amendment of shipped `bunkai_create_run` RPC (Risk R-1).
- [Jira] Ely (2026-07-31): D-4 ratification — Aborted totals chip dropped from UI. Mockup draws three chips (Passed/Failed/Aborted) but `ProjectRunsReportView.tsx` renders only Passed/Failed; `bunkai_report_project_runs` (migration 0041) never computes an aborted count per Business Rule #3. Deliberate divergence recorded as D-4.
- [Jira] Ely (2026-07-31): Ready for QA — merged to `staging` via PR #69 (merge commit `d929517`); all 8 ATC rows resolve to `covered` in Spec Compliance Matrix; Stage 3 adversarial review APPROVE WITH NITS, 0 BLOCKER/MAJOR. Live-UI/browser validation was suspended for this batch; recommends normal pass on `/projects/{slug}/runs` (combined filters, date boundaries, empty states, cross-project isolation).
- (Bot noise skipped: Automation for Jira PR-created / PR-merged notices.)

## Environment

- Web: `https://staging-upexbunkai.vercel.app` | API: `https://staging-upexbunkai.vercel.app/api`
- WEB_URL_OVERRIDE: none
- API_URL_OVERRIDE: none
- DB MCP: dbhub | API MCP: staging-openapi

## Test Data

- Seeded during Stage 2 (2026-08-08): **58 Runs** across 2 controlled Tests in Project `bk-38-final-report-project` (workspace `988e342e-28a7-49d1-b254-4cd44226ad71`):
  - 7 runs via `seed-bk38-v2.mjs` (mixed statuses, both modules)
  - +1 run from first failed `seed-50-runs.mjs` attempt (threw after 1 creation — not an orphan)
  - +50 runs via successful `seed-50-runs.mjs` (25× Test A / 25× Test B)
  - Final distribution: `running=53, passed=2, failed=2, aborted=1`; Test A=30, Test B=28 APIs; all created/started 2026-08-08T08:45–20:48Z.
  - DB confirms 58 runs belong exclusively to project `9611b8f3-1eb8-427f-b585-b5d265668b0c` (0 leaks).
  - Dedicated isolation/no-runs project `bk-38-atc06-empty` (id `fc8212d5-5382-4499-bcb3-7c0338a2b3dc`) has the same 2 tests but **0 runs**.
- Seed scripts: `/tmp/seed-bk38-v2.mjs`, `/tmp/seed-50-runs.mjs`; final state `/tmp/bk38-final-state.json`; PAT `/tmp/bk-pat.txt`; UI creds `/tmp/bk-ui-email`, `/tmp/bk-ui-pw`.

## Repositories

- Backend: `../upex-bunkai-tms` (Next.js + Supabase + Vercel, entry `../upex-bunkai-tms/.`)
- Frontend: `../upex-bunkai-tms` (Next.js, entry `../upex-bunkai-tms/.`)

## Code Locations

### Backend (`../upex-bunkai-tms`)

- `app/api/v1/projects/[projectId]/runs/report/route.ts` (expected) — Run reporting endpoint; rows, totals, applied filters, pagination from one query contract.
- `lib/runs/` — report-constants.ts, report-validation.ts, rpc.ts wrapper.
- Amended shipped RPCs: `bunkai_create_run` / `bunkai_run_json` (migrations 0040) — Risk R-1, now under chained-PR review.
- `bunkai_report_project_runs` (migration 0041) — report RPC; no aborted count per Business Rule #3.

### Frontend (`../upex-bunkai-tms`)

- `app/(app)/projects/[projectSlug]/runs/page.tsx` — Run Reporting view.
- `ProjectRunsReportView.tsx` — renders Passed/Failed chips only (D-4).
- `report-view.ts` — data/UI contract.

### Database (Supabase Postgres)

- `supabase/migrations/0040_*.sql`, `0041_*.sql` — Runs reporting schema + report RPC.
- Prior foundation: `supabase/migrations/0024_tests.sql`, `0031_runs.sql`.

## TMS Artifacts

| Type | ID | Name | Status |
|------|----|------|--------|
| ATP  | BK-318 | [ATP] BK-38 — TMS-Run Reporting | READY (transition 21) |
| ATR  | BK-319 | [ATR] BK-38 — TMS-Run Reporting | ACTIVE |
| TC   | BK-320..BK-327 | 8 Cucumber Tests (BK-38-ATC-01..08) | SYNCED |

## Paths

- PBI: `.context/PBI/epics/EPIC-BK-70-bk-test-repository/stories/STORY-BK-38-tms-run-reporting/`
- Module Context: `.context/PBI/epics/EPIC-BK-70-bk-test-repository/module-context.md`
- Synced ticket cache (live Jira parent BK-30): `.context/PBI/epics/EPIC-BK-30-manual-execution-runs/stories/STORY-BK-38-tms-run-reporting-filter-project-runs-with-pass-fa/`

## Stage Results

### Session Start

- Status: completed locally; awaiting orchestrator presentation and user confirmation before Stage 1.
- Jira detail synced read-only with `bun run jira:sync-issues get BK-38 --include-comments` (story.md + comments.md).
- Pre-flight verdict GO (2026-08-08) consumed: 8 claimed → 8 executable → 0 new ACs → 0 deferred; smoke subset ATC-01/02/03/07; ATP BK-318, ATR BK-319, Test Environment staging.
- Project context, business maps, domain glossary, synced story/comments, pre-flight, and targeted code locations read.
- PBI folder, module context, story context, test-session memory, and evidence directory initialized.

### Planning

- Status: completed locally (2026-08-08).
- Veto/risk decision tree: Story (not Bug) — no veto; full ATP produced.
- Risk distribution per ATC (priority triage): **P0 ×4** (ATC-01 Happy baseline, ATC-02 Filter contract, ATC-03 Empty state & stale totals, ATC-07 Cross-project isolation), **P1 ×3** (ATC-04 Date boundary, ATC-05 Reset, ATC-06 No-runs state), **P2 ×1** (ATC-08 Performance/scalability).
- Verified pre-existing Xray artifacts (modality jira-xray) — do NOT create new issues:
  - ATP **BK-318** (Test Plan, status **READY**, transition 21 applied) — description contains full ATC Coverage table (8 rows) + Business Rules (9) + Linked Story + Parent. Body verified complete.
  - ATR **BK-319** (Test Execution, status **ACTIVE**) — 8 test runs, all `[TO DO]`.
  - Tests **BK-320..BK-327** — 8 Cucumber, one per ATC, all non-empty Gherkin.
- Traceability: `xray plan sync --plan BK-318` → Jira-layer 8 / Xray-layer 8 **in sync**.
- Smoke subset for Stage 2: **ATC-01, ATC-02, ATC-03, ATC-07** (4/8).
- Test Environment: status <env> — against staging.
- AC coverage: 8/8 ATCs cover all 7 ACs; 0 new ACs, 0 deferred, 0 AC gaps.

### Execution

- Status: completed locally (2026-08-08) — API matrix + UI (live browser) + DB triforce; all 8 ATCs **PASS**; no defects.
- **API matrix** (via `/api/v1/projects/{projectId}/runs/report` + PAT): baseline 58 w/ totals Passed 2 / Failed 2; combined filters AND-contract recompute totals; empty result → 0 rows / 0 totals; date range inclusive on `started_at`; cross-project isolation (404 + only project rows); pagination limit=50 + cursor → stable totals across pages.
- **UI verification** (staging SPA, logged in as staging user via Supabase email/password; route `/projects/bk-38-final-report-project/runs`):
  - ATC-01 baseline: 2 Passed / 2 Failed, "50 runs loaded in current scope · more available".
  - ATC-02 combined filter Module=Alpha Orbits + Status=Failed → 1 row (`f0dca598`, Test A / CI / Agent / Failed), Passed 0 / Failed 1, "2 filters active" — matches API AND.
  - ATC-03 date range 2026-08-10..12 → 0 runs, Passed 0 / Failed 0 (no stale totals).
  - ATC-04 date 2026-08-08..08-08 (single day, inclusive) → full set, 50 loaded, totals 2/2.
  - ATC-05 status=Failed then Clear filters → full list + totals 2/2 restored.
  - ATC-06 `bk-38-atc06-empty` project → "No runs yet for this Project", 0 runs, 0/0.
  - ATC-07 same tests in `bk-38-atc06-empty` show 0 runs → cross-project isolation confirmed visually + DB.
  - ATC-08 "Load older runs" paginates 50 → 58 in scope, totals stable 2/2.
  - UI test-ids seen: `report-filter-date-from`, `report-filter-date-to`, `report-filter-module`, `report-status-passed/failed/aborted`, `report-executor-*`, `report-clear-filters`, `report-scope-label`, `report-load-older`.
- Evidence screenshots saved to `evidence/`: `ATC-01-runs-list-baseline.png`, `ATC-02-module-status-filter.png`, `ATC-03-empty-state.png`, `ATC-04-date-boundary-inclusive.png`, `ATC-05-clear-filters-reset.png`, `ATC-06-empty-project-state.png`, `ATC-07-isolation-empty-project.png` (captured real-browser from `bk-38-atc06-empty/runs` — same tests, 0 runs / 0-0 totals, proving project-scoped isolation), `ATC-08-pagination-58-runs.png`.
- **Xray ATR update**: done (2026-08-08 once unpacked) — all 8 runs `BK-320..BK-327` synced to `PASSED` with step comments; evidence attached per run (run IDs `6a7755124fb697e1baa7b8e5..ec`). ATC-07 run (BK-326, id `6a7755124fb697e1baa7b8eb`) holds `ATC-07-isolation-empty-project.png`.
- Environment re-verified this session before finalize: health `{"ok":true,"env":"staging"}`; API empty-project report → `{"items":[],"totals":{"failed":0,"passed":0}}` HTTP 200; foreign project → `404 not_found`; DB `bk-38-final-report-project` = 58 runs (running 53, passed 2, failed 2, aborted 1), `bk-38-atc06-empty` = 0. Matches seeded state exactly.

## Bugs Found

- None confirmed. All 8 ATCs PASS in UI, API, and DB. No cross-project leakage, no stale totals, no date-boundary defects, no empty-state regressions.

## Observations

- Sync placed the story under `EPIC-BK-30-manual-execution-runs` because the live Jira parent epic field is BK-30 (Manual Execution & Runs), while the hand-authored PBI folder and this memory use the resolved module epic BK-70 (Test Repository / Run Reporting). The BK-70 folder is canonical for this session per resolved variables; the BK-30 synced cache is the ticket source of truth.
- `module-context.md` was missing under EPIC-BK-70; created from the template with verified code locations (report route, RPC, migrations 0040/0041, report-view constants/validation, ProjectRunsReportView, run-report/isolation tests).
- Dev recorded D-4 divergence (Aborted chip dropped) — do not flag Aborted chip absence as a defect.
- Dev suspended live-UI validation this batch; recommend a real visual pass on `/projects/{slug}/runs` in Stage 2.
- Jira/sync markdown renders some identifiers with underscores as emphasis (e.g. `bunkai*create*run`) — treat as formatting debt; source of truth is the canonical description.

## Checklist

### Session Start

- [x] Ticket + comments fetched
- [x] Project context loaded
- [x] Module context loaded or created
- [x] Code explored (backend + frontend as applicable)
- [x] Test data candidates identified
- [x] PBI folder + context.md + test-session-memory.md created
- [x] Story Explanation written
- [ ] Playwright config set (N/A in Session Start; no UI execution yet)

### Planning

- [x] ATP verified/finalized (BK-318, 8 ATC rows)
- [x] ATR present with 8 linked tests (BK-319, runs TO DO)
- [x] TC nomenclature applied per ATC (BK-38-ATC-01..08)
- [x] Variables + test data identified (seed via API/DB in Stage 2)
- [x] Traceability verified (plan sync in sync)
- [x] Ready for execution testing (smoke ATC-01/02/03/07)

### Reporting (Stage 3)

- [x] ATR BK-319 re-verified this session: execution status PASS, 8/8 test runs PASSED (BK-320..BK-327) with per-run step comments + evidence screenshots
- [x] Story BK-38 at status Ready For QA → transitions already applied in Jira changelog (2026-08-08 18:23-24, Ready For QA → In Test → QA Approved) — recorded, no re-run
- [x] QA Completion Summary comment published on BK-38 (Jira comment ID 12246) — Field/Value header + AC→ATC mapping table (7/7) via ADF
- [x] test-report.md finalized with QA Completion Summary mirror section
- [x] context.md status synced to QA Approved
- [ ] (pre-flight handoff, out of Stage-3 scope this run) Expert Panel Review audit comment `Expert Panel Review - Sprint Testing Audit BK-38` — SKIPPED, was not in scope of the reporting interrupt; no panel verdict created (no fabrication)
