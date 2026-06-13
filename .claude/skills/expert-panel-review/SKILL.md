---
name: expert-panel-review
description: "Run a cross-functional expert panel to refine patterns, Jira stories, QA artifacts, workflow decisions, or skill drafts before implementation. Use when the user mentions expert-development-team-analysis, expert team, panel review, cross-functional review, refine this pattern, optimize this workflow, get experts to improve it, or asks for a self-improving Engram-connected review. The skill separates evidence from inference and converts validated learning into future improvements."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [meta-skill, issue-tracker, testing-e2e, tms]
---

# Expert Panel Review

Use a focused cross-functional panel to improve a pattern, workflow, Jira artifact, or skill before execution. The panel should make the work clearer, more repeatable, more testable, and less ambiguous.

## Core Principle

The panel compounds experience through Engram, but it must not turn every idea into a permanent rule. Treat memory as evidence, not authority. Promote a learning into a rule only when it is validated by the user, repeated across sessions, or confirmed by an observable result.

## Use This Skill For

- Applying the former `expert-development-team-analysis` pattern.
- Refining another pattern before converting it into a skill.
- Reviewing Jira Story improvements before publication.
- Improving a workflow with cross-functional perspectives.
- Deciding whether a new learning should update Engram or a skill.

## Do Not Use This Skill For

- Replacing domain skills such as `/shift-left-testing`, `/sprint-testing`, `/test-automation`, or `/test-documentation`.
- Rubber-stamping a decision already made without review.
- Creating permanent rules from a single unvalidated opinion.

## Expert Roles

Activate only roles that add signal. For small tasks, use Orchestrator, QA Lead, Engram Curator, and Skeptical Reviewer.

| Role | Use when | Contribution |
|---|---|---|
| Orchestrator | Always | Defines scope, chooses roles, keeps context small. |
| Product/Discovery | User value, ACs, prioritization, ambiguity | Clarifies outcome, customer value, and decision gaps. |
| QA Lead | Always | Converts ideas into risks, testability, gates, and acceptance checks. |
| Dev/Architecture | Technical feasibility, dependencies, maintainability | Identifies implementation constraints and coupling. |
| UX/Design | User flow, discoverability, usability | Checks clarity, feedback, consistency, and error prevention. |
| Security/AppSec | Auth, permissions, sensitive data, external exposure | Adds threat/risk questions and escalation thresholds. |
| Workflow/Jira | Statuses, labels, comments, traceability, dependencies | Keeps Jira workflow reliable and auditable. |
| Automation/KATA | ATCs, fixtures, regression, test code handoff | Finds automation candidates and KATA boundaries. |
| Engram Curator | Always | Retrieves high-signal memory and proposes learning updates. |
| Skeptical Reviewer | Always at the end | Challenges assumptions, bloat, and unvalidated rules. |

## Engram Retrieval Loop

1. Start with recent memory context.
2. If signal is missing, run 2-3 targeted searches using pattern names, ticket keys, and domain terms.
3. Read full observations only for the top 1-3 relevant memories.
4. Extract at most 3-5 applied learnings for the current task.
5. Label each learning as `validated`, `candidate`, or `conflicting`.
6. If memories conflict, ask or judge before treating either as a rule.

## Evidence Labels

Every recommendation should identify its source:

- `Engram`: prior project memory or user preference.
- `Repo`: codebase, skill, context file, or package script.
- `Jira`: observed ticket, status, comment, label, or field behavior.
- `External`: professional reference or public documentation.
- `Inference`: expert reasoning that still needs confirmation.

## Review Workflow

```text
1. Define target and success criteria.
2. Retrieve minimal Engram context.
3. Select expert roles.
4. Produce findings by role.
5. Merge findings into one optimized pattern or recommendation.
6. Run Skeptical Reviewer pass.
7. Separate accepted rules from learning candidates.
8. Ask for approval before implementation or skill conversion.
```

## Improvement Criteria

A good panel recommendation improves at least one of these:

- Clarity: fewer ambiguous instructions.
- Repeatability: same input should produce comparable output.
- Traceability: decisions link back to evidence.
- Testability: output can be verified.
- Safety: risky assumptions are surfaced early.
- Context efficiency: high-signal memory without history dumps.

## Self-Improvement Safeguards

- Do not promote a learning into a skill rule unless it has user approval, repeated evidence, or observable success.
- Keep `learning candidates` separate from `rules`.
- Any change to required tools, permissions, Jira mutation behavior, or workflow status transitions needs explicit user approval.
- Prefer small changes with clear acceptance criteria over broad process rewrites.
- The Skeptical Reviewer must reject improvements that add roles, context, or ceremony without verifiable value.

## Output Contract

Use this format for pattern or skill refinement:

```markdown
## Expert Panel Review - <target>

### Executive Summary
<decision-ready summary>

### Evidence Used
| Source | Evidence | Confidence |
|---|---|---|

### Expert Findings
| Role | Finding | Recommendation | Source Label |
|---|---|---|---|

### Optimized Pattern
<rewritten or improved workflow/pattern>

### Open Questions
| Owner | Question | Expert Recommendation | Pending Confirmation |
|---|---|---|---|

### Skill Conversion Notes
- Trigger:
- Boundaries:
- Inputs:
- Output format:
- Quality gates:
- Engram updates:

### Learning Candidates
- <candidate learning and validation needed>
```

## Subagent Use

For complex reviews, launch expert subagents in parallel. Each subagent brief should include:

1. Goal.
2. Context docs or memories to read.
3. Project standards.
4. Skills to load, if any.
5. Exact instructions.
6. Report format.
7. Rules and boundaries.

Do not let subagents mutate Jira or files unless the user explicitly approved implementation.
