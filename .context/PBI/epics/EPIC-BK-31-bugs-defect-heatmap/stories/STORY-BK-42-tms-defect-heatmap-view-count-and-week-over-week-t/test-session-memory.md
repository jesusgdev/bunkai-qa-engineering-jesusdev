# Test Session Memory: BK-42

> Shared memory across sub-agents. Each stage updates its section.
> Last updated: 2026-08-11 by Stage 1 Planning

## Ticket

- ID: BK-42
- Title: TMS-Defect Heatmap | View count and week-over-week trend per module
- Type: Story
- Priority: Medium
- Status: In Test (2026-08-11, transition `start_testing` id 9; previously Ready For QA 10007)
- Story Points: -
- Epic / Module: BK-31 — Bugs / Defect Heatmap
- Assignee: jesusgpythondev
- QA Assignee: jesusgpythondev (`customfield_10070`, accountId `712020:e05222c4-5a86-4d83-b62e-e1795047c0ff`)
- Labels: -

## Story Explanation

BK-42 delivers the TMS Defect Heatmap: a QA Lead opens `/projects/{projectSlug}/bugs` and sees the Defect Heatmap view — one grid per module showing the defect count and the week-over-week trend. The core promise is answering "which modules are accumulating defects right now, and is each trending up or down?" at a glance.

Data flows through `GET /api/v1/projects/{id}/bugs/heatmap`, which runs a live unpaged RPC `bunkai_report_project_defect_heatmap` (migration 0052). It reads a `window` query param (`7d|30d|90d`, default `30d`; unsupported value → 400 `bad_request`), counts defects per active module (archived subtrees excluded, `archived_at is null`) in a UTC `[start, end)` window ending at `now()`, and compares the latest 7-day bucket vs the previous 7-day bucket for the trend. Trend is rendered as a word + delta + icon label; `trend_pct` is nullable when the previous baseline is zero (no Infinity). Heat tiers: Clean 0 / Low 1-2 / Elevated 3-4 / Hotspot 5+. `generated_at=now()` beats the 5s freshness SLA (no materialized view — ratified). Security: unauthenticated → 401; unauthorized project access collapses to identical 404 `not_found` (AC-11 ratified 2026-08-01, TC BK-369 already asserts 404).

QA will cover the full ATP set (ATP-1..20): count & window defaults + switching, UTC boundaries, trend states (rising/falling/flat/null-baseline), module hierarchy rollup, visual/a11y, freshness, 401/404 security, and 400 on unsupported window. Out of scope: exporting, charts beyond the grid, saved views.

## Acceptance Criteria

1. QA Lead sees default heatmap — active modules shown with defect counts in the `30d` window, one cell per module.
2. Switching `7d/30d/90d` updates counts per window.
3. Archived modules/subtrees are excluded.
4. UTC `[start, end)` half-open window; start included (`>= v_window_start`).
5. End boundary is now (excluded).
6. Rising trend + positive percent shown.
7. Falling trend + negative percent shown.
8. Prev 0 / curr > 0 → rising, `pct: null` (no Infinity).
9. 0/0 → flat, `pct: 0`.
10. Curr 0 / prev > 0 → falling, `pct: -100`.
11. Parent module rollup via path-prefix LIKE (subtree_bugs CTE).
12. Child keeps its own non-collapsed cell.
13. Hotspot never color-only — count text, tag, legend, accessible names.
14. Trend exposed as word + delta + icon label.
15. Full `module_path` disambiguates duplicate nested names.
16. Live RPC, no MV (ratified) — new bug visible on next read, beats 5s SLA.
17. `generated_at` returned and rendered ("as of" stamp).
18. Unauthenticated → 401 (`auth: 'required'`).
19. Unauthorized project → identical 404 `not_found` (non-disclosure, P0002).
20. Unsupported window (`365d`) → 400 `bad_request`.

## Team Discussion

- [Jira] PO + Dev (2026-08-01): AC-11 Ratification — literal 403 for unauthorized access **rejected**; non-disclosure collapses to identical 404 `not_found` (P0002), same as Coverage/Recovery-cycle siblings.
- [Jira] Dev: No materialized view / stats substrate (ratified) — live unpaged aggregate RPC; freshness via `generated_at=now()` beats the 5s SLA.

## Environment

- Web: `https://staging-upexbunkai.vercel.app` | API: `https://staging-upexbunkai.vercel.app/api`
- WEB_URL_OVERRIDE: none
- API_URL_OVERRIDE: none
- DB MCP: dbhub | API MCP: staging-openapi
- Health probe: `GET /api/health` → `{"ok":true,"env":"staging"}`

## Test Data

- Staging DB live: 98 bugs (all with project), 329 active modules, 78 projects.
- **Positives (ATP-1..17, 20)**: Project `d75e73ac-b42a-487e-99e8-ac55859fc392` (BK-34 QA Seed, workspace "BK-34 Sprint QA", owner role) — 9 bugs inside 7d/30d/90d windows → 200 OK. Live payload verified (30d): 2 items — `2edff842` "BK-39 QA 1782431888836" (path `bk-39-qa-1782431888836`, count 3, heat `elevated`, rising, delta 3, pct null); `c9e05a37` "Run Execution" (path `run-execution`, count 6, heat `hotspot`, rising, delta 6, pct null).
- **ATP-19 (404)**: Project `e207917d-...` (Prueba QA, workspace open-source) — staging user NOT a member → 404 `not_found`. Verified: e207917d returns 404 for the staging user while d75e73ac (member) returns 200.
- **ATP-18 (401)**: no auth token → 401.
- Auth: staging login only via legacy user `STAGING_USER_EMAIL` (`bunkai-staging-user@xenievzoau.resend.app`); role-scoped accounts return 401. Token minted: `bk_pat_kFPFJ0aqvYYF...` (len 51) → user `5441e8c1-3315-4f5e-b678-735f02841488` (token id `60f9425c-4c9e-4861-a409-71e1b0b8b809`).

## Repositories

- Backend: `../upex-bunkai-tms` (Next.js + Supabase + Vercel, entry `../upex-bunkai-tms/.`)
- Frontend: `../upex-bunkai-tms` (Next.js, entry `../upex-bunkai-tms/.`)

## Code Locations

### Backend (`../upex-bunkai-tms`)

- `app/api/v1/projects/[id]/bugs/heatmap/route.ts` — heatmap endpoint; `window` param enum `7d|30d|90d` (default `30d`), unsupported → 400 `bad_request`; auth required → 401; non-disclosure → 404 `not_found` (P0002).
- RPC `bunkai_report_project_defect_heatmap` (migration `0052_defect_heatmap_report.sql`) — live unpaged aggregate; window `[start, end)` UTC half-open; `subtree_bugs` CTE path-prefix LIKE rollup; `archived_at is null`; trend via 7-day bucket comparison; `trend_pct` nullable on zero baseline.

### Frontend (`../upex-bunkai-tms`)

- `app/(app)/projects/[projectSlug]/bugs/page.tsx` — Bugs page with List/Heatmap toggle.
- `BugsHeatmapView.tsx` — heatmap grid; count text + tag + legend + accessible names (never color-only); trend word + delta + icon; "as of" generated_at stamp; full `module_path` disambiguation.

### Database (Supabase Postgres)

- `supabase/migrations/0052_defect_heatmap_report.sql` — heatmap RPC.
- Live (DBHub): no `users` table (auth via Supabase); `access_tokens` stores `token_prefix` (12 first chars, indexed); `workspace_members` pkey `(user_id, workspace_id)` with role/status/joined_at.

## TMS Artifacts

| Type | ID | Name | Status |
|------|----|------|--------|
| ATP  | BK-349 | [ATP] BK-42 — TMS-Defect Heatmap | READY (Test Plan, Issue 12333) |
| ATR  | BK-350 | [ATR] BK-42 — TMS-Defect Heatmap | ACTIVE (Test Execution, Issue 12334, env=staging) |
| TC   | BK-351..BK-370 | 20 Cucumber Tests (ATP-1..20, Issue IDs 12335–12354) | Draft |

Traceability: 20× Test Design (BK-349→BK-351…370), 20× Test Execute (BK-350→BK-351…370), 2× Test (BK-349→BK-42, BK-350→BK-42). ATR runs verified in sync: `6a7a76474fb697e1bab23f17..2a` → BK-351…370, all `[TO DO]`. TCs are generic Cucumber (no hardcoded project IDs) → test-data reconciliation is an execution note, not a TC edit. TC BK-369 (ATP-19) already asserts `Then 404 not_found is returned`.

## Paths

- PBI: `.context/PBI/epics/EPIC-BK-31-bugs-defect-heatmap/stories/STORY-BK-42-tms-defect-heatmap-view-count-and-week-over-week-t/`
- Module Context: `.context/PBI/epics/EPIC-BK-31-bugs-defect-heatmap/module-context.md`
- Pre-flight: `pre-flight-check.md` (verdict GO, 2026-08-11)
- Session: `.session/sprint-testing/BK-42/plan.md` + `progress.md`

## Stage Results

### Session Start

- Status: completed locally; story explanation presented and approved by user (2026-08-11, "arranca").
- Jira detail synced read-only with `bun run jira:sync-issues get BK-42` (story.md, acceptance-test-plan.md, comments.md).
- Pre-flight verdict GO (updated 2026-08-11) consumed: 20 claimed → 20 executable → 0 new ACs → 0 STALE → 0 deferred; smoke subset ATP-1/6/11/16/18/20.
- PBI folder, context, pre-flight, code locations read; test-session memory + evidence directory initialized.

### Planning

- Status: completed locally (2026-08-11).
- Veto/risk decision tree: Story (not Bug) — no veto; full ATP produced.
- Risk distribution per ATP (priority triage): **P0 ×5** (ATP-1 Default 30d, ATP-6 Trend rising, ATP-11 Rollup, ATP-16 Freshness, ATP-19 404 non-disclosure), **P1 ×8** (ATP-2 window switch, ATP-3 archived, ATP-4/5 boundaries, ATP-7/8/9/10 trend states), **P2 ×7** (ATP-12 child cell, ATP-13/14/15 a11y, ATP-17 stamp, ATP-18 401, ATP-20 400).
- Xray artifacts verified (modality jira-xray) — no new issues created:
  - ATP **BK-349** (Test Plan) — description contains ATC Coverage table (20 rows); linked to BK-42.
  - ATR **BK-350** (Test Execution, status ACTIVE) — 20 test runs, all `[TO DO]`.
  - Tests **BK-351..BK-370** — 20 Cucumber, one per ATP, executable + generic.
- Traceability: ATR runs in sync (20/20 `[TO DO]`), no drift from Jira fallback.
- Smoke subset for Stage 2: **ATP-1, ATP-6, ATP-11, ATP-16, ATP-18, ATP-20** (6/20, 30%).
- Test Environment: staging (status In Test).
- AC coverage: 20/20 ATCs cover all ACs; 0 new ACs, 0 deferred, 0 AC gaps.
- BK-42 transitioned Ready For QA → In Test (2026-08-11, transition id 9); `qa_assignee` = jesusgpythondev already set (`customfield_10070`), slug `qa_assignee` added to `.agents/jira-fields.json` (catalog was stale — field existed in Jira as `customfield_10070`).

### Execution

- Status: pending (Stage 2).

## Bugs Found

- None yet (Stage 2 pending).

## Observations

- `.agents/jira-workflows.json` story status IDs are stale vs live Jira (catalog: `in_test`=10134, `ready_for_qa`=10100; live: In Test=10041, Ready For QA=10007). Transitions by id (e.g. `start_testing`=9) match. No admin permission to re-sync (`bun run jira:sync-workflows` → `JIRA_SYNC_SKIPPED_NO_ADMIN`); catalog stays as committed boilerplate, REST live is source of truth during execution.
- `qa_assignee` was missing from `.agents/jira-fields.json` (catalog stale); added with real Jira id `customfield_10070`.
- Test-data reconciliation refines the pre-flight: e207917d (open-source workspace) is now the **ATP-19 negative target** (staging user not a member → 404), not a positive target.

## Checklist

### Session Start

- [x] Ticket + comments fetched
- [x] Project context loaded
- [x] Module context loaded or created
- [x] Code explored (backend + frontend as applicable)
- [x] Test data candidates identified
- [x] PBI folder + context.md + test-session-memory.md created
- [x] Story Explanation written and approved
- [ ] Playwright config set (N/A in Session Start; no UI execution yet)

### Planning

- [x] ATP verified/finalized (BK-349, 20 ATC rows)
- [x] ATR present with 20 linked tests (BK-350, runs TO DO)
- [x] TC nomenclature applied per ATP (BK-351..370 = ATP-1..20)
- [x] Variables + test data identified (d75e73ac positives; e207917d ATP-19; no-auth ATP-18)
- [x] Traceability verified (ATR runs in sync, no drift)
- [x] Ready for execution testing (smoke ATP-1/6/11/16/18/20)
- [x] BK-42 in In Test; qa_assignee bound

### Reporting (Stage 3)

- [ ] ATR BK-350 runs updated to PASSED/FAILED with step comments
- [ ] Story BK-42 → QA Approved transition
- [ ] QA Completion Summary comment published
- [ ] test-report.md finalized
- [ ] Expert Panel Review audit comment `Expert Panel Review - Sprint Testing Audit BK-42`
