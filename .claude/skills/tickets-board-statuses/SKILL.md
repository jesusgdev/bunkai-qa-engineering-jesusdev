---
name: tickets-board-statuses
description: "Create a token-efficient PM/QA Jira board status report: shift-left candidates, user-worked Stories needing follow-up or sprint testing, and dependency priority. Analysis-only; no Jira writes."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [issue-tracker, tms]
---

# Tickets Board Statuses

Produce a lean PM/QA board view that answers: what can be shift-lefted next, which user-worked Stories now need `/sprint-testing`, where the user already applied shift-left, and which dependencies drive priority.

Optimize for low token/process cost: query small fields, derive related views from the same result set, and avoid duplicate comment checks.

## Use This Skill For

- Finding unassigned Backlog Stories the user can take for `/shift-left-testing`.
- Finding user-worked `shift-left-reviewed` Stories that are Ready For QA for `/sprint-testing`.
- Listing the user's shift-left continuity without comment counts.
- Mapping formal or inferred dependencies that change next-work priority.

## Do Not Use This Skill For

- Jira writes, assignments, transitions, labels, comments, or mutations.
- Full `/shift-left-testing` or `/sprint-testing` execution.
- Replacing `/acli`; this skill defines analysis and reporting, while `/acli` owns Jira CLI mechanics.

## Inputs

- Jira project key, board scope, or explicit JQL.
- Exact user comment author string, e.g. `jesusgpythondev`.
- Status names for Backlog and Ready For QA.
- Shift-left completion label, default `shift-left-reviewed`.
- Optional epic/product scope for dependency analysis.

## Jira Quirks And Cost Rules

- Use `assignee is EMPTY`, not `assignee = unassigned`.
- Use `--paginate` for every search that feeds decisions.
- Request minimal fields on searches: `key,parent,summary,status,priority,assignee,labels,updated,created,issuelinks` as needed.
- `workitem search --json` may return a root array or an object with `.issues`; parsers must handle both.
- Comment list returns `.comments[]`; `.comments[].author` is a plain string. Match it exactly and do not display comment counts.
- Build one unique comment-check key set per run. Fetch comments once per key and cache `hasExactUserComment`.
- Jira label exclusion must include empty labels: `(labels is EMPTY OR labels not in (shift-left-reviewed))`.
- When JQL includes `labels in (shift-left-reviewed)`, treat the result as label-confirmed even if search JSON omits labels.
- To read Epic Link/parent via `workitem view`, request explicit fields: `--fields 'key,parent'` or `--fields '*all'`. Default view omits parent.
- Do not use `--fields '*all'` during normal runs; reserve it for one-off diagnostics.

## Optimized Execution Plan

1. Retrieve recent Engram/Jira quirks. Apply only validated or directly observed learnings.

2. Query shift-left candidates once:

```jql
project = <PROJECT_KEY>
AND issuetype = Story
AND status = "Backlog"
AND assignee is EMPTY
AND (labels is EMPTY OR labels not in (shift-left-reviewed))
ORDER BY priority DESC, created ASC
```

Use fields: `key,parent,summary,priority,status,labels,created`.

3. Query user-worked shift-left seed once:

```jql
project = <PROJECT_KEY>
AND issuetype = Story
AND labels in (shift-left-reviewed)
AND statusCategory != Done
ORDER BY updated DESC
```

Use fields: `key,parent,summary,status,assignee,priority,updated`.

4. Filter the seed by exact user comments. De-duplicate keys first; run `workitem comment list --key <KEY> --json` once per unique key; keep rows where `.comments[].author == <EXACT_USER_AUTHOR>`.

5. Derive both continuity views from the filtered seed:
- `Ready for my sprint-testing` count/keys = filtered rows where status is exactly Ready For QA.
- `My Shift-Left Continuity` table = all filtered rows, with `Next Action = sprint-test-now` for Ready For QA rows.

6. Build dependency scope from Table 1 keys, filtered continuity keys, their parent/Epic keys, formal `issuelinks`, and only same-scope sibling Stories that change readiness or priority. Use the old broad active-Story query only as fallback when parent/link data is missing.

Fallback dependency JQL:

```jql
project = <PROJECT_KEY>
AND issuetype = Story
AND status not in (Closed, ABORTED, "Deployed to Production", QA Approved)
ORDER BY priority DESC, created ASC
```

## Report Tables

| Table | Name | Question answered |
|---|---|---|
| 1 | Shift-Left Candidates | Which unworked Backlog Stories can the user take now? |
| 2 | My Shift-Left Continuity | Which user-worked Stories need monitoring or sprint testing? |
| 3 | Dependency Priority Map | Which Stories drive near-term order? |

## Table Rules

### Table 1 - Shift-Left Candidates

Include only unassigned Story work in exact Backlog status without `shift-left-reviewed`.

Columns: `Key | Epic | Summary | Priority | Dependency Signal | Recommended Action`.

Recommended actions: `shift-left-now`, `needs-context`, `wait-for-parent`.

### Table 2 - My Shift-Left Continuity

Include only `shift-left-reviewed`, non-Done Stories with at least one exact-author comment by the current user. Do not show comment counts.

Columns: `Key | Epic | Status | Summary | Assignee | Next Action`.

Next actions: `sprint-test-now`, `watch-ready-for-qa`, `monitor-dev-progress`, `closed-context`.

### Table 3 - Dependency Priority Map

Include only dependencies that affect Table 1, Ready For QA follow-up, or near-term refinement order. Formal Jira links are facts. Epic/story flow is inference.

Columns: `Priority | Key | Depends On | Dependency Type | Status | Recommendation`.

Recommendations: `do-first`, `ready-after-parent`, `wait`, `reference-only`.

## Dependency Rules

- Use `formal link: <KEY>` only when Jira has a dependency link.
- Use `functional dependency inferred: <short reason>` when epic/story flow implies order without a Jira link.
- Do not call inferred dependencies `blocked in Jira`.
- Shift-left viability is requirements clarity, not implementation readiness.
- A Story can be viable for refinement even if implementation depends on another Story.

## Output Contract

```markdown
## Tickets Board Statuses - <project/scope>

### Executive Summary
- Shift-left candidates: <count + keys>
- Ready for my sprint-testing: <count + keys derived from Table 2>
- My shift-left footprint: <count + keys from Table 2>
- Dependency-driven priority: <top recommendation>

### Table 1 - Shift-Left Candidates
| Key | Epic | Summary | Priority | Dependency Signal | Recommended Action |
|---|---|---|---|---|---|

### Table 2 - My Shift-Left Continuity
| Key | Epic | Status | Summary | Assignee | Next Action |
|---|---|---|---|---|---|

### Table 3 - Dependency Priority Map
| Priority | Key | Depends On | Dependency Type | Status | Recommendation |
|---|---|---|---|---|---|

### Data Quality Notes
- <pagination, field selection, parser, comment-filter, fallback, or inference caveat>
```

If a table is empty, show `No tickets found matching criteria`.

## Quality Gates

- Search queries use `--paginate` and minimal `--fields`.
- Parser handles root array and `.issues` wrapper.
- Table 1 excludes `shift-left-reviewed` and all post-Backlog statuses.
- Table 2 requires `shift-left-reviewed`, non-Done, and exact user comment author.
- Ready For QA sprint-testing count is derived from Table 2, not from a separate comment-filter pass.
- Dependency map separates formal Jira links from functional inference.
- Broad active-board dependency query is fallback only; note when used.
- Every row ends with an action or recommendation.

## Engram Loop

- Before analysis, retrieve Jira quirks and prior board pattern learnings from memory.
- Save new quirks only when observed in a real Jira response or confirmed by the user.
- If a JQL/parser/comment assumption fails, save the root cause and corrected pattern.
