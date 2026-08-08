# ATR-001 BK-38 — Test Report (stage 2-3)

**Story**: BK-38 — TMS-Run Reporting | Filter project runs with pass/fail totals
**Date**: 2026-08-08
**Scope executed**: Full ATP (8 ATCs) — UI (live browser) + API + DB triforce on staging
**Environment**: staging (https://staging-upexbunkai.vercel.app) | **Xray**: ATP BK-318 · ATR BK-319
**Outcome**: 8/8 PASS · 0 defects

## Result Overview

| TC           | ATC                     | Verdict | Comment |
|--------------|-------------------------|---------|---------|
| BK-38-ATC-01 | Happy baseline          | PASS    | 58 runs, totals Passed 2/Failed 2 |
| BK-38-ATC-02 | Filter contract         | PASS    | Combined filters narrow rows, totals recompute |
| BK-38-ATC-03 | Empty state             | PASS    | 0 rows / 0 totals, no stale |
| BK-38-ATC-04 | Date boundary inclusive | PASS    | Single-day includes all |
| BK-38-ATC-05 | Clear filters reset     | PASS    | Restores full list + totals |
| BK-38-ATC-06 | No-runs project         | PASS    | Empty state, 0/0 |
| BK-38-ATC-07 | Cross-project isolation | PASS    | 0 leakage rows/totals |
| BK-38-ATC-08 | Scalability             | PASS    | 58 runs, pagination stable |

**Outcome**: 8/8 PASS

## Test Data (seeded 2026-08-08)

- Project `bk-38-final-report-project` (id `9611b8f3-1eb8-427f-b585-b5d265668b0c`) under workspace `988e342e-28a7-49d1-b254-4cd44226ad71` → **58 runs**.
  - Distribution: running=53 · passed=2 · failed=2 · aborted=1 (Test A=30, Test B=28)
  - created/started 2026-08-08 T08:45..20:48Z
- Isolation project `bk-38-atc06-empty` (id `fc8212d5-5382-4499-bcb3-7c0338a2b3dc`) — same 2 tests (BK-38 Final Test A/B) but **0 runs**.

## Findings / Defects

- None confirmed.

## AC Verification Summary

- **AC1 Baseline**: 58 pre-visible runs, Totals Passed 2/Failed 2 (PASS)
- **AC2 Combined filters**: Module + Status filters recompute totals (PASS)
- **AC3 Date inclusion**: started_at inclusive (PASS)
- **AC4 Empty no stale totals** (PASS)
- **AC5 Clear = restore** (PASS)
- **AC6 No runs → first-use state** (PASS)
- **AC7 No cross-project leakage in rows/totals** (PASS)

## File references

- Evidence: `evidence/ATC-01..08*.png` (8 screenshots)
- Details: `test-session-memory.md` (Execution section)

## Cleanup / Next

- Seeded data is staging-only. The dedicated isolation project (`bk-38-atc06-empty`) remains in place — no cleanup needed; the ATR (BK-319) runs were marked PASSED with evidence + comments.

## QA Completion Summary

**Published**: 2026-08-08 · **Comment**: BK-38 comment ID 12246 (Jira ADF) · **Status**: QA Approved (transitions already in changelog 2026-08-08 18:23-24 — verified, recorded, not re-run)

| AC | ATC | Description | Result |
|----|-----|-------------|--------|
| AC1 | BK-38-ATC-01 | Happy baseline — all project runs listed with totals | PASS |
| AC2 | BK-38-ATC-02 | Combined filters narrow rows, totals recompute | PASS |
| AC3 | BK-38-ATC-04 | Date range inclusive by `started_at` | PASS |
| AC4 | BK-38-ATC-03 | Empty filter result — zeroed totals, no stale | PASS |
| AC5 | BK-38-ATC-05 | Clear filters restores full report | PASS |
| AC6 | BK-38-ATC-06 | No-runs project — first-use empty state | PASS |
| AC7 | BK-38-ATC-07 | Cross-project isolation — no leaked rows/totals | PASS |

**Defects:** None — D-4 note: Aborted chip intentionally excluded from totals/UI (not a defect).
**Handoff:** QA Approved — cleared for release. Follow-ups (out of scope): run start/abort (BK-34/BK-39), defect filing (BK-40..43), exports/charts/dashboards.