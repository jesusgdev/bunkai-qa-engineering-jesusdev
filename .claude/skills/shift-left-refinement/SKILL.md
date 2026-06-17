---
name: shift-left-refinement
description: "Refine a single Jira Story before development into an Ely-style shift-left package: evidence, scope, decisions, refined ACs, risks, ATP draft, QA story-point recommendation, readiness gates, and Jira publication checklist. Use for one-Story pre-sprint refinement, Jira QA-field/comment preparation, or improving a weak AC package before estimation. Use /shift-left-testing for batch backlog grooming and workflow orchestration."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker, tms]
---

# Shift-Left Refinement

Convert one under-specified Jira Story into a clear, testable, pre-sprint refinement package. Goal: shared PO/Dev/QA understanding before development starts, not test execution.

## Scope

| Use for | Do not use for | Route instead |
|---|---|---|
| Single-Story AC refinement before estimation/sprint planning | Batch selection, workflow transitions, or Stage 0 orchestration | `/shift-left-testing` |
| Former `shift-left-workflow-pattern` / BK-34 / Ely-style refinement | In-sprint QA, bug retest, ATP/ATR execution, evidence capture | `/sprint-testing` |
| Jira description, QA comment/field, or ATP DRAFT preparation | Formal Jira/Xray test cases | `/test-documentation` |
| Advisory QA story-point recommendation | Automated test code / KATA implementation | `/test-automation` |

If the Jira issue is not a Story, stop and route to the correct skill. Do not adapt this workflow to Bugs, Spikes, Tasks, or Tech-debt.

## Inputs

Read only what adds signal for the current Story:

1. Story detail via `bun run jira:sync-issues get <STORY_KEY> --include-comments`, then read the synced Markdown. If sync fails but `acli jira workitem search --jql "key = <STORY_KEY>"` can prove the issue exists and is a Story, continue with `acli` fallback for standard fields, labels, description, comments, and links. Never use `acli view` as proof that custom fields are absent; label custom-field evidence as unavailable and avoid repeated sync retries.
2. Story title, description, ACs, scope, business rules, source spec, labels, status, points, parent epic, and comments.
3. Parent epic/module context when dependencies matter.
4. `.context/business/*` and `.context/master-test-plan.md` when product/domain/test scope is unclear.
5. Relevant Engram memories for prior pattern learnings: `BK-2`, `BK-18`, `BK-27`, `BK-28`, `BK-32`, `BK-34`, `BK-38`, `BK-91`, `Ely-style`, `shift-left-workflow-pattern`, `QA Handoff Mirror`, `story points`.
6. Jira publishing rules when writing rich text: author Markdown, convert to ADF, then verify rendered/read-back content.

If labels include `shift-left-reviewed` plus a dated `shift-left-YYYY-MM-DD` from the last 30 days, surface it and ask whether to refresh or reuse. If the Story changed after that label, recommend refresh.

## Principles

Apply ATDD / Three Amigos, Given-When-Then, product trio, and Agile Testing Quadrants as analysis principles; do not copy citation prose into the output.

Story points are advisory and use Fibonacci values `1, 2, 3, 5, 8, 13, 21`. Base the QA recommendation on effort, complexity, uncertainty, and risk. Jira estimation fields remain canonical unless the user explicitly requests an update.

Evidence labels: `Jira`, `Repo`, `Engram`, `External`, `Inference`.

## Expert Panel Decision Gate

Run the former `expert-development-team-analysis` pattern through `/expert-panel-review` before final readiness. The panel must answer inferable PO/Dev/QA questions inside the ticket instead of leaving them all open.

Use `NEEDS PO/DEV CONFIRMATION` only when one of these is true:

- Jira/source evidence conflicts.
- The decision changes product scope, user promise, security posture, data retention, billing, compliance, or rollout risk.
- The implementation has two materially different architectures and repo/Jira evidence does not favor one.
- The user explicitly asks not to decide on behalf of PO/Dev.

Otherwise, record an `Expert Decision` with evidence labels and move forward. Do not mark the Story blocked merely because the original ACs were under-specified if the expert panel can make a responsible, reversible MVP decision.

## Required Package Sections

Use these H2 sections unless the user requests another format. Keep empty sections with `None identified.` so reviewers can verify completeness.

| Section | Purpose |
|---|---|
| `Metadata Snapshot` | Key, status, priority/points, reporter/assignee, labels, updated date |
| `User Story` | Persona, capability, business outcome |
| `Source & Evidence` | Inputs used and evidence labels |
| `Shift-Left Review Status` | Verdict: Ready for estimation / Needs PO confirmation / Needs Dev confirmation / Blocked |
| `Expert Review Summary` | Role findings for PO, Dev, QA, Design, Security, Workflow, Automation only when relevant |
| `Scope` | In scope, out of scope, deferred/follow-up Stories |
| `Dependency Map` | Formal and functional dependencies, owner, status, impact |
| `Key Contract Decisions` | Endpoint, state, validation, error, permission, UI-flow, or data contract decisions |
| `AC Reconciliation` | Original/source claim vs refined outcome and reason |
| `Refined Acceptance Criteria` | Gherkin-style scenarios grouped by Happy, Negative, Boundary, Integration |
| `Business Rules` | Confirmed rules; inferred rules marked clearly |
| `Edge Cases & Risk Matrix` | Severity, expected behavior, mitigation, AC/ATP coverage |
| `ATP Draft Matrix` | Outline names only, coverage target, priority, automation hint |
| `QA Story Points Recommendation` | Advisory SP, confidence, basis, rationale, re-estimation triggers, boundary |
| `Open Clarifications With Expert Recommendations` | Question, recommendation, pending owner |
| `Implementation Readiness Gates` | PO contract, Dev feasibility, QA testability, Data/API, UX, Security/Ops |
| `Handoff Notes` | PO, Dev, QA, Automation, not requested/not done |
| `QA Handoff Mirror` | Compact Jira QA comment/field mirror, not full duplication |
| `Publication Checklist` | What was or was not published/verified |
| `References` | Source links, tickets, memories, repo paths |

## Quality Gates

- ACs are the floor. Push beyond happy path into boundaries, exceptions, states, and anomalies.
- 1:N is the default for non-trivial ACs. Derive scenarios through equivalence partitions, BVA, state transitions, decision tables, or pairwise. If an AC maps to one scenario, justify why it is trivially atomic.
- Avoid padding. Every added AC, edge case, and ATP row must explore a distinct risk or contract.
- Use exact marker `NEEDS PO/DEV CONFIRMATION` only for unresolved decisions that pass the Expert Panel Decision Gate above. Never paraphrase it.
- Label every contract decision, AC change, and High risk with evidence.
- Every High risk must map to at least one refined AC or ATP row.
- Prefer fewer stronger ACs over long lists that hide new requirements.
- If ACs exceed about five independent behaviors, recommend story splitting.
- If refined ACs exceed about eight scenarios or edge cases exceed about ten, summarize in the Story description and push detailed coverage to ATP/comment mirror.
- Do not mark `Ready for estimation` unless PO contract, Dev feasibility, and QA testability gates pass or are explicitly accepted as non-blocking.
- Do not invent PO/Dev questions for clean Stories. `No significant gaps found` is valid.
- Do not ask a question already answered clearly by the ACs, description, source spec, or comments.

## ATP Draft Rules

- ATP DRAFT is outline-level only: scenario name, one-line precondition, one-line expected result.
- Include coverage estimate with zero counts shown: Positive, Negative, Boundary, Integration, API, Total.
- Include 2-3 sentence rationale tied to Story complexity and risk.
- Exclude parametrization tables, per-outline test-data JSON, numbered test steps, Faker recipes, and data generation strategy.
- Formal TC creation belongs to `/test-documentation`; automated code belongs to `/test-automation`.

## QA Story Points Recommendation

Add a compact advisory estimate to the package and QA mirror:

```markdown
## QA Story Points Recommendation
- Recommendation: <1|2|3|5|8|13|21> SP
- Confidence: <0.00-1.00>
- Basis: effort=<Low/Med/High>; complexity=<Low/Med/High>; uncertainty=<Low/Med/High>; risk=<Low/Med/High>
- Rationale: <one sentence tied to ATP size, dependencies, open confirmations, and risk>
- Re-estimation triggers: <scope change>; <new dependency>; <open confirmation resolved differently>; <security/performance/data risk expands>
- Boundary: QA recommendation only; Jira Story Points / Epic / User Story fields remain canonical unless the user explicitly requests an update.
```

Role inputs:

| Role | Contribution |
|---|---|
| PO/Product | Scope and business-value clarity |
| Dev/Architecture | Implementation complexity, dependencies, feasibility |
| QA | Coverage size, testability, edge-case risk, confidence |
| UX/Design | Flow ambiguity and user-state complexity |
| Security/Ops | Auth, permission, rollout, data, or operational risk |
| Skeptical Reviewer | Rejects inflated points without evidence |

Keep the recommendation advisory and under six lines in the QA mirror. If more justification is needed, point to `ATP Draft Matrix`, `Edge Cases & Risk Matrix`, and `Implementation Readiness Gates` instead of expanding the SP block.

## QA Handoff Mirror

The QA mirror is for Jira comments or QA fields. It complements canonical US/Epic fields; it does not duplicate the full description.

Include:

- Executive summary: what changed and why QA/PO/Dev should care.
- Refinement delta: contract decisions, AC reconciliation, high risks, ATP rows, readiness gates.
- ATP draft summary: compact scenario list or matrix.
- High/Medium risks: risk list with coverage reference.
- Open confirmations: owner + decision needed.
- Dependency note: dependencies affecting testing or estimation.
- QA story points recommendation: SP, confidence, effort/complexity/uncertainty/risk basis, re-estimation triggers, advisory boundary.
- Out of scope: what QA should not test for this Story.
- Publication status: description, AC field, ATP field/comment, labels, status, verification.

## Publication Rules

Only publish when the user explicitly requests Jira writes. If the user requested analysis only, leave every checklist item as `not requested`.

When publishing:

1. Read current synced Story content first; append, never overwrite. If synced content is unavailable but `acli` can read the Story, use that read-back as the current Story content and record the sync failure in the publication checklist.
2. Write refined ACs to `{{jira.acceptance_criteria}}`; fallback to a structured `## Acceptance Criteria` comment if the field is absent or the single verified custom-field write attempt is blocked.
3. Append a condensed `QA Refinements (Shift-Left Analysis)` section to the Story description; keep refined ACs in the AC field.
4. Write full ATP DRAFT to `{{jira.acceptance_test_plan}}`; fallback to `## Acceptance Test Plan (ATP)` comment if the field is absent or the single verified custom-field write attempt is blocked.
5. Add one QA Handoff Mirror comment/field entry. If ATP field exists, comment is a compact notification and mirror, not the full ATP body.
6. Add labels `shift-left-reviewed` and `shift-left-YYYY-MM-DD`; the dated label lets `/sprint-testing` judge freshness and skip redundant planning later.
7. Never transition beyond `{{jira.status.story.estimation}}`; PO/Dev own estimation and Ready For Dev.
8. Re-sync or visually verify rendered Jira content after writes.

Existing Jira custom fields on work items may require REST `PUT` even when `acli` can edit description/comments. If one REST custom-field update attempt fails with auth/permission/not-found while `acli` can still mutate the issue, do not loop. Publish AC/ATP as fallback comments, state `AC field updated: no (fallback comment yes)` / `ATP field updated: no (fallback comment yes)`, and save the tool mismatch as a learning if new.

Publication checklist:

```markdown
## Publication Checklist
- Description updated: yes/no/not requested
- AC field updated: yes/no/not requested
- ATP DRAFT field or fallback comment updated: yes/no/not requested
- QA Handoff Mirror comment/field updated: yes/no/not requested
- QA story points recommendation included: yes/no/not assessed
- Labels applied: `shift-left-reviewed`, `shift-left-YYYY-MM-DD` yes/no/not requested
- Transition status: no transition needed | ready for `/shift-left-testing` handoff | completed externally
- Rendered/read-back verification: yes/no/not requested
- Ownership handback: PO | Dev | QA | not requested
```

## Boundaries

- No Jira mutation unless explicitly requested.
- No smoke, browser, API, or DB execution. Feasibility is established by reading Jira, context docs, code, API maps, or schema docs only.
- No `evidence/` folder; feature does not exist yet.
- No formal TCs, ATP/ATR execution, or Xray Test creation.
- No git branch, commit, or PR. Jira is canonical for this workflow.
- No raw Markdown to Jira rich-text fields; convert to ADF first.
- No full duplication in comments when canonical fields already hold the body.

## Output Contract

Return:

```markdown
## Shift-Left Refinement - <Story Key>

### Executive Summary
<what changed, value/risk, and decision needed>

### Refined Package
<required package sections above>

### Improvement Metrics
- Contract decisions added: <count / none>
- AC reconciliation rows added: <count / none>
- High risks covered: <count / none>
- ATP draft rows added: <count / none>
- Readiness gates blocked: <list / none>
- QA story points recommendation: <SP / not assessed> (confidence <0.00>; re-estimation triggers: <list / none>)

### Publication Checklist
<checklist from Publication Rules>

### Next Action
<publish to Jira | ask PO/Dev/QA | split story | no action requested>
```

## Engram Loop

- Use recent memory first; then search targeted terms only if needed.
- Pull full observations only for the top 1-3 relevant memories.
- Apply at most 3-5 learnings; label each as validated, candidate, or conflicting.
- Save only validated decisions, user-approved conventions, repeated patterns, bugfixes, or gotchas per global Engram protocol.
