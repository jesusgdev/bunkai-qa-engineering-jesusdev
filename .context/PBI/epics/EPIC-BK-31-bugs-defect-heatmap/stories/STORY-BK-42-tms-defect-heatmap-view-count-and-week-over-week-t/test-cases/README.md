# BK-42 Test Cases — TMS-Defect Heatmap

**Story**: BK-42 — TMS-Defect Heatmap | View count and week-over-week trend per module
**Epic**: BK-31 (Bugs/Defect Heatmap)
**Modality**: jira-xray
**Test Set**: BK-402 (Test Set: BK-31 Bugs & Defect Heatmap)
**ATP**: BK-349 (Test Plan)
**ATR**: BK-350 (Test Execution, env=staging)

## Test Cases (20 — all Candidate)

| Key | ATP | Gherkin | Status |
|---|---|---|---|
| BK-351 | ATP-1 | Positive — Count & Window (default 30d, one cell per active module) | Candidate |
| BK-352 | ATP-2 | Positive — Count & Window (7d/30d/90d switch updates counts) | Candidate |
| BK-353 | ATP-3 | Boundary — Count & Window (archived modules/subtrees hidden) | Candidate |
| BK-354 | ATP-4 | Boundary — Count & Window (UTC half-open, start included) | Candidate |
| BK-355 | ATP-5 | Boundary — Count & Window (end boundary excluded) | Candidate |
| BK-356 | ATP-6 | Trend — Rising + positive percent | Candidate |
| BK-357 | ATP-7 | Trend — Falling + negative percent | Candidate |
| BK-358 | ATP-8 | Trend — Prev 0 / curr > 0 (pct: null, no Infinity) | Candidate |
| BK-359 | ATP-9 | Trend — 0/0 flat, pct: 0 | Candidate |
| BK-360 | ATP-10 | Trend — Curr 0 / prev > 0 (pct: -100) | Candidate |
| BK-361 | ATP-11 | Module hierarchy — Parent rollup via path-prefix LIKE | Candidate |
| BK-362 | ATP-12 | Module hierarchy — Child keeps own non-collapsed cell | Candidate |
| BK-363 | ATP-13 | Visual / a11y — Hotspot never color-only (count, tag, legend) | Candidate |
| BK-364 | ATP-14 | Visual / a11y — Trend exposed as word + delta + icon label | Candidate |
| BK-365 | ATP-15 | Visual / a11y — Full module_path disambiguates duplicate names | Candidate |
| BK-366 | ATP-16 | Integration — Freshness (live RPC, no MV, beats 5s SLA) | Candidate |
| BK-367 | ATP-17 | Integration — Freshness (generated_at returned and rendered) | Candidate |
| BK-368 | ATP-18 | Security — Unauthenticated → 401 | Candidate |
| BK-369 | ATP-19 | Security — Non-member workspace → 404 (AC-11 ratified) | Candidate |
| BK-370 | ATP-20 | Negative — Unsupported window (365d) → 400 | Candidate |

## Regression Plan

**BK-402** (Test Set: BK-31 Bugs & Defect Heatmap) — 20/20 Candidate

## Traceability

- Story → ATP (is tested by): BK-42 → BK-349
- Story → ATR (is tested by): BK-42 → BK-350
- ATP → Tests (Test Design): BK-349 → BK-351…370
- ATR → Tests (Test Execute): BK-350 → BK-351…370
