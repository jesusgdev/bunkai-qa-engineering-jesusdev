# Context — BK-42 (TMS-Defect Heatmap)

## Pre-Flight Check

**Verdict**: GO · **Date**: 2026-08-10 (updated 2026-08-11) · **Report**: pre-flight-check.md · **Deferred**: none
**TMS Modality**: jira-xray · **ATP Key**: BK-349 · **ATR Key**: BK-350 · **Tests**: BK-351…BK-370 · **Env**: staging
**Reporting handoff**: final ATR must embed `QA Completion Summary` with environment, result, defects, test data, AC verified behaviors, and cleanup/restoration notes where applicable.
**Bug reporting handoff**: if a follow-up defect is filed, Stage 3 must populate Jira-native Bug fields and rich ADF description; comments are supplemental only and redundant comment-only reports must be removed after confirmation.
**Expert audit handoff**: Stage 3 must publish `Expert Panel Review - Sprint Testing Audit BK-42` with green `VALIDATED` success panel when accepted, or red `FAILED`/`REJECTED`/`BLOCKED` panel when not accepted.

## Key Findings (Phase 0)

- Feature fully implemented: `GET /api/v1/projects/{id}/bugs/heatmap` (app/api/v1/projects/[id]/bugs/heatmap/route.ts), RPC `bunkai_report_project_defect_heatmap` (migration 0052_defect_heatmap_report.sql), UI `BugsHeatmapView.tsx` with List/Heatmap toggle on `/projects/[projectSlug]/bugs`.
- AC-11 ratified 2026-08-01 (Jira comment "PO + Dev Ratification"): literal 403 for unauthorized access **rejected** → non-disclosure collapses to identical 404 `not_found` (P0002), same as Coverage/Recovery-cycle siblings. **TC BK-369 already asserts 404** (created post-ratification) — no TC update needed.
- No materialized view / stats substrate (ratified): live unpaged aggregate RPC; freshness via `generated_at=now()` — beats the 5s SLA.
- Heat tiers: Clean 0 / Low 1-2 / Elevated 3-4 / Hotspot 5+; trend compares latest 7-day UTC bucket vs previous 7-day UTC bucket; trend_delta is the rendered value ("Rising +N"), trend_pct nullable on zero-baseline.

## Test Data

- 98 bugs / 329 active modules / 78 projects (staging DB).
- Positives (ATP-1..17, 20): **d75e73ac** (BK-34 QA Seed) — 9 bugs in 7d/30d/90d, owner role, 200 OK. Live payload verified: 2 items (`2edff842` count 3 elevated rising; `c9e05a37` count 6 hotspot rising).
- ATP-19 negative (404): **e207917d** (Prueba QA, workspace open-source) — staging user NOT member → 404 `not_found`.

## Open Items

- [x] Plan B: Xray ATP/ATR + 20 Tests + 42 Jira links created (2026-08-10) — ATP=BK-349, ATR=BK-350, Tests=BK-351…370
- [x] Staging credentials refreshed (2026-08-11) — legacy user login OK, token minted (`bk_pat_kFPFJ0aqvYYF...`)
- [x] ATP-19 expected result 404 — confirmed in TC BK-369; no update needed
- [x] BK-42 transitioned Ready For QA → In Test (2026-08-11); qa_assignee = jesusgdev (`customfield_10070`, slug added to `.agents/jira-fields.json`)
