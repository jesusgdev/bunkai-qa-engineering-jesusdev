# Acceptance Test Plan — BK-28

**Story**: TMS-Test Builder | Reorder ATCs inside a test
**Modality**: jira-native (TC outlines only — no Test work items in-sprint)
**Risk Score**: 12/125 (LOW)
**Shift-left short-circuit**: Phases 1-3 skipped (label shift-left-reviewed <30 days)

---

## GROUP: Reorder Happy Path

### TC-1: BK-28: Validate successful reorder of ATC chain
- **Precond**: Test 7b14c384 with chain [A,B,C,D] at version 1, X-If-Match: 1
- **Action**: PATCH /api/v1/tests/7b14c384/reorder with step_ids reordered [A,D,B,C]
- **Expected**: 200, version 2, DB positions updated (1=A, 2=D, 3=B, 4=C), test.reordered event logged

### TC-2: BK-28: Validate reorder persists across reads
- **Precond**: TC-1 completed (Test at version 2 with [A,D,B,C])
- **Action**: GET /api/v1/tests/7b14c384
- **Expected**: Chain reflects [A,D,B,C], version 2

## GROUP: No-op Detection

### TC-3: BK-28: Validate no-op when same order submitted
- **Precond**: Test at current version with known chain
- **Action**: PATCH with identical step_ids order + X-If-Match: current version
- **Expected**: 200, version unchanged, updated_at unchanged, no event

### TC-4: BK-28: Validate single-ATC Test reorder is no-op
- **Precond**: Test 09d28d3c with 1 ATC, version 11
- **Action**: PATCH /api/v1/tests/09d28d3c/reorder with same single step_id
- **Expected**: 200, version 11 unchanged, no event

## GROUP: Auth + Permission Gates

### TC-5: BK-28: Validate unauthenticated request rejected
- **Precond**: None
- **Action**: PATCH /api/v1/tests/7b14c384/reorder without Authorization header
- **Expected**: 401 unauthorized, no rows updated

### TC-6: BK-28: Validate viewer role forbidden from reordering
- **Precond**: Cross-workspace user (different workspace, no membership)
- **Action**: PATCH with token from non-member workspace
- **Expected**: 403 forbidden, no rows updated

## GROUP: Optimistic Locking

### TC-7: BK-28: Validate version conflict on concurrent reorder
- **Precond**: Test at version N
- **Action**: PATCH with X-If-Match: N-1 (stale version)
- **Expected**: 409 conflict, body includes current_chain + current_version, no duplicate event

## GROUP: Chain Validation

### TC-8: BK-28: Validate chain mismatch returns validation error
- **Precond**: Test with chain [A,B,C,D]
- **Action**: PATCH with step_ids including a foreign step_id not in the Test
- **Expected**: 422 chain_mismatch, body includes missing + extra arrays, no rows updated

### TC-9: BK-28: Validate duplicate ATC ids in chain rejected
- **Precond**: Test with chain [A,B,C,D]
- **Action**: PATCH with step_ids [A,A,B,C] (duplicate step_id)
- **Expected**: 422 chain_invalid, error indicates duplicate references, no rows updated

### TC-10: BK-28: Validate empty chain rejected
- **Precond**: Test with chain [A,B,C,D]
- **Action**: PATCH with step_ids: []
- **Expected**: 422 chain_invalid, error indicates at least one ATC required, no rows updated

## GROUP: Activity Log + Integration

### TC-11: BK-28: Validate activity log captures reorder event
- **Precond**: TC-1 completed (reorder applied)
- **Action**: Query activity_events table for test.reordered event
- **Expected**: Event exists with test_id, author_id, old_chain, new_chain, timestamp

### TC-12: BK-28: Validate retry-safe double-click returns no-op
- **Precond**: Test at version 2 (after TC-1 reorder)
- **Action**: PATCH with same [A,D,B,C] order + X-If-Match: 2
- **Expected**: 200, version 2 unchanged, only one test.reordered event total

---

## Coverage Summary

| Category | Count |
|---|---|
| Happy | 2 |
| No-op | 2 |
| Negative | 4 |
| Boundary | 1 |
| Integration | 3 |
| **Total** | **12** |
