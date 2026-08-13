# Batch Coverage Matrix — Waves 1-3 (Epic BK-30 + BK-31 + BK-24)

**Generated**: 2026-08-12 | **test-documentation Phases 1-3** | **Modality**: jira-xray
**Batch scope**: All stories for automated regression (Option C: document all waves, then automate together)

## Batch-Level Summary

| Wave | Epic | Stories | TCs Analyzed | Candidate | Manual | Deferred | Tests in Set |
|---|---|---|---|---|---|---|---|
| 1 | BK-30 (Manual Execution) | 3 | 33 | 26 | 3 | 4 | 31 (BK-374) |
| 2 | BK-31 (Bugs/Heatmap) | 2 | 29 | 29 | 0 | 0 | 29 (BK-402) |
| 3 | BK-24 (Test Builder) | 3 | 34 | 34 | 0 | 0 | 34 (BK-403) |
| **Total** | | **8** | **96** | **89** | **3** | **4** | **94** |

## Wave 1 — Epic BK-30 (Manual Execution & Runs) ✅ COMPLETE

### BK-34 — Run Execution Start (Ready For Release)
**ATP**: 15 TC outlines | **Xray Tests**: 13 new (BK-375–387)

| AC | Technique | Scenarios | Candidate | Manual | Deferred | Test Keys |
|---|---|---|---|---|---|---|
| AC1 | EP, ST, Integration | 1 | 1 | 0 | 0 | BK-375 |
| AC2 | EP, BVA, ST | 1 | 1 | 0 | 0 | BK-376 |
| AC3 | EP, DT, Security | 1 | 1 | 0 | 0 | BK-377 |
| AC4 | BVA, ST | 2 | 1 | 0 | 1 | BK-378 (TC-10 Deferred) |
| AC5 | EP, ST | 1 | 1 | 0 | 0 | BK-379 |
| AC6 | DT, Pairwise, Security | 1 | 1 | 0 | 0 | BK-380 (param 4) |
| AC7 | ST, Integration, Security | 1 | 1 | 0 | 0 | BK-381 |
| Security | EP, Security | 2 | 2 | 0 | 0 | BK-382, BK-383 (param 4) |
| Cross-cutting | BVA, Error Guessing | 5 | 3 | 1 | 1 | BK-384–387 (TC-13 Deferred) |

### BK-38 — Run Reporting (QA Approved)
**ATP**: BK-318 | **ATR**: BK-319 (8/8 PASS) | **Xray Tests**: 8 promoted (BK-320–327)

| ATC | Technique | Candidate | Manual | Test Key |
|---|---|---|---|---|
| ATC-01 | Happy path, EP | 1 | 0 | BK-320 |
| ATC-02 | Happy path, BVA | 1 | 0 | BK-321 |
| ATC-03 | State transition | 1 | 0 | BK-322 |
| ATC-04 | Boundary, BVA | 1 | 0 | BK-323 |
| ATC-05 | Negative, DT | 1 | 0 | BK-324 |
| ATC-06 | Integration | 1 | 0 | BK-325 |
| ATC-07 | Security, EP | 1 | 0 | BK-326 |
| ATC-08 | Scalability (manual) | 0 | 1 | BK-327 |

### BK-39 — Run Finish (Ready For Release)
**ATP**: test-analysis.md | **ATR**: test-report.md | **Xray Tests**: 10 new (BK-388–397)

| ATC | Technique | Candidate | Manual | Test Key |
|---|---|---|---|---|
| ATC-01 | Happy path, EP | 1 | 0 | BK-388 |
| ATC-02 | Happy path, BVA | 1 | 0 | BK-389 |
| ATC-04 | State transition | 1 | 0 | BK-390 |
| ATC-05 | Boundary, BVA | 1 | 0 | BK-391 |
| ATC-06 | Negative, DT | 1 | 0 | BK-392 |
| ATC-07 | Integration | 1 | 0 | BK-393 |
| ATC-08 | Security, EP | 1 | 0 | BK-394 |
| ATC-09 | Cross-workspace | 1 | 0 | BK-395 |
| Bug BK-182 | Bug-driven | 1 | 0 | BK-396 |
| ATC-03 | Manual (no endpoint) | 0 | 1 | BK-397 |

## Wave 2 — Epic BK-31 (Bugs/Defect Heatmap) ✅ COMPLETE

### BK-40 — TMS-Defect Filing (QA Approved)
**ATP**: BK-347 | **ATR**: BK-348 | **Xray Tests**: 9 Cucumber (BK-338–346)

| ATP | Technique | Candidate | Manual | Test Key |
|---|---|---|---|---|
| ATP-P1 | Happy path, EP | 1 | 0 | BK-338 |
| ATP-P2 | Happy path, EP | 1 | 0 | BK-339 |
| ATP-P3 | Happy path, EP | 1 | 0 | BK-340 |
| ATP-N1 | Negative, DT | 1 | 0 | BK-341 |
| ATP-N2 | Negative, BVA | 1 | 0 | BK-342 |
| ATP-N3 | Negative, DT | 1 | 0 | BK-343 |
| ATP-N4 | Negative, EP | 1 | 0 | BK-344 |
| ATP-B1 | Boundary, BVA | 1 | 0 | BK-345 |
| ATP-I1 | Integration | 1 | 0 | BK-346 |

### BK-42 — TMS-Defect Heatmap (QA Approved)
**ATP**: BK-349 | **ATR**: BK-350 | **Xray Tests**: 20 Cucumber (BK-351–370)

| ATP | Technique | Candidate | Manual | Test Key |
|---|---|---|---|---|
| ATP-1 | Happy path, EP | 1 | 0 | BK-351 |
| ATP-2 | Happy path, EP | 1 | 0 | BK-352 |
| ATP-3 | Boundary, BVA | 1 | 0 | BK-353 |
| ATP-4 | Boundary, BVA | 1 | 0 | BK-354 |
| ATP-5 | Boundary, BVA | 1 | 0 | BK-355 |
| ATP-6 | Trend, EP | 1 | 0 | BK-356 |
| ATP-7 | Trend, EP | 1 | 0 | BK-357 |
| ATP-8 | Trend, Edge | 1 | 0 | BK-358 |
| ATP-9 | Trend, Edge | 1 | 0 | BK-359 |
| ATP-10 | Trend, Edge | 1 | 0 | BK-360 |
| ATP-11 | Hierarchy, EP | 1 | 0 | BK-361 |
| ATP-12 | Hierarchy, EP | 1 | 0 | BK-362 |
| ATP-13 | Visual/a11y | 1 | 0 | BK-363 |
| ATP-14 | Visual/a11y | 1 | 0 | BK-364 |
| ATP-15 | Visual/a11y | 1 | 0 | BK-365 |
| ATP-16 | Integration, Freshness | 1 | 0 | BK-366 |
| ATP-17 | Integration, Freshness | 1 | 0 | BK-367 |
| ATP-18 | Security | 1 | 0 | BK-368 |
| ATP-19 | Security | 1 | 0 | BK-369 |
| ATP-20 | Negative, EP | 1 | 0 | BK-370 |

## Wave 3 — Epic BK-24 (Test Builder) ✅ COMPLETE

### BK-28 — Reorder ATCs (Ready For Release)
**ATP**: acceptance-test-plan.md | **Xray Tests**: 12 new (BK-404–415)

| TC | Category | Candidate | Manual | Test Key |
|---|---|---|---|---|
| TC-1 | Happy | 1 | 0 | BK-404 |
| TC-2 | Happy | 1 | 0 | BK-405 |
| TC-3 | No-op | 1 | 0 | BK-406 |
| TC-4 | No-op | 1 | 0 | BK-407 |
| TC-5 | Negative | 1 | 0 | BK-408 |
| TC-6 | Negative | 1 | 0 | BK-409 |
| TC-7 | Boundary | 1 | 0 | BK-410 |
| TC-8 | Negative | 1 | 0 | BK-411 |
| TC-9 | Negative | 1 | 0 | BK-412 |
| TC-10 | Negative | 1 | 0 | BK-413 |
| TC-11 | Integration | 1 | 0 | BK-414 |
| TC-12 | Integration | 1 | 0 | BK-415 |

### BK-32 — View ATCs (Ready For Release)
**ATP**: acceptance-test-plan.md | **Xray Tests**: 8 new (BK-417–424)

| TC | Category | Candidate | Manual | Test Key |
|---|---|---|---|---|
| TC-1 | Happy | 1 | 0 | BK-417 |
| TC-2 | Happy | 1 | 0 | BK-418 |
| TC-3 | Integration | 1 | 0 | BK-419 |
| TC-4 | Boundary | 1 | 0 | BK-420 |
| TC-5 | Negative | 1 | 0 | BK-421 |
| TC-6 | Negative | 1 | 0 | BK-422 |
| TC-7 | Integration | 1 | 0 | BK-423 |
| TC-8 | UX | 1 | 0 | BK-424 |

### BK-33 — Test Tags (Ready For Release)
**ATP**: acceptance-test-plan.md | **Xray Tests**: 14 new (BK-425–438)

| TC | Category | Candidate | Manual | Test Key |
|---|---|---|---|---|
| TC-1 | Happy | 1 | 0 | BK-425 |
| TC-2 | Happy | 1 | 0 | BK-426 |
| TC-3 | Happy | 1 | 0 | BK-427 |
| TC-4 | Happy | 1 | 0 | BK-428 |
| TC-5 | Negative | 1 | 0 | BK-429 |
| TC-6 | Negative | 1 | 0 | BK-430 |
| TC-7 | Negative | 1 | 0 | BK-431 |
| TC-8 | Negative | 1 | 0 | BK-432 |
| TC-9 | Negative | 1 | 0 | BK-433 |
| TC-10 | Boundary | 1 | 0 | BK-434 |
| TC-11 | Boundary | 1 | 0 | BK-435 |
| TC-12 | Boundary | 1 | 0 | BK-436 |
| TC-13 | Integration | 1 | 0 | BK-437 |
| TC-14 | Integration | 1 | 0 | BK-438 |

## Traceability Matrix

| Story | ATP | ATR | TCs | Test Set | Regression Plan |
|---|---|---|---|---|---|
| BK-34 | customfield_10120 | — | 13 | BK-374 | BK-65 (pending) |
| BK-38 | BK-318 | BK-319 | 8 | BK-374 | BK-65 (pending) |
| BK-39 | test-analysis.md | test-report.md | 10 | BK-374 | BK-65 (pending) |
| BK-40 | BK-347 | BK-348 | 9 | BK-402 | BK-65 (pending) |
| BK-42 | BK-349 | BK-350 | 20 | BK-402 | BK-65 (pending) |
| BK-28 | acceptance-test-plan.md | — | 12 | BK-403 | BK-65 (pending) |
| BK-32 | acceptance-test-plan.md | — | 8 | BK-403 | BK-65 (pending) |
| BK-33 | acceptance-test-plan.md | — | 14 | BK-403 | BK-65 (pending) |

## Risk Notes

1. **BK-34 TC-10/13 Deferred**: Need PO/DEV confirmation on 24h token boundary and snapshot immutability
2. **BK-39 Bug BK-182**: Bearer workspace resolution — dedicated test BK-396 created
3. **BK-65 Regression Plan**: Permission denied in Planning state — manual intervention needed (owner Ely)
4. **BK-40 seed bugs**: 6 seed bugs in staging from API verification — cleanup required after Stage 2/3

## Batch Totals (Waves 1-3 complete)

| Metric | Value |
|---|---|
| Stories documented | 8 (all waves) |
| Tests analyzed | 96 |
| Candidate | 89 |
| Manual | 3 |
| Deferred | 4 |
| Test Sets | 3 (BK-374, BK-402, BK-403) |
| Tests in Sets | 94 |

---
*Generated by test-documentation skill Phases 1-3 — batch coverage matrix for test-automation handoff*
