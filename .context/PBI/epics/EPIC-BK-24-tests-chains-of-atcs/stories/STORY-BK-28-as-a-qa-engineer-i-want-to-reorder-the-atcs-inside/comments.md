# Comments for BK-28

[View in Jira](https://jira.upexgalaxy.com/browse/BK-28)

---

### jesusgpythondev - 6/9/2026, 6:25:05 PM

## Shift-Left Review Update Summary

BK-28 has been re-refined using the shift-left-workflow-pattern with expert-development-team-analysis. The previous v2 analysis (2026-06-04) was restructured into the canonical description format matching BK-34's structure.

### What changed

- ***Description rebuilt***: Full shift-left structure — User Story, Source, Shift-Left Review Status, Scope (In/Out), Acceptance Criteria (12 Gherkin scenarios), Business Rules, Open Clarifications With Expert Recommendations, Definition of Done, References.
- ***Previous comments removed***: Old ATP v2 (comment 11383) and Senior Decisions (comment 11384) were deleted to avoid duplication. All decisions and scenarios are now integrated into the description.
- ***Expert recommendations added***: 6 open clarifications with role-specific expert recommendations (PO, Architect, Developers, QA Lead, Delivery).
- ***BK-27 dependency documented***: Explicit dependency note in Shift-Left Review Status and Delivery clarification.

### Findings

| Category | Count |
| --- | --- |
| Gherkin scenarios | 12 (Happy 2, No-op 2, Negative 4, Boundary 2, Integration 2) |
| Business rules | 11 |
| Open clarifications | 6 (with expert recommendations) |
| Dependencies | 1 (blocked-by BK-27) |

### Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| BK-27 (Test assembly) not yet landed | HIGH | BK-28 stays in Estimation until BK-27 ships |
| tests table may lack version column | MEDIUM | BK-28 adds migration if BK-27 omits it |
| Concurrent reorder race condition | LOW | Optimistic locking + 409 conflict |

### Recommendations

- Schedule BK-27 before BK-28 if both are in the same sprint.
- PO to confirm lenient If-Match mode and full-chain activity log storage.
- Architect to confirm version field migration ownership.

### Open Clarifications With Expert Recommendations

6 open questions with expert recommendations documented in the description. All require PO/Architect/Design/QA Lead/Delivery confirmation before development starts.

---

### jesusgpythondev - 6/9/2026, 6:25:06 PM

## Acceptance Test Plan (ATP) — Shift-Left DRAFT Summary

> This ATP Draft summary exists as a Jira comment. The full refined specification lives in the ticket description.

### Scenario Matrix

| # | Scenario | Type | AC Coverage |
| --- | --- | --- | --- |
| 1 | Successful reorder of ATC chain | Happy | AC-1 |
| 2 | Reorder persists across reads | Happy | AC-1 |
| 3 | No-op when same order submitted | No-op | AC-2 |
| 4 | Single-ATC Test reorder is no-op | No-op | AC-2 |
| 5 | Unauthenticated request rejected | Negative | AC-3 |
| 6 | Viewer role forbidden | Negative | AC-3 |
| 7 | Version conflict on concurrent reorder | Boundary | AC-4 |
| 8 | Chain mismatch validation error | Negative | — |
| 9 | Duplicate ATC ids rejected | Negative | — |
| 10 | Empty chain rejected | Negative | — |
| 11 | Activity log captures reorder event | Integration | — |
| 12 | Retry-safe double-click returns no-op | Integration | — |

### Coverage Summary

| Category | Count |
| --- | --- |
| Positive (Happy) | 2 |
| No-op | 2 |
| Negative | 4 |
| Boundary | 2 |
| Integration | 2 |
| ***Total**** | ****12*** |

### Risk Score: 12/125 (LOW)

- Complexity: 2 (single PATCH, array reorder, no-op detection)
- Uncertainty: 2 (pattern exists from BK-18; tests table pending from BK-27)
- Blast Radius: 3 (affects Run execution order, no data loss)

### Dependency

blocked-by BK-27 (Test assembly) — tests table does not exist yet.

---

### Automation for Jira - 6/19/2026, 1:29:19 PM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 6/19/2026, 2:11:55 PM

✅ Pull Request is successfully MERGED. Task is Done.

---

### Ely - 6/19/2026, 2:13:13 PM

## Ready for QA — BK-28 reorder ATCs

Merged to ***staging*** and deploying.

- ***PR******:*** [#42](https://github.com/upex-galaxy/upex-bunkai-tms/pull/42) (merged, `--no-ff`)
- ***Branch******:*** `feature/BK-28-reorder-atcs`
- ***Staging******:*** https://staging-upexbunkai.vercel.app/ (deploy in progress)
- ***DB******:*** migration `0026*tests*reorder.sql` applied (shared Supabase project)

### What to test

- Drag-reorder an ATC inside a Test (member/admin/owner) → Save → order persists across reload; activity log gets one entry.
- No-op: save the same order → no change, no log entry.
- Viewer role: no drag handles, cannot reorder.
- Concurrent edit: second saver gets a "reordered by someone else" notice with the current order.
- Headless: `PATCH /api/v1/tests/{id}/reorder` with `X-If-Match` (Bearer `atc:write`).

### ATP coverage

12 scenarios — automated RPC suite green (`lib/tests/reorder.test.ts`); see PR Spec Compliance Matrix.

---

### jesusgpythondev - 6/22/2026, 7:56:03 PM

# Acceptance Test Results (ATR) - BK-28

## BK-28 Test Results

| Field | Value |
| --- | --- |
| Tested | 2026-06-22 |
| Environment | Staging - https://staging-upexbunkai.vercel.app |
| Tester | jesusgpythondev |
| Result | PASSED |
| Executed checks | 12 passed / 12 executed |
| Failed / deferred | 0 failed / 0 deferred |
| Blocking defects | None |

## Summary

BK-28 was validated on staging for the ATC chain reorder contract across API and DB behavior. The executed coverage confirms that authorized callers can reorder a Test chain using stable Test Step IDs, order persists across reads, no-op submissions are safe, optimistic locking prevents stale writes, invalid chain payloads are rejected, and activity log traceability is created only for real reorder events.

The story is acceptable for QA sign-off. The only follow-up is documentation alignment: the old AC expected a 403-like forbidden result for cross-workspace access, while implementation returns 404 not_found to avoid leaking resource existence.

## Executed Checks

| ID | Check | Surface | Result | Evidence |
| --- | --- | --- | --- | --- |
| BK-28-TC-01 | Successful reorder from [A,B,C,D] to [A,D,B,C] | API + DB | PASSED | HTTP 200; version 1 -> 2; DB positions updated |
| BK-28-TC-02 | Reorder persists across reads | API + DB | PASSED | GET returns [A,D,B,C] with version 2 |
| BK-28-TC-03 | Same-order reorder is a no-op | API + DB | PASSED | HTTP 200; version unchanged; no extra event |
| BK-28-TC-04 | Single-ATC Test reorder is a no-op | API + DB | PASSED | HTTP 200; version 11 unchanged |
| BK-28-TC-05 | Unauthenticated request is rejected | API + Auth | PASSED | HTTP 401 |
| BK-28-TC-06 | Cross-workspace reorder attempt does not leak Test existence | API + Security | PASSED | HTTP 404 not_found; treated as security improvement over visible 403 |
| BK-28-TC-07 | Stale concurrent reorder is rejected | API + DB | PASSED | HTTP 409; response includes current version and current chain |
| BK-28-TC-08 | Chain mismatch is rejected | API + Validation | PASSED | HTTP 422 chain_mismatch with missing and extra arrays |
| BK-28-TC-09 | Duplicate Test Step IDs are rejected | API + Validation | PASSED | HTTP 422 chain_invalid; kind=duplicate |
| BK-28-TC-10 | Empty chain is rejected | API + Validation | PASSED | HTTP 422 chain_invalid; kind=empty |
| BK-28-TC-11 | Activity log captures reorder event | DB + Audit | PASSED | One test.reordered event with old chain, new chain, and actor ID |
| BK-28-TC-12 | Retry-safe double-click returns no-op | API + DB | PASSED | Same order with If-Match 2 produced no-op; one event total |

## Data And State Validation

| Check | API Response | DB State | Match |
| --- | --- | --- | --- |
| Version | 2 | 2 | YES |
| Chain order | [A,D,B,C] | [A,D,B,C] | YES |
| Positions | 1,2,3,4 | 1,2,3,4 | YES |
| Reorder events | 1 event from TC-01 | 1 event total | YES |
| Updated timestamp | 2026-06-22T23:53:43.736Z | 2026-06-22T23:53:43.736Z | YES |

## Test Data

| Entity | ID / Value | Notes |
| --- | --- | --- |
| Primary Test | 7b14c384-c4f9-403f-8cae-0b85a1cfcfe5 | BK-28 Reorder Seed Test; 4 ATCs |
| Initial chain | [ATC-A, ATC-B, ATC-C, ATC-D] | Pre-reorder order |
| Final chain | [ATC-A, ATC-D, ATC-B, ATC-C] | Verified persisted order |
| Single-ATC Test | 09d28d3c-ad29-45d9-a014-dbb7ba6ccbb2 | BK-34 Seed; version 11 unchanged |
| Seed ATC-B | 613e6ba3 | Created for reorder coverage |
| Seed ATC-C | 5906ed43 | Created for reorder coverage |
| Seed ATC-D | df210c22 | Created for reorder coverage |

## Expert Panel Review

| Role | Finding | Recommendation |
| --- | --- | --- |
| QA Lead | Coverage matches the 12 sprint scenarios and includes positive, no-op, auth, conflict, validation, audit, and retry paths. | Accept sprint-testing result as complete for BK-28. |
| Technical Architect | The implementation uses Test Step IDs as reorder handles, which is safer than ATC IDs because a chain can repeat the same ATC. | Keep this contract explicit in future tests and documentation. |
| Security/AppSec | Cross-workspace reorder returns 404 not_found, preventing resource existence disclosure. | Treat as security improvement; update AC wording if needed. |
| Senior Developer | Conflict and validation responses expose enough current state for safe client recovery without partial writes. | Prioritize TC-07 and TC-08 for regression automation. |
| Skeptical Reviewer | No blocker found; only documentation drift remains around 403 vs 404 expectation. | Do not rerun; clean AC wording separately. |

## Bugs Found

None confirmed.

## Observations

- Reorder API uses stable Test Step IDs, not ATC IDs.
- Cross-workspace access returns 404 not_found as RLS defense-in-depth.
- No-op detection compares ordered arrays exactly; exact match produces no version bump and no event.
- Conflict response includes current version and current chain, enabling client refresh behavior.
- DB cross-validation confirmed version, order, positions, and activity-log event count.

## Deferred Follow-Up Coverage

| Follow-up | Reason | Owner |
| --- | --- | --- |
| AC wording for cross-workspace behavior | Current AC expectation implied 403; implementation uses non-disclosing 404. | PO / QA |
| Regression automation for optimistic locking | TC-07 protects against stale writer data loss. | Automation |
| Regression automation for chain mismatch | TC-08 protects data integrity for malformed reorder requests. | Automation |

## Recommendation

QA approves BK-28 for the sprint scope as PASSED. No blocking defect was found. Move selected high-value scenarios to Stage 4 ROI/regression documentation.

---

### jesusgpythondev - 6/23/2026, 10:50:30 AM

QA Testing Complete - BK-28

Environment: Staging (https://staging-upexbunkai.vercel.app)
Result: PASSED (12/12 TCs)

TEST DATA USED:
- Test: BK-28 Reorder Seed Test (ID: 7b14c384-c4f9-403f-8cae-0b85a1cfcfe5, 4 ATCs [A,B,C,D])
- Single-ATC Test: BK-34 Seed (ID: 09d28d3c-ad29-45d9-a014-dbb7ba6ccbb2, version 11)
- Seed ATCs created: ATC-B (613e6ba3), ATC-C (5906ed43), ATC-D (df210c22)

VERIFIED BEHAVIORS:
- AC-1: Successful reorder [A,B,C,D] to [A,D,B,C] with version bump - VERIFIED
- AC-2: Reorder persists across reads (GET reflects new order) - VERIFIED
- AC-3: No-op when same order submitted (no version bump, no event) - VERIFIED
- AC-4: Single-ATC Test reorder is no-op - VERIFIED
- AC-5: Unauthenticated request rejected (401) - VERIFIED
- AC-6: Cross-workspace forbidden (404, no information leak) - VERIFIED
- AC-7: Version conflict on concurrent reorder (409 with current_chain) - VERIFIED
- AC-8: Chain mismatch returns validation error (422 chain_mismatch) - VERIFIED
- AC-9: Duplicate ATC ids rejected (422 chain_invalid) - VERIFIED
- AC-10: Empty chain rejected (422 chain_invalid) - VERIFIED
- AC-11: Activity log captures reorder event (test.reordered) - VERIFIED
- AC-12: Retry-safe double-click returns no-op - VERIFIED

Defects: None
ATR: See "BK-28 TEST RESULTS" comment above for full execution report.


---


_Synced from Jira by sync-jira-issues_
