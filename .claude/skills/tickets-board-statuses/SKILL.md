---
name: tickets-board-statuses
description: "Create a lean PM/QA Jira board status report from the original jira-board-status pattern: shift-left candidates, user-worked Stories ready for sprint testing, user shift-left footprint, and dependency priority map. Analysis-only; no Jira writes."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [issue-tracker, tms]
---

# Tickets Board Statuses

Produce the practical PM/QA board view from the original `jira-board-status` pattern. Keep it lean: answer what the user can shift-left next, which user-worked Stories are Ready For QA, where the user already applied shift-left, and which dependencies drive priority.

## Use This Skill For

- Finding unassigned Backlog Stories the user can take for `/shift-left-testing`.
- Finding Stories the user already worked via shift-left and that are now Ready For QA for `/sprint-testing`.
- Listing the user's shift-left footprint without comment counts.
- Mapping formal and inferred Story dependencies to recommend the next best work.

## Do Not Use This Skill For

- Jira writes, assignments, transitions, label changes, or comments.
- Full `/shift-left-testing` execution.
- Full `/sprint-testing` execution.
- Replacing `/acli`; this skill defines analysis and reporting, while `/acli` owns Jira CLI mechanics.

## Inputs

- Jira project key, board scope, or explicit JQL.
- Exact user comment author string, usually Jira display/account string such as `jesusgpythondev`.
- Status names for Backlog and Ready For QA.
- The shift-left completion label, default `shift-left-reviewed`.
- Optional epic scope when dependency analysis should stay inside a product area.

## BK Jira Quirks

- Use `assignee is EMPTY`, not `assignee = unassigned`.
- `workitem search --json` may return a root array or an object with `.issues`; parsers must handle both.
- Always use `--paginate`; default output can truncate silently.
- The `[ISSUE_TRACKER_TOOL]` comment-list JSON returns `.comments[]` and comment `.author` is a plain string such as `jesusgpythondev`.
- Count user involvement by exact string matching on `.comments[].author`, but do not display comment counts.
- Query Epic Link explicitly with `"Epic Link" = <EPIC_KEY>` or `"Epic Link" is not EMPTY` when needed.
- Missing formal Jira links do not mean no dependency exists; dependency can be functional and inferred from epic/story flow.
- Jira label exclusion must include empty labels explicitly: `(labels is EMPTY OR labels not in (shift-left-reviewed))`.
- When a JQL includes `labels in (shift-left-reviewed)`, treat the result as label-confirmed even if the search JSON omits or empties `fields.labels`.

## Report Tables

| Table | Name | Question answered |
|---|---|---|
| 1 | Shift-Left Candidates | Which unworked Backlog Stories can the user take for shift-left now? |
| 2 | Ready For My Sprint Testing | Which user-worked Stories are now Ready For QA? |
| 3 | My Shift-Left Footprint | Which Stories has the user already shift-lefted and where are they now? |
| 4 | Dependency Priority Map | Which Stories depend on others, and what should be refined/tested first? |

## Table Criteria

### Table 1 - Shift-Left Candidates

Include ONLY unassigned Story work whose current Jira status is exactly Backlog and that does NOT have the `shift-left-reviewed` label. The label means `/shift-left-testing` already processed the Story; exclude those even if they remain in Backlog.

Baseline JQL:

```jql
project = <PROJECT_KEY>
AND issuetype = Story
AND status = "Backlog"
AND assignee is EMPTY
AND (labels is EMPTY OR labels not in (shift-left-reviewed))
ORDER BY priority DESC, created ASC
```

Columns: `Key | Epic | Summary | Priority | Dependency Signal | Recommended Action`.

Recommended action values:
- `shift-left-now`
- `needs-context`
- `wait-for-parent`

### Table 2 - Ready For My Sprint Testing

Include ONLY Stories that are Ready For QA, have `shift-left-reviewed`, and have at least one exact-author comment by the current user. This identifies Stories the user already worked during shift-left and can now test with `/sprint-testing`.

Baseline JQL before comment filtering:

```jql
project = <PROJECT_KEY>
AND issuetype = Story
AND status = "Ready For QA"
AND labels in (shift-left-reviewed)
ORDER BY priority DESC, updated DESC
```

Then fetch comments for each candidate and keep only tickets where `.comments[].author == <EXACT_USER_AUTHOR>`.

Columns: `Key | Epic | Summary | Assignee | Last Signal | Recommended Action`.

Recommended action values:
- `sprint-test-now`
- `needs-context`
- `blocked`

### Table 3 - My Shift-Left Footprint

Include Stories with `shift-left-reviewed` and at least one exact-author comment by the current user. Do not show comment counts; the table is a lightweight ownership/continuity view.

Baseline JQL before comment filtering:

```jql
project = <PROJECT_KEY>
AND issuetype = Story
AND labels in (shift-left-reviewed)
AND statusCategory != Done
ORDER BY updated DESC
```

Then fetch comments for each candidate and keep only tickets where `.comments[].author == <EXACT_USER_AUTHOR>`.

Columns: `Key | Epic | Status | Summary | Next Check`.

Recommended next-check values:
- `watch-ready-for-qa`
- `sprint-test-now`
- `monitor-dev-progress`
- `closed-context`

### Table 4 - Dependency Priority Map

Include Story dependencies that affect Table 1, Table 2, or near-term refinement order. Treat formal Jira links as facts. Treat epic ordering and domain sequence as inference. Keep the table compact; include only dependencies that change priority or readiness.

Baseline JQL:

```jql
project = <PROJECT_KEY>
AND issuetype = Story
AND status not in (Closed, ABORTED, "Deployed to Production", QA Approved)
ORDER BY priority DESC, created ASC
```

Columns: `Priority | Key | Depends On | Dependency Type | Status | Recommendation`.

Recommended recommendation values:
- `do-first`
- `ready-after-parent`
- `wait`
- `reference-only`

## Dependency Inference Rules

- `formal link: <KEY>` when Jira has a dependency link.
- `functional dependency inferred: <short reason>` when no Jira link exists but epic/story flow implies order.
- Use `functional dependency inferred`, not `blocked in Jira`, unless Jira has a formal blocker link.
- Shift-left viability is about requirements clarity, not implementation readiness.
- A Story can be viable for refinement even if implementation depends on another Story.

## Output Contract

```markdown
## Tickets Board Statuses - <project/scope>

### Executive Summary
- Shift-left candidates: <count + keys>
- Ready for my sprint-testing: <count + keys>
- My shift-left footprint: <count + keys>
- Dependency-driven priority: <top recommendation>

### Table 1 - Shift-Left Candidates
| Key | Epic | Summary | Priority | Dependency Signal | Recommended Action |
|---|---|---|---|---|---|

### Table 2 - Ready For My Sprint Testing
| Key | Epic | Summary | Assignee | Last Signal | Recommended Action |
|---|---|---|---|---|---|

### Table 3 - My Shift-Left Footprint
| Key | Epic | Status | Summary | Next Check |
|---|---|---|---|---|

### Table 4 - Dependency Priority Map
| Priority | Key | Depends On | Dependency Type | Status | Recommendation |
|---|---|---|---|---|---|

### Data Quality Notes
- <pagination, parser, JQL, missing field, comment-filter, or inference caveat>
```

## Quality Gates

- Every query that can return many issues uses pagination.
- JSON parsing handles both root arrays and `.issues` wrappers.
- Table 1 excludes `shift-left-reviewed` and all post-Backlog statuses.
- Table 2 requires Ready For QA + `shift-left-reviewed` + exact user comment author.
- Table 3 requires `shift-left-reviewed` + exact user comment author, but shows no comment counts.
- Table 4 separates formal Jira links from functional inference.
- Every table stays visible; if empty, show `No tickets found matching criteria`.
- Every row ends with a recommended action or next check.

## Engram Loop

- Before running analysis, retrieve Jira quirks and prior board pattern learnings from memory.
- Save new quirks only when observed in a real Jira response or confirmed by the user.
- If a JQL/parser/comment assumption fails, save the root cause and corrected pattern.
