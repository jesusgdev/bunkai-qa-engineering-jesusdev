# acli Integration — Bunkai QA Engineering (BK)

> Repo-specific conventions for driving `acli` against the Bunkai TMS Jira project.
> Project key: **BK** · Site: `upexgalaxy72.atlassian.net` · Board: **Bunkai Board** (id: 7)

---

## 1. Identity + Auth

| Key | Value |
|---|---|
| `PROJECT_KEY` | `BK` |
| `ATLASSIAN_SITE` | `upexgalaxy72.atlassian.net` |
| Board name | `Bunkai Board` (id: 7, type: scrum) |
| Auth method | API token (env: `ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN`) |

**Verify auth before any mutation:**
```bash
acli jira auth status
```

---

## 2. Issue Types

| Type | ID | Purpose |
|---|---|---|
| Story | `10008` | Feature / user story |
| Bug | `10021` | Defect / bug report |
| Epic | `10000` | Epic (parent of stories) |
| Test | `10100` | Test case (Xray / TMS) |

---

## 3. Story Workflow — Statuses + Transitions

Workflow: **UPEX Feature (US) Workflow**

```
Backlog → Shift-Left QA → Estimation → Ready For Dev → In Progress → In Review → Ready For QA → In Test → QA Approved → Ready For Release → Deployed to Production
                                                                    ↓                                                    ↓
                                                              ABORTED                                              BLOCKED (defect reported)
                                                                                                                    ↓
                                                                                                              In Test (after fix)
```

| Slug | Status Name | ID | Category |
|---|---|---|---|
| `backlog` | Backlog | `10131` | new |
| `shift_left_qa` | Shift-Left QA | `10133` | indeterminate |
| `estimation` | Estimation | `10115` | indeterminate |
| `ready_for_dev` | Ready For Dev | `10105` | new |
| `in_progress` | In Progress | `3` | indeterminate |
| `in_review` | In Review | `10126` | indeterminate |
| `ready_for_qa` | Ready For QA | `10100` | new |
| `in_test` | In Test | `10134` | indeterminate |
| `blocked` | BLOCKED | `10119` | new |
| `qa_approved` | QA Approved | `10113` | done |
| `ready_for_release` | Ready For Release | `10135` | done |
| `deployed_to_production` | Deployed to Production | `10136` | done |
| `aborted` | ABORTED | `10118` | done |

**Key transitions (name → slug):**

| Transition name | From → To | Slug |
|---|---|---|
| Analyze | Backlog → Shift-Left QA | `analyze` |
| Estimate | Shift-Left QA → Estimation | `estimate` |
| Estimated and Ready to work | Estimation → Ready For Dev | `estimated_and_ready_to_work` |
| Start working | Ready For Dev → In Progress | `start_working` |
| Pull Request | In Progress → In Review | `pull_request` |
| Pushed | In Progress → Ready For QA | `pushed` |
| Deployed | In Review → Ready For QA | `deployed` |
| Start Testing | Ready For QA → In Test | `start_testing` |
| QA Sign-Off | In Test → QA Approved | `qa_sign_off` |
| defect reported | In Test → BLOCKED | `defect_reported` |
| Fix defect | BLOCKED → In Progress | `fix_defect` |
| include in release | QA Approved → Ready For Release | `include_in_release` |
| released | Ready For Release → Deployed to Production | `released` |
| back (various) | Any → previous | `back_from_*` |

**Transition recipe:**
```bash
# Transition a story by name (not ID)
acli jira workitem transition --key BK-43 --status "Shift-Left QA" --yes
```

---

## 4. Bug Workflow — Statuses

Workflow: **UPEX BUG/DEFECT LIFE CYCLE**

| Slug | Status Name | ID | Category |
|---|---|---|---|
| `open` | Open | `1` | new |
| `in_progress` | In Progress | `3` | indeterminate |
| `in_review` | In Review | `10126` | indeterminate |
| `ready_for_qa` | Ready For QA | `10100` | new |
| `closed` | Closed | `6` | done |
| `deferred` | Deferred | `10108` | indeterminate |
| `aborted` | ABORTED | `10118` | done |
| `duplicated` | Duplicated | `10109` | done |
| `rejected` | REJECTED | `10112` | done |
| `enhancement` | Enhancement | `10116` | done |
| `cannot_reproduce` | Cannot Reproduce | `10137` | done |

---

## 5. Test Case Workflow — Statuses

Workflow: **UPEX Test (TC) Workflow**

| Slug | Status Name | ID | Category |
|---|---|---|---|
| `draft` | Draft | `10125` | new |
| `in_design` | In Design | `10110` | indeterminate |
| `in_review` | In Review | `10126` | indeterminate |
| `candidate` | Candidate | `10123` | new |
| `in_automation` | In Automation | `10127` | indeterminate |
| `pull_request` | Pull Request | `10128` | indeterminate |
| `automated` | AUTOMATED | `10122` | done |
| `manual` | MANUAL | `10129` | done |
| `ready` | READY | `10106` | done |
| `deprecated` | DEPRECATED | `10130` | done |

---

## 6. Custom Fields — QA-Critical (slug → ID)

> Full catalog: `.agents/jira-fields.json`. These are the ones QA workflows touch most.
> **NEVER hardcode numeric IDs** — use slugs from `.agents/jira-fields.json` or `.agents/jira-required.yaml`.

### Story fields

| Slug | Field Name | ID | Type |
|---|---|---|---|
| `acceptance_criteria` | ✅ Acceptance Criteria (Gherkin) | `customfield_10141` | string |
| `acceptance_test_plan` | 🧪 Acceptance Test Plan (ATP) | `customfield_10120` | string |
| `acceptance_test_results` | 🧪 Acceptance Test Results (ATR) | `customfield_10284` | string |
| `test_analysis` | 🔬 Test Analysis | `customfield_10183` | string |
| `feature_test_plan` | 🧪 Feature Test Plan (QA) | `customfield_10211` | string |
| `story_points_estimation` | Story Points Estimation | `customfield_10158` | option (1/2/3/5/8/13/21) |
| `test_environment` | Test Environment 📦️ | `customfield_10136` | option (dev/qa/staging/uat/production) |

### Bug fields

| Slug | Field Name | ID | Type |
|---|---|---|---|
| `actual_result` | 🐞 Actual Result (Comportamiento) | `customfield_10133` | string |
| `expected_result` | ✅ Expected Result (Output) | `customfield_10137` | string |
| `repro_steps` | Repro Steps (Input) | `customfield_10218` | string |
| `severity` | Severity 🚩 | `customfield_10177` | option (critica/mayor/moderada/menor/trivial) |
| `error_type` | Error Type | `customfield_10190` | option |
| `root_cause` | Root Cause🐞 | `customfield_10118` | option |
| `evidence` | 🧫EVIDENCE | `customfield_10140` | string |

### Epic fields

| Slug | Field Name | ID | Type |
|---|---|---|---|
| `epic_name` | Epic Name | `customfield_10011` | string |
| `epic_status` | Epic Status | `customfield_10012` | option (to_do/in_progress/done) |

---

## 7. TMS Modality

**Modality A — Xray on Jira** (primary)

| Tool | Resolves to |
|---|---|
| `[TMS_TOOL]` | `/xray-cli` (via `bun xray`) |
| `[ISSUE_TRACKER_TOOL]` | `/acli` |

Xray entities: Test, Test Plan, Test Execution, Pre-Condition.
Generic Jira ops (stories, bugs, epics, comments, transitions): `/acli`.

---

## 8. Anti-Patterns (repo-specific)

- **A1.** NEVER push to `main` without explicit user confirmation. Solo-main flow.
- **A2.** NEVER hardcode `customfield_NNNNN` IDs. Resolve via `.agents/jira-fields.json` slugs.
- **A3.** NEVER skip `acli jira auth status` before batch mutations.
- **A4.** NEVER use `--paginate` omission in scripts that count or iterate results.
- **A5.** NEVER rewrite pushed history (rebase/amend on pushed commits). No force-push to shared branches.
- **A6.** NEVER include AI attribution ("Generated with Claude Code", "Co-Authored-By: Claude") in commits.
- **A7.** NEVER assume `acli workitem edit` accepts custom-field values — it hard-rejects. Use REST PUT for editing rich-text custom fields on existing items.

---

## 9. Common JQL Patterns

```bash
# All unassigned stories
acli jira workitem search --jql "project = BK AND assignee is EMPTY AND type = Story" --paginate

# Stories in a specific status
acli jira workitem search --jql "project = BK AND status = 'Backlog' AND type = Story" --paginate --json

# Bugs open or in progress
acli jira workitem search --jql "project = BK AND type = Bug AND status in (Open, 'In Progress')" --paginate

# Stories linked to an epic
acli jira workitem search --jql "project = BK AND 'Epic Link' = BK-44" --paginate

# Recently updated
acli jira workitem search --jql "project = BK ORDER BY updated DESC" --limit 5 --json
```

---

## 10. CI / Scripting Notes

- Auth env vars loaded from `.env`: `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`, `ATLASSIAN_URL`
- MCP auth failure = STOP immediately. No workaround. Fix `.env` + restart agent session.
- `acli` binary version: pin in production pipelines. Check with `acli --version`.
- Pre-commit hooks: Husky (lint-staged + type check + vars check). Stale `kata-manifest.json` blocks commits.
