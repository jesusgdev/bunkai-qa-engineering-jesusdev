---
name: git-flow-master-refinement
description: "Use alongside /git-flow-master when a dirty worktree needs expert staging classification before commit/push. Inventories modified and untracked files, groups changes by responsibility, excludes secrets/local artifacts, proposes atomic conventional commits with exact path lists, and records which paths are intentionally left out. This is an advisory refinement skill; it does not replace /git-flow-master and does not run git mutations by itself."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
---

# Git Flow Master Refinement

Advisory companion for `/git-flow-master` when a worktree has many modified or untracked files and needs a safe commit plan before staging.

## Use This Skill For

- Classifying dirty worktrees into atomic conventional commits.
- Reviewing modified + untracked files before staging.
- Separating product, test, docs, generated metadata, config, and tooling changes.
- Creating a commit plan with exact paths per commit.
- Flagging files that should stay unstaged or need user confirmation.
- **Staging all changes and creating intelligent commits** when user requests "add all changes to staging" or similar.
- **Expert validation** via `/expert-panel-review` before finalizing the commit plan.

## Automatic Workflow

When invoked, this skill:

1. **Reads repo state** via `/git-flow-master` Step 1 outputs.
2. **Classifies all files** (staged, modified, untracked) by responsibility.
3. **Creates a commit plan** with atomic conventional commits and exact paths.
4. **Runs expert validation** via `/expert-panel-review` to verify the plan.
5. **Executes the commits** one by one after user approval.
6. **Pushes to the target branch** (default: `main`).

## Expert Validation

Before finalizing any commit plan, this skill MUST invoke `/expert-panel-review` to:

- **Validate commit grouping** — ensure files are correctly classified by responsibility.
- **Verify commit messages** — check conventional commit format and clarity.
- **Review safety rules** — confirm no secrets, artifacts, or unrelated changes are staged.
- **Assess risk** — identify any changes that might break existing functionality.

The expert panel consists of:
- **Senior QA Lead** — validates test coverage and quality implications.
- **Senior Technical Architect** — reviews architectural impact.
- **Security/AppSec Engineer** — ensures no security risks are introduced.
- **Delivery/Scrum Lead** — verifies alignment with project goals.

If the expert panel raises concerns, the commit plan is revised before execution.

## Do Not Use This Skill For

- Branch creation, commits, push, PR creation, conflict resolution, or strategy setup. Use `/git-flow-master` for those actions.
- Replacing `/git-flow-master` safety rules.
- Running destructive git commands or broad staging commands.

## Required Inputs

Read current repo state first via `/git-flow-master` Step 1 outputs:

- `git status --porcelain` or `git status --short`
- `git diff --stat`
- Relevant `git diff -- <path>` for each changed group
- For untracked files, inspect content/type before recommending staging

## Classification Rules

- Classify by responsibility and outcome, not by directory alone.
- Identify the dominant change type per file cluster: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- If supporting files exist only because of the dominant change, keep them in the same commit.
- If files are independently meaningful without the dominant change, split them.
- In `solo-main`, small independent housekeeping items may share one `chore:` commit; in PR-heavy flows, split them for clean review/revert.
- Keep product change + direct tests/docs/fixtures together.
- Keep pure test changes + required fixtures/data together in a `test:` commit.
- Keep generated schemas/codegen with the change that required regeneration; use a separate commit only for generated-only refreshes.
- Keep generated skill metadata (`REGISTRY.md`, lock files, generated presentations) in a generated/metadata commit unless the repository convention says otherwise.

## Safety Rules

- Never recommend `git add -A` or `git add .`.
- Stage explicit paths only.
- Include untracked files only when the user asks for all changes or confirms they belong to the work.
- Never stage secrets or local-only artifacts: `.env*`, credentials, tokens, auth/session state, generated evidence, logs, caches, screenshots, reports, or ignored files unless explicitly requested and safe.
- Triage untracked binaries at repo root. Files like `.png`, `.jpg`, `.log`, `.csv`, `.zip`, or `.pdf` outside known project directories are likely evidence/temp exports; ask before including them.
- If ownership or purpose of a file is unclear, stop and ask before staging.

## Output Contract

Return this plan to `/git-flow-master` before any staging:

```markdown
## Git Commit Refinement Plan

### Repo State
- Branch: <branch>
- Upstream: <status>
- Staged: <count>
- Modified: <count>
- Untracked: <count>

### Commit Plan
| # | Commit message | Responsibility | Exact paths |
|---|---|---|---|
| 1 | `<type>(scope): summary` | <why these files belong together> | `<path>`<br>`<path>` |

### Excluded Or Needs Confirmation
| Path | Reason | Recommendation |
|---|---|---|
| `<path>` | <secret/artifact/unclear/generated/etc.> | exclude / ask / include only if confirmed |

### Verification Before Commit
- `git diff --check`
- `git diff --cached --check` after staging
- Project checks required by `package.json` and project rules
```

## Execution Mode

When the user requests "add all changes to staging and push to main" or similar:

1. **Stage all changes** using explicit paths (never `git add -A` or `git add .`).
2. **Classify files** into atomic commits by responsibility.
3. **Run expert validation** via `/expert-panel-review`.
4. **Execute commits** one by one with conventional commit messages.
5. **Push to main** after all commits are complete.
6. **Report results** — list all commits created and confirm push.

## Handoff Back To `/git-flow-master`

After the user approves the plan, `/git-flow-master` owns staging, committing, push confirmation, PR creation, and conflict recovery. This skill never mutates git state.

**Exception**: In "automatic mode" (user requests full staging + push), this skill executes the approved plan directly without handing off to `/git-flow-master`.
