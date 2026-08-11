# Pre-Flight Check — BK-42

**Verdict**: CONDITIONAL-GO
**Date**: 2026-08-10
**Story**: TMS-Defect Heatmap | View count and week-over-week trend per module

## ATP Reconciliation

| TC | Group | Status | Notes |
|---|---|---|---|
| ATP-1 | Positive — Count & Window | SYNCED | Default `30d` + one cell per active module, verified in route/RPC |
| ATP-2 | Positive — Count & Window | SYNCED | `7d/30d/90d` switch updates counts (`parseWindow`) |
| ATP-3 | Boundary — Count & Window | SYNCED | Archived modules/subtrees hidden (`archived_at is null`) |
| ATP-4 | Boundary — Count & Window | SYNCED | UTC `[start, end)` half-open; start included (`>= v_window_start`) |
| ATP-5 | Boundary — Count & Window | SYNCED | End boundary excluded (`now()` as end) |
| ATP-6 | Trend | SYNCED | Rising + positive percent (`computeDefectTrend`) |
| ATP-7 | Trend | SYNCED | Falling + negative percent |
| ATP-8 | Trend | SYNCED | Prev 0 / curr > 0 → rising, `pct: null` (no Infinity) |
| ATP-9 | Trend | SYNCED | 0/0 → flat, `pct: 0` |
| ATP-10 | Trend | SYNCED | Curr 0 / prev > 0 → falling, `pct: -100` |
| ATP-11 | Module hierarchy | SYNCED | Parent rollup via path-prefix LIKE (subtree_bugs CTE) |
| ATP-12 | Module hierarchy | SYNCED | Child keeps own non-collapsed cell (left join counts) |
| ATP-13 | Visual / a11y | SYNCED | Hotspot never color-only — count text, tag, legend, accessible names |
| ATP-14 | Visual / a11y | SYNCED | Trend exposed as word + delta + icon label |
| ATP-15 | Visual / a11y | SYNCED | Full `module_path` disambiguates duplicate nested names |
| ATP-16 | Integration — Freshness | SYNCED | Live RPC, no MV (ratified) — new bug visible on next read, beats 5s SLA |
| ATP-17 | Integration — Freshness | SYNCED | `generated_at` returned and rendered ("as of" stamp) |
| ATP-18 | Security | SYNCED | Unauthenticated → 401 (`auth: 'required'`) |
| ATP-19 | Security | STALE | AC-11 ratified 2026-08-01: literal 403 rejected → non-disclosure collapses to 404 `not_found`; update expected result before Stage 1 |
| ATP-20 | Negative | SYNCED | Unsupported window (`365d`) → 400 `bad_request` |

**Summary**: 20 claimed → 20 executable → 0 new ACs → 1 STALE (ATP-19, expected result update only) → 0 deferred

## Modality

**Modality**: jira-xray

## Xray Entity Keys

| Key | Value |
|---|---|
| ATP (Test Plan) | **BK-349** `[ATP] BK-42 — TMS-Defect Heatmap | View count and week-over-week trend per module` |
| ATR (Test Execution) | **BK-350** `[ATR] BK-42 — ...` (Issue 12334, env=staging) |
| Test Environment | staging |
| Tests (Cucumber) | **BK-351…BK-370** (20 tests, ATP-1…ATP-20, Issue IDs 12335–12354) |

**Jira links created (2026-08-10)**: 2×Test (BK-349→BK-42, BK-350→BK-42), 20×Test Design (BK-349→BK-351…370), 20×Test Execute (BK-350→BK-351…370). Replicates BK-40/BK-38 topology (ATP/ATR outward). Gotcha: `--from-csv` fails to parse; use `--from-json` with `outwardIssue/inwardIssue/type`. Verified direction from BK-42 (Test from=BK-349/BK-350) and BK-351 (Test Design from=BK-349, Test Execute from=BK-350).

## Test-Data Readiness

Rich seed data live in staging DB (DBHub): **98 bugs** (all with project), **329 active modules**, **78 projects**.

| Project | Workspace | Data |
|---|---|---|
| Prueba QA (e207917d) | open-source | 11 modules, 82 bugs filed 2026-08-07 — windows 7d/30d/90d + trend |
| BK-34 QA Seed (d75e73ac) | BK-34 Sprint QA | 9 bugs, latest today — freshness/integration |

Soft block: `.env` staging API credentials rejected (401 Invalid credentials vs dojo.upexgalaxy.com) — refresh before live UI/API verification at Stage 2.

## Smoke Subset

| Subset | TCs | Coverage |
|---|---|---|
| Smoke | ATP-1, ATP-6, ATP-11, ATP-16, ATP-18, ATP-20 | Core ACs (6/20, 30%) — default window, trend, rollup, freshness, 401, 400 |

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | Staging API credentials in `.env` return 401 (Invalid credentials) — refresh before Stage 2 live verification? | QA | HIGH |
| 2 | ATP-19 expected result must move 403 → 404 per ratification — accept update in Stage 1 plan? | QA | MEDIUM |

## Verdict Rationale

CONDITIONAL-GO — 20/20 TCs executable; contract fully implemented (route + RPC 0052 + UI). Conditions (non-blocking):
1. Update ATP-19 expected result to 404 (AC-11 ratified 2026-08-01).
2. Refresh staging API credentials before Stage 2 live UI/API checks.
3. ~~Create Xray ATP/ATR + 20 Tests (GAP) in Plan B, replicating BK-40/BK-38 topology.~~ **DONE 2026-08-10**: ATP=BK-349, ATR=BK-350, Tests=BK-351…370, 42 Jira links created.

**Next step**: proceed to `/sprint-testing` Stage 1. Refresh staging credentials first (Open Question 1).
