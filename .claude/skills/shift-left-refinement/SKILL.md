---
name: shift-left-refinement
description: "Refine a Jira Story before development by turning rough requirements into an Ely-style shift-left package: metadata snapshot, source evidence, expert findings, scope, dependency map, key contract decisions, AC reconciliation, Gherkin criteria, business rules, edge-case risk matrix, ATP draft, readiness gates, handoff notes, and Jira publication checklist. Use when the user mentions shift-left-workflow-pattern, shift-left refinement, pre-sprint quality review, AC refinement, BK-34/BK-28/Ely-style structure, Jira story grooming, or asks to improve a Story before estimation. This is a single-Story refinement pattern, not the full /shift-left-testing batch workflow."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker, tms]
---

# Shift-Left Refinement

Convert an under-specified Jira Story into a clear, testable, pre-sprint refinement package. The goal is shared understanding before development starts, not test execution.

## Use This Skill For

- Refining acceptance criteria before estimation or sprint planning.
- Applying the former `shift-left-workflow-pattern`.
- Rebuilding a weak refinement using the BK-34 structure.
- Rebuilding a shallow refinement using the richer Ely-style BK-2/BK-18/BK-28/BK-27 pattern.
- Checking whether a Story is good enough for `/shift-left-testing` handoff.
- Preparing Jira description content, comments, or ATP DRAFT structure.

## Do Not Use This Skill For

- Batch selection, workflow transitions, or full Stage 0 orchestration; use `/shift-left-testing`.
- In-sprint manual QA, bug retesting, ATP/ATR execution, or evidence capture; use `/sprint-testing`.
- Test case creation in Jira/Xray; use `/test-documentation`.
- Automated test code; use `/test-automation`.

## Inputs

Read only what is needed for the current Story:

1. Story title, description, acceptance criteria, scope, business rules, and source spec.
2. Parent epic or module context when dependencies matter.
3. Prior comments that contain PO, Dev, QA, or expert decisions.
4. Relevant Engram memories for prior pattern learnings: `BK-2`, `BK-18`, `BK-27`, `BK-28`, `BK-34`, `BK-91`, `Ely-style`, `shift-left-workflow-pattern`.
5. Jira publishing rules when writing rich text: use Markdown-to-ADF conversion, never raw Markdown in rich-text Jira fields.

## Professional References

Use these as principles, not as prose to copy:

- Agile Alliance ATDD / Three Amigos: product, development, and testing perspectives collaborate before implementation.
- Martin Fowler Given-When-Then: scenarios describe preconditions, behavior, and expected outcome.
- Roman Pichler story refinement: acceptance criteria should verify the story, not hide extra requirements.
- Teresa Torres product trio: product, design, and engineering perspectives reduce opinion battles.
- Agile Testing Quadrants: combine business-facing and technology-facing quality concerns.

## Refinement Structure

Use this structure unless the user asks for a different format:

````markdown
# <Story Key>: <Story Title>

## Metadata Snapshot
- Jira key: <key>
- Status: <status>
- Priority / points: <priority / points>
- Reporter / assignee: <names>
- Labels: <labels>
- Last updated: <date or unknown>

## User Story
As a <user/persona>, I want <capability>, so that <business outcome>.

## Source & Evidence
- Source spec: <link or source reference>
- Parent epic/module: <key/name>
- Evidence used: <Jira fields, comments, context files, repo files>
- Evidence labels used: Jira | Repo | Engram | External | Inference

## Shift-Left Review Status
- Verdict: Ready for estimation | Needs PO confirmation | Needs Dev confirmation | Blocked
- Summary: <one paragraph explaining value, risk, and next decision>

## Expert Review Summary
| Role | Finding | Recommendation | Confirmation |
|---|---|---|---|
| PO, Dev, QA, Design, Security, or Workflow | <finding> | <recommendation> | Confirmed / Needs confirmation / Not applicable |

## Scope
### In Scope
- <included behavior>

### Out of Scope
- <excluded behavior>

### Deferred / Follow-up Stories
- <future behavior or ticket>

## Dependency Map
| Dependency | Type | Impact | Owner | Status |
|---|---|---|---|---|
| <ticket/system/table/API> | formal / functional / inferred | <impact> | <owner> | <current state> |

## Key Contract Decisions
| Decision | Rationale | Source | Confirmation |
|---|---|---|---|
| <contract decision> | <why this is the right contract> | Jira / Repo / Engram / Inference | Confirmed / Needs PO-DEV confirmation |

## AC Reconciliation
| Original AC / source claim | Evidence | Refined outcome | Reason | Owner |
|---|---|---|---|---|
| <original or missing requirement> | <observed evidence> | kept / changed / removed / added | <why> | PO / Dev / QA |

## Refined Acceptance Criteria
Group scenarios as needed: Happy Path, Negative, Boundary, Integration.

```gherkin
Background:
  Given <shared precondition>

Scenario: <behavior>
  Given <precondition>
  When <action>
  Then <observable result>
```

## Business Rules
- <confirmed rule only; inferred rules must be marked>

## Edge Cases & Risk Matrix
| Severity | Edge case | Expected behavior | Mitigation | Coverage |
|---|---|---|---|---|
| High / Medium / Low | <case> | <expected behavior> | <mitigation> | AC/ATP reference |

## ATP Draft Matrix
| ID | Type | Scenario | Coverage target | Priority | Automation hint |
|---|---|---|---|---|---|
| <KEY>-ATC-01 | Happy / Negative / Boundary / Integration | <scenario> | <risk/rule> | High / Medium / Low | UI / API / DB / Manual |

## Open Clarifications With Expert Recommendations
### <Role> - <Topic>
- Question: <specific decision needed>
- Expert recommendation: <recommended answer and why>
- Pending confirmation: PO | Dev | Design | QA | Security

## Implementation Readiness Gates
| Gate | Status | Evidence | Blocker / Next action |
|---|---|---|---|
| PO contract | Pass / Needs / Blocked | <evidence> | <next action> |
| Dev feasibility | Pass / Needs / Blocked | <evidence> | <next action> |
| QA testability | Pass / Needs / Blocked | <evidence> | <next action> |
| Data/API | Pass / Needs / Blocked | <evidence> | <next action> |
| UX | Pass / Needs / Blocked | <evidence> | <next action> |
| Security/Ops | Pass / Needs / Blocked | <evidence> | <next action> |

## Handoff Notes
- For PO: <decision or confirmation needed>
- For Dev: <contract, dependency, or implementation risk>
- For QA: <minimum ATP and risk focus>
- For Automation: <candidate surfaces and blockers>
- Not requested / not done: <explicitly skipped work>

## QA Handoff Mirror
- Executive summary: <what changed and why QA/PO/Dev should care>
- Refinement delta: <contract decisions, AC reconciliation, high risks, ATP rows, readiness gates>
- ATP draft summary: <compact matrix or scenario list>
- High/Medium risks: <risk list with coverage reference>
- Open confirmations: <owner + decision needed>
- Dependency note: <formal and functional dependencies that affect testing>
- Out of scope: <what QA should not test for this Story>
- Publication status: <description, AC field, comment mirror, labels, status, verification>

## Publication Checklist
- Description updated: yes/no/not requested
- AC field updated: yes/no/not requested
- ATP DRAFT or comment mirror updated: yes/no/not requested
- Labels applied: `shift-left-reviewed`, `shift-left-YYYY-MM-DD` yes/no/not requested
- Transition status: no transition needed | ready for `/shift-left-testing` handoff | completed externally
- Rendered verification: re-read Jira/rendered content yes/no/not requested
- Ownership handback: PO | Dev | QA | not requested

## References
- <source links or prior tickets>
````

## Ely-Style Enrichment Rules

Use the Ely-style sections when a Story affects API, data, auth, workflow state, UX flow, permissions, integration, or cross-ticket dependencies. These sections prevent a shallow output that only has a user story and ACs.

- `Key Contract Decisions` captures decisions that Dev must implement consistently: endpoint behavior, state transitions, validation, errors, transactions, RLS, permissions, idempotency, or UI flow.
- `AC Reconciliation` is required when original ACs are vague, contradicted by repo/Jira evidence, missing negative paths, or changed during refinement.
- `Edge Cases & Risk Matrix` replaces loose risk bullets. Every High risk must map to at least one AC or ATP row.
- `ATP Draft Matrix` is a testing handoff outline only. Do not create Jira/Xray test cases here; that belongs to `/test-documentation`.
- `Implementation Readiness Gates` decides whether `Ready for estimation` is honest. If a required gate is `Blocked`, the verdict cannot be Ready.
- `Handoff Notes` tells the next PO/Dev/QA/Automation actor what remains.
- `QA Handoff Mirror` is the Jira comment/QA-field summary. It should not duplicate the full description, but it must be operationally useful: summary, deltas, ATP draft, risks, open confirmations, dependencies, out-of-scope, and publication status.

## Artifact Boundaries

Separate artifact types so shift-left does not absorb sprint execution work:

| Artifact | Belongs here? | Signals | Route elsewhere when |
|---|---|---|---|
| Shift-left refinement | Yes | ACs, decisions, risks, scope, ATP draft, open confirmations | N/A |
| Architect annotation | Input evidence | schema/API/RLS/migration notes | It becomes the whole output instead of evidence |
| Ready For QA handoff | No | deployment link, PR, "what shipped" | use `/sprint-testing` context |
| QA execution / ATR | No | pass/fail, evidence, bugs, test run result | use `/sprint-testing` |
| Jira/Xray test cases | No | formal TC creation/linking | use `/test-documentation` |

## Expert Analysis Rules

- Every open question needs four parts: role/topic heading, question, expert recommendation, pending confirmation.
- Separate confirmed facts from inferred recommendations.
- Label every contract decision, AC change, and High risk with evidence: `Jira`, `Repo`, `Engram`, `External`, or `Inference`.
- Mark any inferred AC or edge case as `NEEDS PO/DEV CONFIRMATION` when it is not explicit in the original Story.
- Prefer fewer, stronger ACs over long lists that hide new requirements.
- If acceptance criteria exceed about five independent behaviors, recommend story splitting.
- If refined ACs exceed about eight scenarios or edge cases exceed about ten, summarize in the Story description and push detailed coverage to ATP/comment mirror.
- Do not mark a Story `Ready for estimation` unless PO contract, Dev feasibility, and QA testability gates are Pass or explicitly accepted as non-blocking.
- Any referenced prior/future Story must appear in `Dependency Map`, `Out of Scope`, or `Deferred / Follow-up Stories`.
- If the output only contains User Story, Scope, ACs, and Business Rules, treat it as probably too shallow for Ely-style shift-left unless the Story is genuinely trivial.

## BK Failure Prevention

The BK-28 failure mode was: good analysis lived only in comments, but the Jira description, labels, and transition were not completed. Prevent that by reporting publication status explicitly:

```markdown
## Publication Checklist
- Description updated: yes/no/not requested
- AC field updated: yes/no/not requested
- ATP DRAFT or comment mirror updated: yes/no/not requested
- Labels applied: `shift-left-reviewed`, `shift-left-YYYY-MM-DD` yes/no/not requested
- Transition status: no transition needed | ready for `/shift-left-testing` handoff | completed externally
- Rendered verification: re-read Jira/rendered content yes/no/not requested
- Ownership handback: PO | Dev | QA | not requested
```

If the user only asked for analysis, do not mutate Jira. Still include the checklist with `not requested` so the next agent sees what remains.

## Rich Text Jira Publishing

- Author in Markdown first for review.
- Convert Markdown to ADF before Jira rich-text writes.
- Native ADF tables, panels, nested lists, and expand blocks are preferred when the content is complex.
- Do not pass raw Markdown to `--description`, `--body`, or rich-text custom fields.
- After publishing, re-read or visually verify the rendered result when the task includes Jira writes.
- When writing the QA comment or QA-field mirror, use the `QA Handoff Mirror` content, not a one-paragraph changelog. The mirror is shorter than the description but rich enough for QA, PO, and Dev to act without re-reading every section.

## Output Contract

Return:

```markdown
## Shift-Left Refinement - <Story Key>

### Executive Summary
<what changed and what decision is needed>

### Refined Package
<full structure above>

### Improvement Summary
- Contract decisions added: <count / none>
- AC reconciliation rows added: <count / none>
- High risks covered: <count / none>
- ATP draft rows added: <count / none>
- Readiness gates blocked: <list / none>

### Publication Checklist
<checklist>

### Next Action
<publish to Jira | ask PO/Dev/QA | split story | no action requested>
```

## Engram Loop

- Before refining, use recent memory first; then search only targeted terms if needed.
- Pull full observations only for the most relevant 1-3 memories.
- Convert memory into short applied learnings; do not paste long history into the output.
- Save new learning only after a validated decision, bugfix, gotcha, or accepted convention.
