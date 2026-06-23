---
name: sprint-testing-refinement
description: "Pre-sprint reconciliation layer between shift-left refinement and sprint-testing execution. Use when a Story moves to Ready For QA to reconcile the shift-left ATP against sprint reality before investing in full Stage 1 Planning. Produces a pre-flight check report: ATP sync status, test-data readiness, open questions, reporting handoff guard, expert-audit closure requirement, and a GO/CONDITIONAL-GO/NO-GO verdict. This skill does NOT modify /sprint-testing — it feeds it. Triggers on: refine this for sprint, pre-flight check, reconcile shift-left ATP, before sprint-testing, QA intake review. Do NOT use for: writing ATPs (use /shift-left-testing or /sprint-testing Stage 1), running tests (use /sprint-testing), batch refinement (use /shift-left-testing)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker]
---

# Sprint Testing Refinement — Pre-Flight Intake Layer

Reconciles shift-left outputs with sprint-ready reality before `/sprint-testing` Stage 1. Feeds `/sprint-testing` with a verified ATP and a GO/CONDITIONAL-GO/NO-GO verdict. Does NOT replace `/sprint-testing` — it optimizes the investment in it.

Industry lineage: this skill is an Agile Test Readiness Review (TRR) — a formal gate before entering the testing phase, with entry/exit criteria. Sources: DoD TRR (AcqNotes), ISTQB Test Management, Agile lightweight-test-artifacts doctrine (Tricentis, qasphere).

---

## Purpose

Bridge the desync gap between shift-left (pre-sprint AC refinement + ATP draft) and sprint execution (Stage 1 Planning). Without this layer, two failure modes occur:

1. **Over-planning**: ATP authored against a stale assumption → wasted Planning effort on TCs that don't reflect current state.
2. **Under-execution**: ATP claims 25 TCs, only 19 get executed, quality posture is unclear (root cause: BK-27 ATP desync).

This skill detects both before time is invested.

---

## Scope

| Use for | Do not use for | Route instead |
|---|---|---|
| Single Story pre-flight before `/sprint-testing` | Writing ATPs or AC refinement | `/shift-left-testing` or `/sprint-testing` Stage 1 |
| Reconciling shift-left ATP vs current story state | Running tests or capturing evidence | `/sprint-testing` Stage 2 |
| Decision: proceed to Stage 1 or surface blockers | Bug retest or regression testing | `/sprint-testing` (Bug mode) |
| Smoke-subset identification for time-constrained sprints | Batch sprint orchestration | `/sprint-testing` (batch mode) |

---

## When to invoke

Invoke when ALL of:
- A Story transitions to `Ready For QA` (or equivalent sprint-ready status).
- The Story has `shift-left-reviewed` label (dated <30 days) OR an `acceptance-test-plan.md` on disk.
- The user says "refine this for sprint", "pre-flight check", "QA intake", "before sprint-testing".

If NO shift-left artifacts AND NO prior ATP → skip this skill, go directly to `/sprint-testing` Stage 1. Nothing to reconcile.

---

## Dependencies

Requires `agentic-qa-core`. Reads on demand:
- `shift-left-refinement/SKILL.md` — shift-left output structure (this skill consumes its artifacts).
- `sprint-testing/SKILL.md` — ATP structure expected by Stage 1.

---

## Inputs

Read in this order:

1. Story via `bun run jira:sync-issues get <KEY> --include-comments` → `story.md`, `acceptance-criteria.md`, `acceptance-test-plan.md`, `comments.md`. Also scan `comments.md` for existing `QA Testing Complete`, `TEST RESULTS`, or prior ATR comments that must be preserved in the Stage 3 reporting handoff.
2. `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/shift-left-refinement.md` — if it exists.
3. `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/acceptance-test-plan.md` — ATP from shift-left or prior attempt.
4. `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/context.md` — session notes from prior work.
5. `.context/business/business-data-map.md`, `business-feature-map.md`, `business-api-map.md` — domain context.
6. `.agents/project.yaml` — project identity, `{{PROJECT_KEY}}`, active environment.
7. `.agents/jira-required.yaml` — Jira field slugs.
8. `.env` — test-user credentials.

---

## Output

```
.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/
  pre-flight-check.md   # This skill's output — feeds sprint-testing Session Start §0.7
```

The `pre-flight-check.md` is the canonical pre-flight artifact. `/sprint-testing` Session Start §0.7 reads it conditionally (verdict line first; full read only on CONDITIONAL-GO/NO-GO). Also appends a pre-flight summary to `context.md`.

---

## Phase 0 — ATP Reconcile (scope + data)

For each TC in the shift-left ATP (or `acceptance-test-plan.md`):

### 0.1 TC audit

| Check | Signal if NO |
|---|---|
| AC still matches story description? | STALE |
| TC still feasible given current implementation? | INVALIDATED |
| Preconditions still match current system state? | NEEDS UPDATE |
| Test data still available in staging? | DATA BLOCKED |
| TC scope still accurate? | SCOPE DRIFT |

Mark each TC group: **SYNCED** / **STALE** / **INVALIDATED** / **NEEDS UPDATE** / **DATA BLOCKED**.

### 0.2 Count reconciliation

| Metric | Value | Notes |
|---|---|---|
| Shift-left ATP TCs claimed | N | From `shift-left-refinement.md` or `acceptance-test-plan.md` |
| Executable TCs after reconcile | M | After removing invalidated/stale/blocked |
| Missing TCs (in story but not in ATP) | K | New ACs added after shift-left |
| Coverage delta | N - M | Discrepancy to explain |

**Critical finding**: if `M < N × 0.8` (≥20% TCs invalidated/blocked) → HIGH RISK. If `K > 0` → NEW ACs detected.

### 0.3 Data blockers

Distinguish:
- **Hard block**: data required but no creation path → TCs DEFERRED.
- **Soft block**: data can be created with effort → note creation method.

### 0.4 Workspace membership check (data accessibility)

For each TC group that requires existing test data (Tests, Runs, ATCs in the DB), verify the data is accessible to the active user's workspace — not just that it exists. A `SELECT ... WHERE workspace_id = X` match is insufficient if the active user's token belongs to workspace Y.

| Check | How | Signal if NO |
|---|---|---|
| Test data exists in staging DB? | `[DB_TOOL]` query on target table | DATA BLOCKED |
| Test data belongs to active user's workspace? | Cross-reference `workspace_id` with `GET /api/v1/me` `active_workspace_id` | WORKSPACE MISMATCH |
| Active user has write access to that workspace? | `GET /api/v1/me` → `active_workspace_role` (owner/member) | PERMISSION GAP |

**WORKSPACE MISMATCH** is a soft block: either create new test data in the active workspace, or switch to a workspace that has the required data. Surface in the pre-flight report so smoke doesn't fail on a 403 `not_a_member` at Stage 2.

### 0.5 Group headers

Adopt group header convention (from `acceptance-test-planning.md` Phase 4). Group TCs by functional area: `## GROUP: <Group Name>`. Example: `CRUD with position rebalance`, `Auth session lifecycle`.

---

## Phase 1 — Smoke Subset Identification

When sprint time is constrained, identify minimum viable smoke subset. Smoke inclusion criteria:
1. Covers core happy-path (≥1 TC per critical AC).
2. Each TC in subset is SYNCED (not stale/invalidated/blocked).
3. Smoke subset ≤ 30% of total executable TCs.

| Subset | TCs | Coverage | When |
|---|---|---|---|
| Smoke | TC-X, TC-Y, TC-Z | Core ACs pass | Time-constrained sprint |
| Full | All executable TCs | All ACs + risk-beyond-AC | Standard sprint |

---

## Phase 2 — Open Questions

| # | Question | Impact if unanswered | Owner | Priority |
|---|---|---|---|---|
| 1 | {question} | {blocks which TC} | PO / Dev / QA | HIGH / MEDIUM |

Common patterns: test-data creation path unclear → blocks DATA BLOCKED TCs; AC ambiguity on edge case → blocks TC group; external dependency availability → blocks integration TCs; auth token/session behavior in headless → affects API TCs.

---

## Phase 3 — Verdict + Report + Handoff

### 3.1 Decision matrix

| Condition | Verdict | Action |
|---|---|---|
| All TCs SYNCED + test data available + no open questions | **GO** | Proceed to `/sprint-testing` Stage 1 |
| ≥1 TC INVALIDATED/STALE OR hard data block | **CONDITIONAL-GO** | Surface blockers; execute available TCs; DEFER blocked |
| ≥50% TCs invalidated OR critical open question unresolved | **NO-GO** | Return to `/shift-left-testing` or Story refinement |
| Any TC DATA BLOCKED | **DEFER** those TCs | Mark DEFERRED in report; continue with available |

### 3.2 Defect classification (pre-execution)

If bugs found during reconciliation (AC discrepancy, stale assumption), classify now:

| Class | Definition | Blocks Story? |
|---|---|---|
| **NO-BLOCKING** | Cosmetic, edge-case, known limitation. Core ACs unaffected. | No |
| **BLOCKING** | Core AC fails or cannot be verified. | Yes |
| **CRITICAL** | Data integrity, security, or core flow broken. | Yes — escalate |

### 3.3 Pre-flight report template

Write to `pre-flight-check.md`. **Keep lean** — TL;DR verdict line first (consumer reads 1 line in GO case), 4 small tables, no prose padding. Target ≤25 lines.

```markdown
# Pre-Flight Check — {{PROJECT_KEY}}-{number}

**Verdict**: {GO | CONDITIONAL-GO | NO-GO | DEFER}
**Date**: {date}
**Story**: {title}

## ATP Reconciliation

| TC | Group | Status | Notes |
|---|---|---|---|
| TC-1 | Group A | SYNCED | — |
| TC-2 | Group A | STALE | AC changed after shift-left |

**Summary**: {N} claimed → {M} executable → {K} new ACs → {D} deferred

## Test-Data Readiness

{Hard blocks / Soft blocks table — omit if all SYNCED}

## Smoke Subset (omit if GO + standard sprint)

| Subset | TCs | Coverage |
|---|---|---|
| Smoke | TC-X, TC-Y | Core ACs |

## Open Questions (omit if none)

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | ... | PO | HIGH |

## Verdict Rationale

{1-2 lines for CONDITIONAL-GO/NO-GO/DEFER; omit for GO}

**Next step**: {proceed to Stage 1 / resolve blockers / return to shift-left}
```

### 3.4 Handoff

| Verdict | Action |
|---|---|
| **GO** | Inform user story is ready. Proceed to `/sprint-testing` Stage 1. `pre-flight-check.md` read as input in Session Start §0.7. |
| **CONDITIONAL-GO** | Present blockers + recommended TC subset. Ask user: proceed with available + defer blocked, OR resolve blockers first (which owner)? |
| **NO-GO** | Surface critical finding. Recommend returning to `/shift-left-testing` or Story refinement. |
| **DEFER** | Mark blocked TCs DEFERRED. Proceed with available TCs; DEFERRED noted for next sprint. |

### 3.5 Reporting handoff guard

Before handing off to `/sprint-testing`, record the final reporting requirement that Stage 3 must satisfy:

| Required in final ATR | Source | Notes |
|---|---|---|
| `QA Completion Summary` | Pre-flight execution plan or prior `QA Testing Complete` comment | Must be embedded in the main ATR, not only in a separate quick verdict comment. |
| Environment + result + defects | Test execution summary | Include pass count and deferred/dropped scope notes. |
| Test data used | Test data readiness table | Include IDs, workspace, role, and cleanup/restoration notes. |
| AC verified behaviors | ATP reconciliation table | Include AC/behavior/status rows, not only TC IDs. |
| `Expert Panel Review - Sprint Testing Audit <KEY>` | Expert panel closure | Required as a separate closure comment after ATR + QA verdict, for accepted and failed/rejected outcomes. |

If `/sprint-testing` also posts a separate `QA Testing Complete - <KEY>` comment, keep it as a quick-scan verdict, but do not let it be the only place where environment, test data, verified behaviors, defects, or cleanup notes live. This guard prevents the BK-32/BK-33 failure mode where the main ATR was structured but the completion summary was stranded in a separate comment.

Stage 3 must also create an `Expert Panel Review - Sprint Testing Audit <KEY>` closure comment using the same section contract seen in BK-32/BK-33/BK-28/BK-34:

```markdown
# Expert Panel Review - Sprint Testing Audit <KEY>

> [!SUCCESS]
> {status:green|VALIDATED} Sprint-testing package accepted. No execution rerun needed.

## Executive Summary
## Evidence Used
## Expert Findings
## Report Improvements Added
## Residual Follow-Up
## Panel Verdict
VERDICT: ACCEPTED
```

If sprint-testing fails, is blocked, or the expert panel rejects the package, keep the same structure but switch the status panel to the correct negative state:

```markdown
# Expert Panel Review - Sprint Testing Audit <KEY>

> [!CAUTION]
> {status:red|FAILED} Sprint-testing package rejected. Rerun or remediation required.

## Executive Summary
## Evidence Used
## Expert Findings
## Report Improvements Added
## Residual Follow-Up
## Panel Verdict
VERDICT: FAILED
```

Use `FAILED` when execution evidence proves failing behavior or blocking defects. Use `REJECTED` when the report package is not audit-ready even if some execution passed. Use `BLOCKED` when environment/data/tooling prevents a valid verdict. In all negative cases, the red panel must explain whether the next action is rerun, defect filing, data repair, or reporting remediation.

Append to `context.md`:
```markdown
## Pre-Flight Check
**Verdict**: {GO | CONDITIONAL-GO | NO-GO | DEFER} · **Date**: {date} · **Report**: pre-flight-check.md · **Deferred**: {TC IDs}
**Reporting handoff**: final ATR must embed `QA Completion Summary` with environment, result, defects, test data, AC verified behaviors, and cleanup/restoration notes where applicable.
**Expert audit handoff**: Stage 3 must publish `Expert Panel Review - Sprint Testing Audit <KEY>` with green `VALIDATED` success panel when accepted, or red `FAILED`/`REJECTED`/`BLOCKED` panel when not accepted.
```

---

## Session Management

- Session state: `.session/sprint-testing-refinement/<JIRA_KEY>/`
- Single-ticket only (no batch mode).
- Progress file: `progress.md` with phase entries.
- Archive: after verdict delivered + user confirms next step.

---

## Gotchas

1. **Read shift-left artifacts first** — if `shift-left-refinement.md` does not exist AND no `acceptance-test-plan.md` → skip this skill. Nothing to reconcile.
2. **Stale ≠ Invalidated**: STALE = AC changed but TC intent valid with update. INVALIDATED = entire TC obsolete.
3. **DEFER ≠ FAIL**: DEFERRED TC = external constraint (data/env/permiso), not a defect. Story can PASS with DEFERRED TCs documented.
4. **Separate verdict comment ≠ complete ATR**: a `QA Testing Complete` comment is useful for quick scan, but the main ATR must still embed `QA Completion Summary` with environment, result, test data, verified behaviors, defects, and cleanup/restoration notes.
5. **Expert audit closure is mandatory**: every Stage 3 package needs an `Expert Panel Review - Sprint Testing Audit <KEY>` comment. Accepted packages use a green `VALIDATED` success panel. Failed, rejected, or blocked packages use a red status panel and preserve the same headings so failures remain audit-ready.

---

## Language

All artifacts in English. Conversation mirrors the user's language.
