# Run Reporting - Module Context

**Last Updated:** 2026-08-08
**Stories Tested:** 1 (BK-38)

---

## Overview

**Description:** The TMS Run Reporting module lets a QA Lead view and filter all Runs executed in a Project (by date range, module, status, executor type) with live pass/fail totals recomputed from the currently filtered set. Consumes Runs created by BK-34/BK-39 execution flows and the module snapshot added in migration 0040.

**Business Domain:** Test Management / Execution Reporting

**Primary Actors:** QA Lead, workspace members with Project read access (viewers included)

---

## Routes (Frontend)

| Route | Path | Description |
|-------|------|-------------|
| Run Reporting index | `app/(app)/projects/[projectSlug]/runs/page.tsx` | Project-wide Run list + filters + totals |
| Run detail | `app/(app)/projects/[projectSlug]/runs/[runId]/page.tsx` | Individual Run detail (BK-34 sibling surface) |
| Test runs history | `app/(app)/projects/[projectSlug]/tests/[testId]/runs/page.tsx` | Per-Test run history (BK-37 sibling, all-time totals convention) |

---

## State Management (Frontend)

| State File | Path | Purpose |
|------------|------|---------|
| Report view contract | `lib/runs/report-view.ts` | Client data contract + status mapping (passed→pass, failed→fail) |
| Report screen component | `components/runs/ProjectRunsReportView.tsx` | Renders Passed/Failed chip totals only (Divergence D-4 — no Aborted chip) |

---

## API Endpoints

| Endpoint | Method | Controller/Handler | Purpose |
|----------|--------|-------------------|---------|
| `/api/v1/projects/{id}/runs/report` | GET | `app/api/v1/projects/[id]/runs/report/route.ts` | Filtered Project Runs report: rows, date range, module, status, total, filters, pagination, totals from same filtered set |

---

## Database Tables

| Table | Primary Use | Key Columns |
|-------|-------------|-------------|
| `runs` | Run execution instances (basis for reporting) | `id`, `project_id`, `test_id`, `test_title`, `module_id` (0040 snapshot), `environment_id`, `executor_mode`, `status`, `started_at`, `finished_at` |
| `run_atcs` | Run ATC chain (module snapshot source) | `run_id`, `atc_id`, `position` |

**Migration map:** `0040_run_module_snapshot.sql` (module snapshot: `runs.module_id` + re-created `bunkai_create_run` / `bunkai_run_json`), `0041_run_project_report.sql` (report RPC `bunkai_report_project_runs` + covering index).

---

## Business Rules

| Rule | Description | Source |
|------|-------------|--------|
| Reporting scope | Project-scoped Runs only; no cross-project rows or totals | BK-38 AC / Key Contract Decision |
| Same-query totals | Rows and totals calculated from the same filtered query | BK-38 Business Rule #2; enforced by `bunkai_report_project_runs` D2 |
| Totals semantics | Pass/fail totals count only final `passed`/`failed` Runs; `running`/`blocked`/`skipped`/`aborted` may appear in rows but not totals | Business Rule #3 |
| Date boundaries | Inclusive `started_at` UTC-calendar-day range; `date_to < date_from` rejected 422 | Technical Decision D3 |
| Status filter | `REPORT_STATUS_VALUES = passed/failed/aborted`; `running` is a row but never a filter target | Technical Decision D4 / D-1 |
| Module snapshot | Each Run stores `module_id` at creation (modify of the first position of the chain) | Technical Decision D1 |
| Executor enum | `human`, `agent`, `ci` | BK-34 / report-constants |
| Empty states | No-runs vs no-matches distinct empty states, both totalled to 0 | AC 4/6 |
| Isolation | Cross-project Runs excluded; project-scope is the primary gate; missing/foreign/foreign-workspace collapse to identical 404 | BK-38-ATC-07 / SEC-1 |

---

## Key Entities for Testing

| Entity Type | Name | ID | Use Case |
|-------------|------|-----|----------|
| Project | Seed project | `{from Stage 2}` | Report baseline + filtering |
| Runs | Mixed passed/failed with varied dates/modules/executors | `{Stage 2 seeded}` | Totals recompute, date boundaries |
| Project (empty) | No Runs | `{Stage 2 seeded}` | No-runs empty state |
| Foreign Project | Cross-project Runs | `{Stage 2 seeded}` | Data isolation Mappings |

---

## Common Test Scenarios

| Scenario | Preconditions | Steps | Expected |
|----------|---------------|-------|----------|
| Health/critical baseline | Project with mixed passed/failed Runs | Open report | All rows; pass/fail totals = visible counts |
| Combined filters | Multiple dates/modules/status/executors | Apply date range + module + status + executor together | Only every-match rows; totals recomputed |
| Date boundaries | Runs before/inside/on/after range | Filter by range | Inclusive start/end; outside excluded |
| Empty result | Runs exist | Filter to no-match | Zeroed totals, no stale |
| Clear filters | Active filters | Clear all | Full list + unfiltered totals |
| No Runs | Empty Project | Open report | No-runs empty state, 0/0 |
| Cross-project | Other Project Runs | Read current project report | No leakage in rows or totals |

---

## Stories in This Module

| Story | Title | Status | Link |
|-------|-------|--------|------|
| BK-38 | TMS-Run Reporting | Filter project runs with pass/fail totals | Ready For QA | [context](./STORY-BK-38-tms-run-reporting/context.md) |

---

## Notes

- The live Jira parent epic for BK-38 is BK-30 (Manual Execution & Runs); this module folder lives under **EPIC-BK-70-bk-test-repository** per resolved session variables. The BK-30 synced cache holds the ticket files; BK-70 is the canonical hand-authored PBI tree.
- Draft AC/ATP/TC Xray artifacts are SYNCED: ATP BK-318, ATR BK-319, TCs BK-320..BK-327.
- D-4 divergence sanctioned: UI shows only Passed/Failed chips; `bunkai_report_project_runs` never computes an aborted count. Do not file Aborted-chip absence as a defect.
- Dev suspended live-UI validation this batch — recommend a true visual pass on `/projects/{slug}/runs` in Stage 2.