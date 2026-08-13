# Prioritization Report — Epic BK-30 Manual Execution & Runs

**Scope**: test-documentation ticket-driven for BK-34, BK-38, BK-39
**Modality**: jira-xray
**Date**: 2026-08-11

## Executive Summary

Analyzed 33 scenarios across 3 stories → 31 Tests documented (26 Candidate, 3 Manual, 4 Deferred).
Test Set **BK-374** created with 31 Tests. Regression Plan **BK-65** pending permission.

## ROI Verdicts by Story

### BK-34 (15 scenarios → 13 Tests)

| Scenario | Freq | Impact | Stab | Effort | Deps | Base ROI | Comp Val | Verdict |
|---|---|---|---|---|---|---|---|---|
| TC-01 Happy path | 5 | 5 | 4 | 3 | 3 | 11.11 | 5→22.22 | **Candidate** |
| TC-02 Zero steps | 2 | 4 | 4 | 2 | 2 | 8.00 | - | **Candidate** |
| TC-03 Invalid Env | 2 | 4 | 4 | 2 | 2 | 8.00 | - | **Candidate** |
| TC-04 Same token 24h | 3 | 4 | 4 | 2 | 2 | 12.00 | - | **Candidate** |
| TC-05 Different token | 2 | 3 | 4 | 2 | 2 | 6.00 | - | **Candidate** |
| TC-06 Executor modes | 4 | 4 | 4 | 3 | 3 | 7.11 | 4→12.80 | **Candidate** |
| TC-07 History visibility | 3 | 3 | 4 | 3 | 3 | 4.00 | - | **Candidate** |
| TC-08 PAT no scope | 2 | 5 | 4 | 2 | 2 | 10.00 | - | **Candidate** |
| TC-09 Cross-workspace | 2 | 5 | 4 | 3 | 3 | 4.44 | - | **Candidate** |
| TC-10 Token after 24h | 1 | 3 | 2 | 3 | 3 | 0.67 | - | **Deferred** |
| TC-11 Duplicate click | 3 | 4 | 4 | 2 | 2 | 12.00 | - | **Candidate** |
| TC-12 Reused key diff | 2 | 4 | 4 | 2 | 2 | 8.00 | - | **Candidate** |
| TC-13 Snapshot immutable | 1 | 3 | 2 | 4 | 4 | 0.38 | - | **Deferred** |
| TC-14 Invalid idempotency | 2 | 3 | 4 | 2 | 2 | 6.00 | - | **Candidate** |
| TC-15 Invalid executor | 1 | 2 | 4 | 2 | 2 | 2.00 | - | **Manual** |

### BK-38 (8 scenarios → 8 Tests promoted)

| Test | ATC | Freq | Impact | Stab | Effort | Deps | Base ROI | Verdict |
|---|---|---|---|---|---|---|---|---|
| BK-320 | ATC-01 | 5 | 5 | 4 | 3 | 2 | 16.67 | **Candidate** |
| BK-321 | ATC-02 | 4 | 4 | 4 | 3 | 2 | 10.67 | **Candidate** |
| BK-322 | ATC-03 | 3 | 3 | 4 | 2 | 2 | 9.00 | **Candidate** |
| BK-323 | ATC-04 | 3 | 3 | 4 | 2 | 2 | 9.00 | **Candidate** |
| BK-324 | ATC-05 | 3 | 3 | 4 | 2 | 2 | 9.00 | **Candidate** |
| BK-325 | ATC-06 | 2 | 3 | 4 | 2 | 2 | 6.00 | **Candidate** |
| BK-326 | ATC-07 | 3 | 5 | 4 | 2 | 2 | 15.00 | **Candidate** |
| BK-327 | ATC-08 | 2 | 2 | 3 | 4 | 3 | 1.00 | **Manual** |

### BK-39 (10 scenarios → 10 Tests)

| Scenario | Freq | Impact | Stab | Effort | Deps | Base ROI | Verdict |
|---|---|---|---|---|---|---|---|
| ATC-01 Finish passed | 5 | 5 | 4 | 3 | 3 | 11.11 | **Candidate** |
| ATC-02 Pending skipped | 4 | 4 | 4 | 2 | 2 | 16.00 | **Candidate** |
| ATC-03 Executed preserved | 2 | 3 | 3 | 4 | 3 | 1.50 | **Manual** |
| ATC-04 Missing verdict | 3 | 4 | 4 | 2 | 2 | 12.00 | **Candidate** |
| ATC-05 Terminal guard | 3 | 4 | 4 | 2 | 2 | 12.00 | **Candidate** |
| ATC-06 Concurrent finish | 2 | 4 | 4 | 3 | 3 | 3.56 | **Candidate** |
| ATC-07 Auth modes finish | 4 | 4 | 4 | 3 | 3 | 7.11 | **Candidate** |
| ATC-08 UI warning | 4 | 3 | 4 | 3 | 3 | 5.33 | **Candidate** |
| ATC-09 Failed no defect | 2 | 3 | 4 | 2 | 2 | 6.00 | **Candidate** |
| **Bug BK-182** | 3 | 4 | 3 | 3 | 3 | 4.00 | **Candidate** |

## Phase 0 Filter Results

All scenarios passed Phase 0 filter:
- ✅ Protect against future regressions
- ✅ Feature-level concerns (not app-level XSS/a11y/perf)
- Prior-bug rule applied: BK-182 biased Candidate

## Handoff to test-automation

**Candidate Tests (26)** → feed `test-automation` skill:
- Re-scoped into: Module-driven (Macro), Ticket-driven (Medium), Regression-driven (Micro)
- KATA components: AuthApi, ExampleApi, LoginPage, ExamplePage + new Page/Api components needed for Runs/Defects/Heatmap/Traceability UI

**Manual Tests (3)** → manual regression suite:
- BK-34 TC-15: Invalid executor mode validation
- BK-38 ATC-08: Scalability (perf needs human judgment)
- BK-39 ATC-03: Executed step preservation (no endpoint)

**Deferred (4)** → not in regression, recorded in this report:
- BK-34 TC-10: Token after 24h (needs PO/DEV confirmation)
- BK-34 TC-13: Snapshot immutability (needs DEV confirmation)
- BK-39 ATC-03: Also Manual (same scenario)

## Next Steps

1. **Regression Plan BK-65**: Add 31 Tests when permission available
2. **Workflow transitions**: Draft → In Design → Ready → Candidate/Manual for all 31 Tests
3. **test-automation**: Plan → Code → Review on 26 Candidate verdicts
4. **regression-testing**: Execute suite via CI/CD → GO/CAUTION/NO-GO

---
*Prioritization report per test-documentation skill Phase 2*
