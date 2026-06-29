# Shift-Left Refinement - BK-41

## Metadata Snapshot

| Field | Value |
|---|---|
| Key | BK-41 |
| Title | TMS-Defect List \| List and filter defects by module, status, severity |
| Type | Story |
| Status | Estimation |
| Priority | Medium |
| Jira Story Points | 1 |
| QA Story Points Recommendation | 2 SP, confidence 0.70 |
| Epic | BK-31 - Bugs & Defect Heatmap |
| Source spec | BK-026 (FR 7.2 in backend SRS) |
| Labels | shift-left-reviewed, shift-left-2026-06-27 |

## User Story

As a QA Engineer, I want to list and filter defects by module (including its sub-modules), status and severity, with counts by severity and status, so that I can focus on the defects affecting a given area without wading through everything.

## Source & Evidence

| Source | Evidence |
|---|---|
| Jira | BK-41 Story, BK-31 Epic, BK-40 sibling dependency |
| Repo | `../upex-bunkai-tms/.context/SRS/functional-specs.md` (BK-026), `api-contracts.yaml`, module migrations |
| Engram | BK-41 role learnings #393-400, field drift #402, post-publication audit #404 |

## Shift-Left Review Status

Ready for estimation from QA perspective. Dev start is conditional on BK-40 shipping the `bugs` schema and POST /bugs contract.

## Expert Review Summary

| Role | Finding | Decision |
|---|---|---|
| PO | Active-module focus is the product promise. | Archived/soft-deleted module defects hidden by default. |
| Architect | FR BK-026 requires aggregates but OpenAPI lacked them. | Response must include `aggregates.by_severity` and `aggregates.by_status`. |
| Developer | BK-41 reads data created by BK-40. | BK-41 must not own BK-40's schema migration. |
| QA Lead | Original DoD needed 1:N expansion. | 8 Gherkin ACs + 16 ATP draft rows. |
| AppSec | Aggregates can leak cross-project presence. | 403 for unauthorized project access; do not fake empty response. |
| Delivery | BK-40 precedes BK-41. | Keep BK-41 in Estimation until dependency is accepted. |
| Skeptical Reviewer | Jira 1 SP is optimistic. | QA advisory estimate: 2 SP with re-estimation triggers. |

## Scope

In scope:
- GET /api/v1/bugs list/filter endpoint.
- Filters by project, module subtree, status, severity, pagination.
- Aggregates by severity and status over the full filtered set.
- Empty state: 200 + empty data + zeroed aggregates.
- Archived/soft-deleted module defects hidden by default.

Out of scope:
- Defect filing (BK-40).
- Defect heatmap (FR 7.4 / separate Story).
- Jira sync (FR 7.5 / separate Story).
- Defect lifecycle transitions (future Story).

## Dependency Map

| Dependency | Status | Impact |
|---|---|---|
| BK-40 - Defect Filing | Ready For Dev at refinement time | Must ship `bugs` schema before BK-41 Dev start. |
| Module tree model | Existing | Subtree traversal uses `parent_module_id`, not slug-path prefix. |

## Key Contract Decisions

1. GET /api/v1/bugs returns `data` plus `aggregates.by_severity` and `aggregates.by_status`.
2. Aggregates count the full filtered set, not only the current page.
3. Module subtree traversal uses `parent_module_id` recursion.
4. Auth uses PAT scope `bugs:read` and RLS via `project_membership`.
5. Empty result is 200 + `[]` + zeroed aggregates.
6. Archived/soft-deleted module defects are hidden by default; future `include_archived=true` may opt in.

## AC Reconciliation

Original 7 DoD bullets were refined into 8 Gherkin scenarios: 7 direct DoD scenarios plus 1 expert decision scenario for archived-module default.

## Refined Acceptance Criteria

Canonical ACs are published in Jira field `customfield_10063` as a fenced `gherkin` code block.

## Business Rules

- Severity enum: P1, P2, P3, P4.
- Status enum: open, in_progress, resolved, closed.
- Combined status + severity filters use logical AND.
- Archived/soft-deleted module defects are hidden by default.

## Edge Cases & Risk Matrix

| Risk | Severity | Coverage |
|---|---|---|
| Subtree traversal correctness at depth 6 | High | AC-2 + ATP-2 |
| Aggregates drift with pagination | Medium | AC-6 + ATP-7 |
| Cross-project IDOR / aggregate leak | Medium | ATP-9 |
| BK-40 schema dependency | Medium | Dev readiness gate |

## ATP Draft Matrix

Canonical ATP Draft is published in Jira field `customfield_10067` with 16 outline rows.

## QA Story Points Recommendation

- Recommendation: 2 SP
- Confidence: 0.70
- Basis: effort=Med; complexity=Med; uncertainty=Low; risk=Low
- Rationale: read-only endpoint, but subtree CTE + aggregates + RLS/IDOR validation make Jira's current 1 SP optimistic.
- Re-estimation triggers: status transitions added to scope; BK-40 schema slips; subtree helper must be built from scratch; aggregates/pagination contract changes.
- Boundary: QA recommendation only; Jira Story Points / Epic / User Story fields remain canonical unless explicitly updated.

## Open Clarifications With Expert Recommendations

None. The Senior PO expert resolved archived-module default as hide-by-default.

## Implementation Readiness Gates

| Gate | Status |
|---|---|
| PO contract | Pass |
| Dev feasibility | Conditional on BK-40 schema |
| QA testability | Pass |
| Data/API | Pass, with OpenAPI aggregate patch needed |
| UX | Pass |
| Security/Ops | Pass |

## Handoff Notes

- PO: Review archived-module default if reporting on archived modules becomes product need.
- Dev: Patch OpenAPI to include `aggregates` and implement recursive subtree query.
- QA: Use BK-40-created defects for integration coverage.
- Automation: No existing DefectApi component; create from scratch during `/test-automation`.

## QA Handoff Mirror

Published as Jira comment `11826` and updated to show current status Estimation.

## Publication Checklist

- Description updated: yes
- AC field updated: yes (`customfield_10063`)
- ATP Draft field updated: yes (`customfield_10067`)
- QA Handoff Mirror comment updated: yes (`11826`)
- QA story points recommendation included: yes
- Labels applied: yes (`shift-left-reviewed`, `shift-left-2026-06-27`)
- Transition status: Estimation (already transitioned externally/currently)
- Rendered/read-back verification: yes via REST
- Ownership handback: PO/Dev for estimation

## References

- Jira BK-41
- Jira BK-31
- Jira BK-40
- `../upex-bunkai-tms/.context/SRS/functional-specs.md`
- `../upex-bunkai-tms/.context/SRS/api-contracts.yaml`
- Engram #393-400, #402, #404
