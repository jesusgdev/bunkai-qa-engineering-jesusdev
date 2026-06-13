---
name: shift-left-refinement
description: "Refine a Jira Story before development by turning rough requirements into a professional shift-left package: user story, source trace, in/out scope, Gherkin acceptance criteria, business rules, expert recommendations, open confirmations, and Jira publishing checklist. Use when the user mentions shift-left-workflow-pattern, shift-left refinement, pre-sprint quality review, AC refinement, BK-34-style structure, BK-28 redo, Jira story grooming, or asks to improve a story before estimation. This is a pattern/quality skill, not the full /shift-left-testing batch workflow."
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
4. Relevant Engram memories for prior pattern learnings: `BK-28`, `BK-34`, `BK-91`, `shift-left-workflow-pattern`.
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

```markdown
# <Story Key>: <Story Title>

## User Story
As a <user/persona>, I want <capability>, so that <business outcome>.

## Source
- Source spec: <link or source reference>
- Parent epic/module: <key/name>
- Evidence used: <Jira fields, comments, context files>

## Shift-Left Review Status
- Verdict: Ready for estimation | Needs PO confirmation | Needs Dev confirmation | Blocked
- Summary: <one paragraph>

## Scope
### In Scope
- <included behavior>

### Out of Scope
- <excluded behavior>

## Acceptance Criteria
### AC1: <behavior>
Given <precondition>
When <action>
Then <observable result>

## Business Rules
- <rule>

## Open Clarifications With Expert Recommendations
### <Role> - <Topic>
- Question: <specific decision needed>
- Expert recommendation: <recommended answer and why>
- Pending confirmation: PO | Dev | Design | QA | Security

## References
- <source links or prior tickets>
```

## Expert Analysis Rules

- Every open question needs four parts: role/topic heading, question, expert recommendation, pending confirmation.
- Separate confirmed facts from inferred recommendations.
- Mark any inferred AC or edge case as `NEEDS PO/DEV CONFIRMATION` when it is not explicit in the original Story.
- Prefer fewer, stronger ACs over long lists that hide new requirements.
- If acceptance criteria exceed about five independent behaviors, recommend story splitting.

## BK Failure Prevention

The BK-28 failure mode was: good analysis lived only in comments, but the Jira description, labels, and transition were not completed. Prevent that by reporting publication status explicitly:

```markdown
## Publication Checklist
- Description updated: yes/no/not requested
- ATP DRAFT or comment mirror updated: yes/no/not requested
- Labels applied: `shift-left-reviewed`, `shift-left-YYYY-MM-DD` yes/no/not requested
- Transition status: no transition needed | ready for `/shift-left-testing` handoff | completed externally
- Verification: re-read Jira/rendered content yes/no/not requested
```

If the user only asked for analysis, do not mutate Jira. Still include the checklist with `not requested` so the next agent sees what remains.

## Rich Text Jira Publishing

- Author in Markdown first for review.
- Convert Markdown to ADF before Jira rich-text writes.
- Native ADF tables, panels, nested lists, and expand blocks are preferred when the content is complex.
- Do not pass raw Markdown to `--description`, `--body`, or rich-text custom fields.
- After publishing, re-read or visually verify the rendered result when the task includes Jira writes.

## Output Contract

Return:

```markdown
## Shift-Left Refinement - <Story Key>

### Executive Summary
<what changed and what decision is needed>

### Refined Package
<full structure above>

### Risk Notes
- <testability, dependency, data, UX, security, or workflow risk>

### Publication Checklist
<checklist>
```

## Engram Loop

- Before refining, use recent memory first; then search only targeted terms if needed.
- Pull full observations only for the most relevant 1-3 memories.
- Convert memory into short applied learnings; do not paste long history into the output.
- Save new learning only after a validated decision, bugfix, gotcha, or accepted convention.
