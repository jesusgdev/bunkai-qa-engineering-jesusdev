---
name: sprint-testing-refinement
description: "Pre-sprint reconciliation layer between shift-left refinement and sprint-testing execution. Use when a Story moves to Ready For QA to reconcile the shift-left ATP against sprint reality before investing in full Stage 1 Planning. Produces a pre-flight check report: ATP sync status, test-data readiness, open questions, reporting handoff guard, expert-audit closure requirement, and a GO/CONDITIONAL-GO/NO-GO verdict. TMS modality-aware: resolves jira-native vs jira-xray and records ATP/ATR Xray entity keys when applicable. This skill does NOT modify /sprint-testing — it feeds it. Triggers on: refine this for sprint, pre-flight check, reconcile shift-left ATP, before sprint-testing, QA intake review. Do NOT use for: writing ATPs (use /shift-left-testing or /sprint-testing Stage 1), running tests (use /sprint-testing), batch refinement (use /shift-left-testing)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker]
---

# Sprint Testing Refinement — Pre-Flight Intake Layer

Reconciles shift-left outputs with sprint-ready reality before `/sprint-testing` Stage 1. Feeds `/sprint-testing` with a verified ATP and a GO/CONDITIONAL-GO/NO-GO verdict. Does NOT replace `/sprint-testing` — it optimizes the investment in it.

TMS modality-aware: resolves **jira-native** (`/acli`) vs **jira-xray** (`bun xray`) per Story before Phase 0, and when Xray is active the pre-flight record carries ATP/ATR **Xray entity keys** so Stage 1 binds the correct Test Plan and Test Execution.

Industry lineage: this skill is an Agile Test Readiness Review (TRR) — a formal gate before entering the testing phase, with entry/exit criteria. Sources: DoD TRR (AcqNotes), ISTQB Test Management, Agile lightweight-test-artifacts doctrine (Tricentis, qasphere).

---

## Purpose

Bridge the desync gap between shift-left (pre-sprint AC refinement + ATP draft) and sprint execution (Stage 1 Planning). Without this layer, two failure modes occur:

1. **Over-planning**: ATP authored against a stale assumption → wasted Planning effort on TCs that don't reflect current state.
2. **Under-execution**: ATP claims 25 TCs, only 19 get executed, quality posture is unclear (root cause: BK-27 ATP desync).

This skill detects both before time is invested.

**Modality is one-shot per Story** (D5 rule, mirrored from `test-documentation`): never mix jira-native and jira-xray inside the same Story's ATP. Phase -0.5 resolves the effective TMS modality before any ATP reading or writing.

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
- `sprint-testing/SKILL.md` — ATP structure expected by Stage 1 (includes its modality-aware TC-creation timing section).
- `test-documentation/SKILL.md` — the Phase 0 TMS-modality-resolution gate (jira-native vs jira-xray) that this skill's Phase -0.5 mirrors. It must be resolved before any ATP read: `jira-native` → ATP lives in the Story's `{{jira.acceptance_test_plan}}` field; `jira-xray` → ATP/ATR are Xray Test Plan + Test artifacts, read/written via `[TMS_TOOL]`.
- `xray-cli/SKILL.md` — `bun xray` command syntax for ATP/ATR entity resolution, environment pinning, and bug ↔ run defect linking when modality is **jira-xray**.
- `acli/SKILL.md` + `acli/references/adf-authoring-style.md` — Jira Bug field publishing, ADF panels/status lozenges, and live `editmeta` verification when a follow-up defect must be filed (either modality files the Bug via `[ISSUE_TRACKER_TOOL]`).

---

## Inputs

Read in this order:

1. Story via `bun run jira:sync-issues get <KEY> --include-comments` → `story.md`, `acceptance-criteria.md`, `acceptance-test-plan.md`, `comments.md`. Also scan `comments.md` for existing `QA Testing Complete`, `TEST RESULTS`, or prior ATR comments that must be preserved in the Stage 3 reporting handoff.
2. `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/shift-left-refinement.md` — if it exists.
3. ATP source — **modality-aware** (see Phase -0.5): **jira-native** → `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/acceptance-test-plan.md` (synced from Story field). **jira-xray** → Xray Test Plan issue `description` (and any synced `test-plans/TESTPLAN-<KEY>-<slug>.md`) via `[TMS_TOOL]`; Test artifacts are the actual TCs.
4. `.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/context.md` — session notes from prior work.
5. `.context/business/business-data-map.md`, `business-feature-map.md`, `business-api-map.md` — domain context.
6. `.agents/project.yaml` — project identity, `{{PROJECT_KEY}}`, `testing.tms_cli`/`testing.default_env` (resolves Phase -0.5).
7. `.agents/jira-required.yaml` — Jira field slugs.
8. `.env` — test-user credentials. In **jira-xray** modality, confirm Xray credentials availability via `[TMS_TOOL]` (auth status check).

---

## Output

```
.context/PBI/epics/EPIC-<KEY>-<slug>/stories/STORY-<KEY>-<slug>/
  pre-flight-check.md   # This skill's output — feeds sprint-testing Session Start §0.7
```

The `pre-flight-check.md` is the canonical pre-flight artifact. `/sprint-testing` Session Start §0.7 reads it conditionally (verdict line first; full read only on CONDITIONAL-GO/NO-GO). Also appends a pre-flight summary to `context.md`.

In **jira-xray** modality, the pre-flight record also carries the **ATP/ATR Xray entity keys** and the **pinned test environment** so `/sprint-testing` Stage 1 binds the correct Test Plan and Test Execution (see Phase -0.5 and §3.3).

---

## Phase -0.5 — TMS Modality Resolution

Resolve the effective TMS modality BEFORE reading or writing any ATP/ATR. Mirror the `test-documentation` Phase 0 gate. Modality is one-shot per Story; never mix modalities.

Probe sequence (auto, in order):

1. **Check `CLAUDE.md` for `{{TMS_CLI}}`.** Value `bun xray` (or any Xray CLI) → **Modality jira-xray**. Value unset, `acli`-only, or equal to `{{ISSUE_TRACKER_CLI}}` → **Modality jira-native**.
2. **Check `.agents/project.yaml` `testing.tms_cli` / `testing.default_env`** — mirror the project's declared modality/config. `testing.tms_cli` == `bun xray` (any Xray CLI) → **Modality jira-xray**; otherwise → jira-native.
3. If still ambiguous, list existing issue types via `[ISSUE_TRACKER_TOOL] List issue types`. If the project exposes `Test Plan` / `Test Execution` / `Test Set` / `Pre-Condition` → **Modality jira-xray**. Otherwise → **Modality jira-native**.

Only ask the user if ALL auto-checks fail to disambiguate.

Persist the result to `progress.md` and `plan.md`:

| Phase -0.5 Out | Modality jira-native | Modality jira-xray |
|---|---|---|
| Resolved modality | jira-native | jira-xray |
| TMS tool bound | `[TMS_TOOL]` falls through to `[ISSUE_TRACKER_TOOL]` (`/acli`) | `[TMS_TOOL]` = `/xray-cli` (`bun xray`) |
| ATP source | Story field `{{jira.acceptance_test_plan}}` → synced `acceptance-test-plan.md` | Xray Test Plan (`Test Plan` issue) — read via `[TMS_TOOL]` + Jira layer |
| ATR source | Story field `{{jira.acceptance_test_results}}` | Xray Test artifact / Test Execution — read via `[TMS_TOOL]` |
| Pre-flight output | `pre-flight-check.md` without Xray keys | `pre-flight-check.md` + **ATP/ATR entity keys** + pinned test environment |

**jira-xray only — resolve the Xray entity keys, do NOT create them, before Phase 3.** Read/confirm `ATP Key` (Test Plan) and `ATR Key` (Test Execution) using `[TMS_TOOL]` read commands (`plan list` / `exec list`). If the Test Plan or Test Execution does not already exist, record it as a **GAP** in the pre-flight report plus the identifying parameters to create it (`plan create` / `exec create --environment <ENV>`), and delegate creation to Stage 1 under a GO verdict. Never create Xray entities during a read-only refinement pass — a NO-GO verdict would orphan them. Record resolved keys in the pre-flight report.

Gotchas (mirror `test-documentation`):
- **Never mix modalities** inside one Story's ATP (D5); Phase -0.5 is one-shot.
- `bun xray` requires `ATLASSIAN_URL`/`.xray-cli/config.json` ready; if `/xray-cli` auth fails, that is a hard **NO-GO** with pointer to `.env` keys — do not silently fall back to jira-native.
- The ATP (Test Plan) is a **Jira issue of type `Test Plan`** — a Test Content absent the Story-field model; stage 1 binds test cases to it via `plan add-tests`.

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

**jira-xray count source**: in Modality jira-xray derive N from the Test Plan's linked `Test` artifacts (`[TMS_TOOL] plan list` / `trace`), not from the Story field. M = linked Tests still executable; K = plus any new ACs without a synced Test. Same semantics, different container — never count from the Story-field mirror in Xray mode.

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
| TMS infra down (jira-xray: `[TMS_TOOL]` auth/CLI failure) | **GATE — not a content verdict** | Fix files `.env`/`.xray-cli/config.json`, verify via `[TMS_TOOL]` auth status, re-run Phase -0.5 probe. This is an infrastructure rendezvous, not a story-refinement blocker — do not conflate it with a content NO-GO. |

### 3.2 Defect classification (pre-execution)

If bugs found during reconciliation (AC discrepancy, stale assumption), classify now:

| Class | Definition | Blocks Story? |
|---|---|---|
| **NO-BLOCKING** | Cosmetic, edge-case, known limitation. Core ACs unaffected. | No |
| **BLOCKING** | Core AC fails or cannot be verified. | Yes |
| **CRITICAL** | Data integrity, security, or core flow broken. | Yes — escalate |

### 3.2.1 Bug-report handoff guard (BK-182 rule)

When pre-flight detects a likely defect, or predicts that `/sprint-testing` may need to file a follow-up bug, record the reporting contract that Stage 3 must satisfy. A Jira Bug is not complete if the repro exists only in a comment.

**Bug vs defect naming.** Use `defect` as the QA-formal classification when observed behavior is a product flaw that can cause the system to fail its required function. Use the Jira issue type actually configured in the workspace for operational tracking; in Bunkai that is `Bug` under the `UPEX BUG/DEFECT LIFE CYCLE`. Do not rename or migrate an existing issue to `Defect` unless live Jira exposes a distinct `Defect` issue type and the user approves the workflow change.

| Required surface | Rule | Verification |
|---|---|---|
| Jira Bug description | Use a rich ADF description with concise sections: Summary, Triage Snapshot, Repro Steps, Expected Result, Actual Result, Evidence, Workaround, Developer Notes, Related. Use `acli/references/adf-authoring-style.md`: red/error panel for the bug, yellow/warning panel for impact, green/success panel only for a valid workaround, tables for step/evidence matrices. | Round-trip with `[ISSUE_TRACKER_TOOL] view <BUG_KEY> description` and confirm ADF nodes render as panels/tables/statuses. |
| Native Bug fields | Fill the configured Bug fields, not only the description/comment: Actual Result, Expected Result, Repro Steps when available, Severity, Error Type, Test Environment, Evidence, Workaround, Frequency, Root Cause/Fix if known, Priority, Component, Labels. | Query live `editmeta` for the specific Bug before mutation; project field catalogs can drift from the active Jira screen. If a cached `customfield_*` is rejected or names a different field, query live `/rest/api/3/field` by exact field name and use the live id only after confirming the field's schema. |
| Evidence source | Store the evidence index in the native `Evidence` field and attach screenshots/logs where applicable. Comments are supplemental and should embed the most useful evidence inline so reviewers do not have to hunt through the Attachments panel. | Live Jira readback shows `Evidence` populated, attachment count > 0 when screenshots/logs exist, and the evidence comment contains one heading per evidence item. |
| Evidence attachments | Use 1-2 high-signal files named `{BUG_KEY}-step{NN}-{action}.{ext}`. For images, use `acli/scripts/jira-attach-media.ts` or the equivalent upload-to-media-node helper so each title is followed by its inline image in the comment. | Round-trip the comment and verify `media_count` equals the number of embedded images; verify Attachments lists the same filenames. |
| Evidence authenticity | Do not invent historical screenshots. If original evidence is missing, either request the original captures or reproduce the behavior now, sanitize secrets, and label it as fresh reproduction evidence with date/context. | Evidence title/comment states whether it is original execution evidence or fresh reproduction evidence; token/password values are absent. |
| Story traceability | Link the Bug to the source Story using the required link type (`Problem/Incident` or `Blocks` when blocking; fallback `Relates` only if necessary). | Verify links with `[ISSUE_TRACKER_TOOL]` from both Story and Bug when direction matters. |
| Duplicate cleanup | Remove obsolete comment-only bug reports after the Bug fields are populated and user confirms deletion. | `[ISSUE_TRACKER_TOOL] list comments <BUG_KEY>` shows no redundant `Bug Report - <KEY>` comment. |

Recommended Bug description shell:

```markdown
# <BUG_KEY> Bug Report

> [!ERROR]
> {status:red|BUG} <one-line failure>

> [!WARNING]
> {status:yellow|IMPACT} <who/what is affected and why it matters>

## Summary
## Triage Snapshot
| Field | Value |
|---|---|
| Severity | ... |
| Priority | ... |
| Error Type | ... |
| Environment | ... |

## Repro Steps
| # | Action | Expected |
|---|---|---|

## Expected Result
## Actual Result
## Evidence

Use a compact matrix in the description or native Evidence field, then attach/embed the actual files in a separate evidence comment:

| Evidence | Attachment | Result |
|---|---|---|
| <endpoint/UI state> | `<BUG_KEY>-stepNN-<action>.png` | <observed result> |

In the evidence comment, use:
- `## Evidence attachments - <BUG_KEY>`
- one `### Evidence NN - <title>` heading per file
- one short paragraph explaining what the image/log proves
- the inline media node immediately after that paragraph

## Workaround
> [!SUCCESS]
> {status:green|PARTIAL WORKAROUND} <only if real>

## Developer Notes
## Related
```

Use existing board examples as calibration anchors before publishing: Ely/Nahuel-style reports favor concise `Repro`, `Expected`, `Actual`, `Root Cause`, `Impact`, `Fix`, `Related` sections. External best-practice anchors: Atlassian bug report templates and QA guidance agree on environment, severity/priority, reproducible steps, expected vs actual, impact, and evidence.

### 3.3 Pre-flight report template

Write to `pre-flight-check.md`. **Keep lean** — TL;DR verdict line first (consumer reads 1 line in GO case), small tables, no prose padding. Target ≤25 lines (≤30 with the Modality + Xray Entity Keys sections in jira-xray modality).

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

## Modality

**Modality**: {jira-native | jira-xray}

<!-- only in jira-xray modality -->
## Xray Entity Keys

| Key | Value |
|---|---|
| ATP (Test Plan) | {{PROJECT_KEY}}-<planKey> |
| ATR (Test Execution) | {{PROJECT_KEY}}-<execKey> |
| Test Environment | {staging / prod / dev} |
<!-- /only -->

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
| **GO** | Inform user story is ready. Proceed to `/sprint-testing` Stage 1. `pre-flight-check.md` read as input in Session Start §0.7. In jira-xray modality, the Xray entity keys + pinned environment from the pre-flight record must be passed to Stage 1 (no re-discovery). |
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
| `Expert Panel Review - Sprint Testing Audit <KEY>` | Expert panel. Required as a separate closure comment after ATR + QA verdict, for accepted and failed/rejected outcomes. | Hallmark nits re-check: evidence uniqueness (EVID-DUP), evidence-count consistency (DOC-COUNT), replayable payloads (REPLAY). A package with those three patterns trips a **CONDITIONAL audit** even when all ATCs pass. |
| Bug-field completion for every new defect | Bug-report handoff guard §3.2.1 | Every filed Bug must use native Bug fields + rich ADF description. Comment-only bug reports are deemed not audit-ready. |
| Xray run status + Test evidence (jira-xray) | Xray Test Execution | Stage 3 must update Test Execution runs (`run status --id <runId> --status <status>` where status ∈ PASSED/FAILED/TODO/EXECUTING), pin `Test Environment`, and link bugs to executions (`run defect`) when applicable. Pre-flight pins the environment so Stage 3 has no drift. |

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

**Canonical accepted layout (BK-38, published as a normal Jira comment)**: accepted-but-nits audits use the following structure — keep the green `VALIDATED` verdict but still flag procedural gaps as acceptable findings:

```markdown
### Expert Panel Review - Sprint Testing Audit <KEY>

**Verdict**: 🟢 **VALIDATED** — {1-line acceptance statement; nits flagged as non-blocking}

---

### Executive Summary
### Evidence Used

| Source | Evidence | Confidence |
|---|---|---|

### Expert Findings

| Role | Finding | Recommendation | Evidence label |
|---|---|---|---|

### Verdict
{code block with verdict lines}

**Release recommendation**: {Proceed / Blocked}

---

### Learning Candidates
```

The enumerated findings use **evidence labels** (e.g. `EVID-DUP-001`, `DOC-COUNT-002`, `REPLAY-003`) so recurring procedural patterns are machine-searchable across runs. Operators should carry an `evidence labels` list (`EVID-DUP-*`, `DOC-COUNT-*`, `REPLAY-*`, plus others) across runs; re-tripping a known label makes the audit blocking pre-flight (see §3.5 evidence-contract row).

Append to `context.md`:
```markdown
## Pre-Flight Check
**Verdict**: {GO | CONDITIONAL-GO | NO-GO | DEFER} · **Date**: {date} · **Report**: pre-flight-check.md · **Deferred**: {TC IDs}
**TMS Modality**: {jira-native | jira-xray} · **ATP Key**: {jira-xray: <ATP Key>, else n/a} · **ATR Key**: {jira-xray: <ATR Key>, else n/a} · **Env**: {staging/dev/prod}
**Reporting handoff**: final ATR must embed `QA Completion Summary` with environment, result, defects, test data, AC verified behaviors, and cleanup/restoration notes where applicable.
**Bug reporting handoff**: if a follow-up defect is filed, Stage 3 must populate Jira-native Bug fields and rich ADF description; comments are supplemental only and redundant comment-only reports must be removed after confirmation.
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
6. **Comment-only bug report ≠ complete Bug**: a Jira Bug must carry the report in native fields + description. A comment can preserve chronology, but it cannot replace `Actual Result`, `Expected Result`, `Evidence`, severity, environment, component, labels, and traceability.
7. **Live `editmeta` beats cached field catalogs**: before mutating Bug custom fields, inspect the specific issue's `editmeta`; Jira screens can expose different field IDs than `.agents/jira-fields.json`. Rich text fields may require full ADF docs, not plain strings.
8. **Bug vs defect is two-layered**: classify the behavior as a formal QA `defect` when it is a product flaw, but use the configured Jira work type (`Bug` in Bunkai) unless live Jira exposes a separate `Defect` type and the user approves the change.
9. **Evidence must be visible, not merely listed**: an `Evidence` field with filenames but no attachments, or attachments without an indexed inline comment, is incomplete. High-signal evidence should have a title, a short explanation, and its associated image/log attachment.
10. **Modality gates everything downstream**: once Phase -0.5 resolves jira-xray, every ATP/ATR reference must go through `[TMS_TOOL]` (`bun xray`) — the Story's `{{jira.acceptance_test_plan}}` field is not the source of truth. Do not fall back to jira-native reads or writes mid-Story; that is the D5 mixing violation.
11. **Byte-identical screenshots are not separate evidence**: before shipping evidence, md5-compare every capture in the run. Two PNGs sharing an md5 (e.g. an "isolation" shot re-using the "empty state" capture) trips `EVID-DUP-*` and degrades the audit even when all ATCs pass — regenerate, don't duplicate a file.
12. **Reconcile evidence counts before publishing**: the ATR/report screenshot count must equal the actual files inside `evidence/`. A 7-vs-8 mismatch trips `DOC-COUNT-002`; derive the count from the directory or update it explicitly.
13. **Subagent over-diagnosis of tooling blocks progress**: a subagent asked to "finish stage 5 + verdict" can burn the whole session troubleshooting unrelated framework health and report Stage 3/5 blocked — while the actual run is complete and the verdict publishable. Brief the subagent to proceed with execution using the canonical CLI and to surface tooling issues as a side note, NOT as a stop condition.

---

## Language

All artifacts in English. Conversation mirrors the user's language.
