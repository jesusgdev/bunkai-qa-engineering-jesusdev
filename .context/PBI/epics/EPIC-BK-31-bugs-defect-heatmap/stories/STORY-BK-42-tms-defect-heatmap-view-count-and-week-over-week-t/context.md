# Context — BK-42 (TMS-Defect Heatmap)

## Pre-Flight Check

**Verdict**: CONDITIONAL-GO · **Date**: 2026-08-10 · **Report**: pre-flight-check.md · **Deferred**: none (ATP-19 STALE, expected-result update only)
**TMS Modality**: jira-xray · **ATP Key**: BK-349 · **ATR Key**: BK-350 · **Tests**: BK-351…BK-370 · **Env**: staging
**Reporting handoff**: final ATR must embed `QA Completion Summary` with environment, result, defects, test data, AC verified behaviors, and cleanup/restoration notes where applicable.
**Bug reporting handoff**: if a follow-up defect is filed, Stage 3 must populate Jira-native Bug fields and rich ADF description; comments are supplemental only and redundant comment-only reports must be removed after confirmation.
**Expert audit handoff**: Stage 3 must publish `Expert Panel Review - Sprint Testing Audit BK-42` with green `VALIDATED` success panel when accepted, or red `FAILED`/`REJECTED`/`BLOCKED` panel when not accepted.

## Key Findings (Phase 0)

- Feature fully implemented: `GET /api/v1/projects/{id}/bugs/heatmap` (app/api/v1/projects/[id]/bugs/heatmap/route.ts), RPC `bunkai_report_project_defect_heatmap` (migration 0052_defect_heatmap_report.sql), UI `BugsHeatmapView.tsx` with List/Heatmap toggle on `/projects/[projectSlug]/bugs`.
- AC-11 ratified 2026-08-01 (Jira comment "PO + Dev Ratification"): literal 403 for unauthorized access **rejected** → non-disclosure collapses to identical 404 `not_found` (P0002), same as Coverage/Recovery-cycle siblings. ATP-19 expected result must be updated.
- No materialized view / stats substrate (ratified): live unpaged aggregate RPC; freshness via `generated_at=now()` — beats the 5s SLA.
- Heat tiers: Clean 0 / Low 1-2 / Elevated 3-4 / Hotspot 5+; trend compares latest 7-day UTC bucket vs previous 7-day UTC bucket; trend_delta is the rendered value ("Rising +N"), trend_pct nullable on zero-baseline.

## Test Data

- 98 bugs / 329 active modules / 78 projects (staging DB).
- Project `e207917d` (Prueba QA, workspace open-source): 11 modules, 82 bugs filed 2026-08-07 — good for windows + trend.
- Project `d75e73ac` (BK-34 QA Seed): 9 bugs, latest today — good for freshness.

## Open Items

- [x] Plan B: Xray ATP/ATR + 20 Tests + 42 Jira links created (2026-08-10) — ATP=BK-349, ATR=BK-350, Tests=BK-351…370
- [ ] Refresh staging API credentials (.env → 401 Invalid credentials vs dojo.upexgalaxy.com)
- [ ] Update ATP-19 expected result 403 → 404 in Stage 1 plan
