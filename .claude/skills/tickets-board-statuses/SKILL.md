---
name: tickets-board-statuses
description: "Create a lean PM/QA Jira board status report based on the former jira-board-status pattern: backlog Stories ordered by shift-left viability, Ready For QA intake, and tickets where the user contributed. Use when the user mentions tickets-board-statuses, jira-board-status, board status, Jira board status, QA pipeline, Ready For QA, unassigned backlog, BK worked tickets, or asks what tickets can be refined, tested, or need context. Analysis-only; no Jira writes."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [issue-tracker, tms]
---

# Tickets Board Statuses

Produce the practical PM/QA board view from the original `jira-board-status` pattern. Keep it lean: answer what can be refined, what waits for QA, and where the user already contributed.

## Use This Skill For

- Applying the former `jira-board-status` pattern with fewer tokens.
- Finding unassigned backlog Stories and ordering them by shift-left viability.
- Finding Ready For QA tickets needing the user's attention.
- Listing tickets where the user has commented or contributed.
- Showing dependency/context evidence inside the backlog table, not as a separate table.

## Do Not Use This Skill For

- Jira writes, assignments, transitions, label changes, or comments.
- Full `/shift-left-testing` execution.
- Full `/sprint-testing` execution.
- Replacing `/acli`; this skill defines analysis and reporting, while `/acli` owns Jira CLI mechanics.

## Inputs

- Jira project key, board scope, or explicit JQL.
- User identifier for comment matching, usually Jira display/account string.
- Status names for Backlog and Ready For QA.
- Optional assignee names to include in QA intake, such as `ely`.
- Epic scope when dependency analysis should stay inside a product area.

## BK Jira Quirks

These are project learnings from Engram and should be preserved unless the Jira instance changes:

- Use `assignee is EMPTY`, not `assignee = unassigned`.
- The `[ISSUE_TRACKER_TOOL]` comment-list JSON returns `.comments[]` and comment `.author` is a plain string such as `jesusgpythondev`.
- Count user comments with exact string matching on `.author`.
- `workitem search --json` may return a root array or an object with `.issues`; parsers must handle both.
- Always use `--paginate`; default output can truncate silently.
- Query Epic Link explicitly with `"Epic Link" = <EPIC_KEY>` or `"Epic Link" is not EMPTY`.
- Missing formal Jira links do not mean no dependency exists; dependency can be functional and inferred from epic/story flow.

## Report Tables

Use these table names and questions:

| Table | Name | Question answered |
|---|---|---|
| 1 | Backlog Ready To Refine | What can be shift-lefted now, needs context, or waits for a dependency? |
| 2 | QA Intake Risk | What is waiting for QA attention or ownership? |
| 3 | My Delivery Footprint | Where has the user already contributed? |

## Table Criteria

### Table 1 - Backlog Ready To Refine

Include unassigned Story work in Backlog. Merge dependency and context assessment into this table. Sort rows by action value so the most shift-left-viable tickets appear first.

Evidence should be compact and factual:
- `formal link: <KEY>` when Jira has a dependency link.
- `functional dependency inferred: <short reason>` when no Jira link exists but epic/story flow implies order.
- `enough context` when the ticket can be refined now.

Recommended action values:
- `refine-now`
- `needs-context`
- `wait-for-parent`
- `not-a-story`

### Table 2 - QA Intake Risk

Include Ready For QA tickets that are unassigned or assigned to the agreed QA placeholder/person. If the user asks for only their active tickets, filter by exact user comment count.

If empty, show `No tickets found matching criteria`; do not omit the table.

Recommended action values:
- `qa-now`
- `needs-owner`
- `follow-up`
- `no-action`

### Table 3 - My Delivery Footprint

Include tickets where the user has at least one comment. Group by epic when possible.

Recommended action values:
- `monitor`
- `follow-up`
- `candidate-reference`
- `closed-context`

## Dependency Inference Rules

- Treat formal Jira links as facts.
- Treat epic ordering and domain sequence as inference.
- Use `functional dependency inferred`, not `blocked in Jira`, unless Jira has a formal blocker link.
- Shift-left viability is about requirements clarity, not implementation readiness.
- A ticket can be viable for refinement even if implementation depends on another ticket.
- Keep dependency detail in Table 1 only; do not create a separate dependency table.

## Output Contract

```markdown
## Tickets Board Statuses - <project/scope>

### Executive Summary
- Backlog refinable now: <count + keys>
- Needs context / parent first: <count + keys>
- Ready For QA attention: <count + keys>
- User footprint: <count + keys>

### Recommended Next Actions
| Priority | Action | Ticket(s) | Reason |
|---|---|---|---|

### Table 1 - Backlog Ready To Refine
| Key | Epic | Summary | Assignee | Context / Dependency Evidence | Recommended Action |
|---|---|---|---|---|---|

### Table 2 - QA Intake Risk
| Key | Epic | Summary | Assignee | User Comments | Recommended Action |
|---|---|---|---|---|---|

### Table 3 - My Delivery Footprint
| Key | Epic | Status | User Comments | Latest Signal | Recommended Action |
|---|---|---|---|---|---|

### Data Quality Notes
- <pagination, parser, JQL, missing field, or inference caveat>
```

## Quality Gates

- Every query that can return many issues uses pagination.
- JSON parsing handles both root arrays and `.issues` wrappers.
- Comment filters match the exact author string for the current Jira instance.
- Table 1 separates formal Jira links from functional inference in the evidence cell.
- Every table ends with a recommended action.
- The summary answers: what to refine now, what needs context, what needs QA, and where the user contributed.

## Engram Loop

- Before running analysis, retrieve Jira quirks and prior board pattern learnings from memory.
- Save new quirks only when observed in a real Jira response or confirmed by the user.
- If a JQL/parser assumption fails, save the root cause and corrected pattern.
