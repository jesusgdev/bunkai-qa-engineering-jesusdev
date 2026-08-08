# Test Session Memory: BK-34

> Shared memory across sub-agents. Each stage updates its section.
> Last updated: 2026-06-22 02:42 UTC by Session Start.

## Ticket

- ID: BK-34
- Title: TMS-Run Execution | Start a manual run in a chosen environment
- Type: Story
- Priority: Medium
- Status: Ready For QA
- Story Points: 8
- Epic / Module: BK-30 - Manual Execution & Runs
- Assignee: jesusgpythondev
- Labels: shift-left-2026-06-08, shift-left-reviewed

## Story Explanation

BK-34 lets a QA Engineer start a manual Run from an existing Test in a selected Project Environment. Starting the Run creates a fresh execution checklist by snapshotting the Test's executable steps in their defined order, setting each Run step to `pending`, storing the selected environment, and recording the executor mode.

The feature has both UI and API relevance, but the core risk is API/DB behavior: duplicate prevention through a start token, rejecting invalid environments, rejecting Tests with no executable steps, preserving step order, and keeping Run visibility inside the Project/workspace boundary.

Stage 1 should plan coverage only. It must not update Jira or create ATP/ATR until the orchestrator presents this explanation and receives user confirmation.

## Acceptance Criteria

1. Start a manual Run for a Test with executable steps and a configured Project Environment; create the Run, link it to the Test, store the environment, initialize every executable step as `pending`, preserve order, and store human executor mode.
2. Block Run start when the Test has no executable steps; show a clear message and create no Run.
3. Block Run start when the selected environment is not configured for the Project; show an invalid-environment message and create no Run.
4. Retry with the same start token within 24 hours returns the existing Run and creates no duplicate.
5. Starting the same Test with a different token creates a separate Run and leaves the original unchanged.
6. Agent or CI started Run stores executor mode as `agent` or `ci` and remains visible to authorized Project members.
7. Newly started Run appears in Test run history with environment, executor mode, start timestamp, and initial status.

## Team Discussion

- [Jira] jesusgpythondev (2026-06-07): Scope is only Run start and initial pending checklist; BK-35 through BK-43 remain separate.
- [Jira] jesusgpythondev (2026-06-07): Same-token retry, invalid environment, and zero executable steps are high-risk paths.
- [Jira] jesusgpythondev (2026-06-07): Shift-left draft has seven ATP outlines covering positive, negative, boundary, and integration paths.
- [Jira] Automation for Jira (2026-06-20): Pull request was created and merged.
- [Repo] Jira sync now places BK-34 under BK-30; legacy shift-left handoff exists under BK-70 and was used as supporting evidence only.

## Environment

- Web: `https://staging-upexbunkai.vercel.app` | API: `https://staging-upexbunkai.vercel.app/api`
- WEB_URL_OVERRIDE: none
- API_URL_OVERRIDE: none
- DB MCP: dbhub | API MCP: staging-openapi
- Preflight: staging web root returned 307; `/api/openapi` returned 200.
- Preflight: DBHub reachable; run-related tables are visible.
- Preflight: `.env` API token verified by shell against `/api/v1/me`; target workspace `a222895a-a22a-4193-9c7f-70c43e78bede` is visible.
- Preflight: OpenAPI MCP process is considered cached with an old token for this agent session; use shell/curl sourced from `.env` for workspace-specific API calls or restart the agent for MCP alignment.
- Secrets: token values were not printed or stored.

## Test Data

| Entity | ID | Name / State |
|---|---|---|
| Workspace | `a222895a-a22a-4193-9c7f-70c43e78bede` | BK-34 Sprint QA |
| Project | `f3260d03-f2ca-4db3-bd97-265cc2bf3830` | BK-34 QA Seed 20260622020948 |
| Environment | `a0b5f094-bb53-430e-a018-13fbb3931f63` | Staging |
| Test | `09d28d3c-ad29-45d9-a014-dbb7ba6ccbb2` | BK-34 Seed Manual Run Test 20260622020948 |
| Verification Run | `b7bc0422-7d42-4fe5-9c45-7bcc76bee136` | `running`; executor mode `agent`; 1 run ATC; 2 run steps |

## Repositories

- Backend: `../upex-bunkai-tms` (Next.js + Supabase + Vercel, entry `../upex-bunkai-tms/.`)
- Frontend: `../upex-bunkai-tms` (Next.js, entry `../upex-bunkai-tms/.`)

## Code Locations

### Backend (`../upex-bunkai-tms`)

- `app/api/v1/runs/route.ts` — Run creation endpoint, request idempotency, executor mode derivation, `run:execute` auth.
- `app/api/v1/runs/[id]/route.ts` — Expanded Run read endpoint.
- `lib/api/principal.ts` — cookie/PAT principal model and capability checks.
- `lib/api/middleware/bearer.ts` — PAT verification and workspace binding.

### Frontend (`../upex-bunkai-tms`)

- `app/(app)/projects/[projectSlug]/runs/[runId]/page.tsx` — Run detail page using the expanded Run RPC.

### Database (Supabase Postgres)

- `supabase/migrations/0031_runs.sql` — `project_environments`, `runs`, `run_atcs`, `run_steps`, `bunkai_create_run`, `bunkai_get_run_expanded`.

## TMS Artifacts

| Type | ID | Name | Status |
|---|---|---|---|
| ATP | - | Acceptance Test Plan | Not started; Stage 1 only |
| ATR | - | Acceptance Test Results | Not started; Stage 3 only |
| TC | - | Jira-native Test issues | Not started; Stage 4 only |

## Paths

- PBI: `.context/PBI/epics/EPIC-BK-30-manual-execution-runs/stories/STORY-BK-34-tms-run-execution-start-a-manual-run-in-a-chosen-e/`
- Module Context: `.context/PBI/epics/EPIC-BK-30-manual-execution-runs/module-context.md`
- Legacy shift-left handoff: `.context/PBI/epics/EPIC-BK-70-bk-test-repository/stories/STORY-BK-34-start-manual-run/shift-left-refinement.md`
- Session plan: `.session/sprint-testing/BK-34/plan.md`

## Expert Panel Highlights

- [Repo] QA Lead: Stage 1 minimum coverage should include successful start, no executable steps, invalid environment, same-token retry, different-token new Run, executor mode, authorization, and Run history visibility.
- [Jira] Product/UX: Success state remains open; Stage 1 should confirm whether the expected UX is redirect to Run page, inline checklist, or toast plus history update.
- [Repo] Technical Architect: Current implementation snapshots Test title, ATC titles, step content, input data, expected results, and order at Run creation.
- [Repo] AppSec: PAT auth uses bearer-first principal resolution and workspace binding; Stage 1 should include cross-workspace and insufficient-scope negative cases if API execution is in scope.
- [Engram] Engram Curator: Prior BK-34 blockers around missing seed data are resolved for the provided workspace/project/environment/test/run IDs.
- [Inference] Skeptical Reviewer: The legacy BK-70 handoff path is not current Jira truth; keep BK-30 as canonical unless the team explicitly asks to migrate historical handoff files.

## Stage Results

### Session Start

- Status: completed locally; awaiting orchestrator presentation and user confirmation before Stage 1.
- Jira detail synced read-only with `bun run jira:sync-issues get BK-34 --include-comments`.
- Project context, business maps, domain glossary, synced story/comments, legacy shift-left handoff, and targeted code were read.
- PBI folder, module context, story context, test-session memory, evidence directory, session plan, and session progress were initialized.

### Planning

- Status: completed with Jira-native ATR fallback comment.
- Risk score: 13 (High). Full ATP required because BK-34 touches Run creation, API/DB data integrity, PAT/session auth, workspace boundary, idempotency, and user-facing history/read surfaces.
- ATP: published to Jira `acceptance_test_plan` / `customfield_10120`; synced cache materialized at `acceptance-test-plan.md`.
- ATR placeholder: Jira rejected `acceptance_test_results` / `customfield_10284` because the field is not settable on BK-34's Story screen/context. User approved fallback option 2; placeholder was published as a structured Jira comment and synced into `comments.md`.
- TC timing: Jira-native outlines only; no Jira Test issues created in Stage 1.
- Coverage totals: 15 outlines total; Positive 5, Negative 6, Boundary 4, State 5, Integration 9, Security 2, Exploratory 2.
- Planned outlines:
  - BK-34-TC-01: Should start a human Run with pending checklist from executable Test.
  - BK-34-TC-02: Should reject Run start when Test has zero executable steps.
  - BK-34-TC-03: Should reject Run start with Environment outside the Test Project.
  - BK-34-TC-04: Should return existing Run for same start token within 24 hours.
  - BK-34-TC-05: Should create a separate Run for different start token.
  - BK-34-TC-06: Should store executor mode for human, agent, and ci callers.
  - BK-34-TC-07: Should show newly started Run in authorized Run history/read surface.
  - BK-34-TC-08: Should reject PAT without run execute scope.
  - BK-34-TC-09: Should prevent cross-workspace or non-visible ID disclosure.
  - BK-34-TC-10: Should handle same start token after 24 hours according to confirmed product rule.
  - BK-34-TC-11: Should collapse duplicate click or retry with same Idempotency-Key and same payload.
  - BK-34-TC-12: Should reject reused Idempotency-Key with different payload.
  - BK-34-TC-13: Should preserve Run snapshot when source Test changes after creation.
  - BK-34-TC-14: Should reject missing or invalid Idempotency-Key before Run creation.
  - BK-34-TC-15: Should reject invalid executor mode value.
- Open confirmations for Stage 2: after-24h same `start_token` expected behavior, final success UX, manual-only Test executability, immutable snapshot field set, cross-workspace response envelope/status mapping, and security fixture setup.
- Stage 2 recommended surfaces: API + DB first; UI smoke only after API/DB behavior is stable; no BK-35 through BK-43 behavior in scope.

### Execution

- Status: blocked by UI smoke tooling decision after API/DB smoke passed.
- BK-34 transitioned from `Ready For QA` to `In Test` using Jira transition ID 9 semantics.
- API smoke evidence: `.context/PBI/epics/EPIC-BK-30-manual-execution-runs/stories/STORY-BK-34-tms-run-execution-start-a-manual-run-in-a-chosen-e/evidence/bk34-stage2-api-smoke-20260622T190702Z.json`.
- API/DB results covered:
  - `/api/v1/me` returned HTTP 200 with active workspace `a222895a-a22a-4193-9c7f-70c43e78bede`, role `owner`, and `run:execute` scope.
  - Existing seed Run read returned HTTP 200 with status `running`, executor mode `agent`, 1 Run ATC, and 2 pending Run steps.
  - New Run start returned HTTP 201 for Run `174a8396-1aa1-4cfc-88a4-fbda20d30e2d`; DB confirmed 1 Run ATC, 2 Run steps, and 2 pending steps.
  - Same `start_token` retry within 24 hours returned HTTP 200, same Run ID `174a8396-1aa1-4cfc-88a4-fbda20d30e2d`, and `replayed: true`; DB confirmed only 1 row for that domain token.
  - Different `start_token` returned HTTP 201 for separate Run `a0767035-afa7-46d0-bccb-0a4ae3fe4773`.
  - Same HTTP `Idempotency-Key` and same payload returned the same Run ID `be920fa2-5e87-4d98-9c3b-59c725315e21`; DB confirmed only 1 row for that token.
  - Reused HTTP `Idempotency-Key` with different payload returned HTTP 409 and DB confirmed no row for the conflicting token.
  - Foreign environment returned HTTP 422 `environment_invalid` and DB confirmed no row for the invalid-environment token.
  - Invalid executor mode returned HTTP 422 `validation_failed` before RPC write.
  - Missing `Idempotency-Key` returned HTTP 400 `idempotency_key_required` and DB confirmed no row for that token.
  - Random/non-visible Run read returned HTTP 404 `not_found`.
- UI smoke attempt: blocked by Playwright request-context tool failure while handling sign-in response cookies (`/api/v1/auth/signin` response URL parsed as relative). Product UI was not asserted; no UI defect confirmed.
- UI smoke retry: passed using same-origin browser-page `fetch('/api/v1/auth/signin')`, without storing returned PAT/session tokens, then setting `bk_active_ws` and opening Run detail URL `https://staging-upexbunkai.vercel.app/projects/bk-34-qa-seed-20260622020948/runs/174a8396-1aa1-4cfc-88a4-fbda20d30e2d`.
- UI smoke evidence: `.context/PBI/epics/EPIC-BK-30-manual-execution-runs/stories/STORY-BK-34-tms-run-execution-start-a-manual-run-in-a-chosen-e/evidence/bk34-stage2-ui-run-detail-20260622T191824Z.json` and `.context/PBI/epics/EPIC-BK-30-manual-execution-runs/stories/STORY-BK-34-tms-run-execution-start-a-manual-run-in-a-chosen-e/evidence/bk34-stage2-ui-run-detail-20260622T191824Z.png`.
- UI assertions passed: Run title visible, pending status visible, Staging environment visible, seed Run step visible, and page was not the login/magic-link screen.

#### Transition Trail

| When | From | To | Transition ID | Notes |
|---|---|---|---|---|
| Pre-smoke | Ready For QA | In Test | 9 | Executed successfully via Jira; local sync shows `In Test`. |

### Reporting

- Status: completed.
- Final result: `PASSED WITH ISSUES`.
- ATR: published as approved Jira fallback comment because `customfield_10284` remains not settable for BK-34.
- QA summary: published as a separate Jira comment.
- Jira status: transitioned from `In Test` to `QA Approved`; local sync confirms `story.md` status `QA Approved`.
- Local report sources:
  - `.session/sprint-testing/BK-34/acceptance-test-results-final.md`
  - `.session/sprint-testing/BK-34/acceptance-test-results-final.adf.json`
  - `.session/sprint-testing/BK-34/qa-comment-final.md`
  - `.session/sprint-testing/BK-34/qa-comment-final.adf.json`

#### Transition Trail

| Scenario | From | To | Transition ID | Notes |
|---|---|---|---|---|
| Story PASSED WITH ISSUES | In Test | QA Approved | 10 | Executed successfully after ATR fallback and QA summary comments were published. |

## Bugs Found

- None confirmed during API/DB smoke. UI smoke did not reach product assertions because of tooling failure.

## Observations

- Sync created `story.md` and `comments.md` only; acceptance criteria are embedded in `story.md`.
- Current Jira parent is BK-30, while legacy shift-left handoff is stored under BK-70.
- Current route behavior creates a new Run when the same `start_token` is reused after 24 hours; shift-left recommendation proposed rejecting expired tokens. Stage 1 must decide expected behavior before writing ATP.
- Jira does not allow setting `customfield_10284` on BK-34; ATR uses fallback comment until Jira field configuration is fixed.
- Synced ATP markdown shows some identifiers with underscores degraded into emphasis markers (for example `bunkai_create_run` renders as `bunkai*create*run` in cache). Treat as a Jira/sync formatting debt; source planning file in `.session/sprint-testing/BK-34/acceptance-test-plan.md` preserves exact identifiers.

## Checklist

### Session Start

- [x] Ticket + comments fetched
- [x] Project context loaded
- [x] Module context loaded or created
- [x] Code explored (backend + frontend as applicable)
- [x] Test data candidates identified
- [x] PBI folder + context.md + test-session-memory.md created
- [x] Story Explanation written
- [ ] Playwright config set (N/A in Session Start; no UI execution yet)

### Planning (Feature)

- [x] Triage completed (Full ATP; risk score 13 High)
- [x] Test data discovered via DB
- [x] ATP created on Story; ATR placeholder created via approved fallback comment because field is not settable
- [x] Test Analysis filled in ATP
- [x] AC Gaps written (open confirmations listed)
- [x] TC outlines created with traceability model
- [x] Traceability verified for Jira-native fallback: ATP field exists; ATR placeholder exists in synced comments
- [x] ATP materialized via Jira sync

### Execution

- [x] Ticket transitioned to in-test (or skipped per substrate)
- [x] API/DB smoke test passed (Go/No-Go)
- [ ] Feature TCs executed (API/DB core and UI smoke executed; remaining optional depth cases pending decision)
- [ ] Edge cases explored beyond TCs
- [x] DB cross-validation performed (if applicable)
- [x] Evidence screenshots saved
- [x] Bugs documented (if found; none confirmed)

### Reporting

- [x] ATR report filled and marked complete
- [x] acceptance-test-results fallback materialized via Jira comments sync
- [x] QA comment posted
- [x] Ticket transitioned to the work-type terminal QA state via substrate (or skipped on FAILED)
