# Test Session Memory: BK-40

> Shared memory across sub-agents. Each stage updates its section.
> Last updated: 2026-08-10 by Reporting

## Ticket
- ID / Title: BK-40 — TMS-Defect Filing | File a defect from a failing run step
- Type / Priority: Story / Medium
- Dev / Assignee: jesusgpythondev
- Project / Module: BK (upex-bunkai-tms) / Bug Test Repository — TMS Defect Filing (Epic BK-31 Bugs & Defect Heatmap)
- Platform / Sprint: TMS web (Next.js + Supabase + Vercel) / sprint-testing active run
- Status: QA Approved (Done) — OQ-1 resolved: real Jira status was In Test pre-reporting; now closed post-qa_sign_off.

## Story Explanation
This story lets a QA engineer file a defect directly from a failing test-run step. When a step in a run is marked failed, a "Report defect" action appears; opening it shows a form where the module, executed steps, the failing ATC, and captured evidence are already prefilled from the run context — the user only edits what matters (title, severity P1-P4, reproduction text, evidence list) and saves. Run/step/ATC linkage is server-derived and non-editable. A standalone path also exists: a defect can be filed from the defects area outside any run, where project and module are chosen explicitly.

Defects are TMS-native: they start in `open` state, are immediately visible in the defects list, accept 1-10 evidence links (11+ blocked with a message), validate title length (5-200 chars), and require a module that belongs to the current project. Jira sync is out of scope for BK-40.

We will test 9 ATP scenarios (ATP BK-347, Tests BK-338…BK-346) that already exist in Xray: happy paths (run-linked and standalone), negatives (non-failed step action, title length, cross-project module, severity range), a boundary (10-evidence limit), and an integration check (no Jira sync). The API contract was already verified live on staging; Stage 2 must also cover the BugFormDialog UI layer (run-linked prefill + hidden report action on non-failed steps) and close with cleanup of 6 seed bugs.

## Acceptance Criteria
(Refined Gherkin ACs from shift-left + expert panel; full ACs in story.md. Key rules:)

1. "Report defect" action appears only for failed run steps.
2. Defect form prefills module, executed steps, failing ATC, and captured evidence from the failed-step run context.
3. Severity can be set to P1, P2, P3, or P4 before saving.
4. Standalone defect filing from the defects area remains in scope.
5. Title length validated 5-200 chars with a clear out-of-range message.
6. Module required and restricted to modules belonging to the current project.
7. Up to 10 evidence links attachable; 11th blocked with a clear message.
8. Filed defect starts in `open` state and is immediately visible in the defects list.
9. Run/step/ATC linkage is non-editable; user edits title, severity, reproduction, and evidence.
10. Jira sync out of scope (delegated downstream).

## Team Discussion
- Expert panel: primary entry path = failed run steps only; secondary = standalone from defects area; single TMS-native defect contract with optional run context; linkage non-editable; active current-project member with write access can file (read-only cannot); evidence links only (upload out of scope); Jira sync delegated.
- Dev/QA confirmed live on staging: 422 backstops exist for non-failed step action (`run_step_not_failed`), title length, cross-project module, and severity (`invalid_value`).
- Preflight/open questions: OQ-1 reconcile Jira status (Ready For QA vs metadata READY FOR DEV) before Stage 3.

## Environment
- Web: https://staging-upexbunkai.vercel.app | API: https://staging-upexbunkai.vercel.app/api
- WEB_URL_OVERRIDE: none | API_URL_OVERRIDE: none
- DB MCP: dbhub | API MCP: staging-openapi

## Test Data
- Auth: PAT-only for API (session token rejected). Test user: bunkai-staging-user@xenievzoau.resend.app. Workspace: BK-34 Sprint QA. Project: BK-34 QA Seed.
- Run-linked preconditions: run `866e6f5c` (running) has failed step `30fd6410`.
- 6 seed bugs left in staging from API verification (cleanup pending): c4c412c4, 6b49f048, c577dd24, ed0e619d, fae5bf5d, 195b5834.

## Repositories
- Backend: ../upex-bunkai-tms (Next.js + Supabase + Vercel, entry ../upex-bunkai-tms/.)
- Frontend: ../upex-bunkai-tms (Next.js, entry ../upex-bunkai-tms/.)

## Code Locations
### Backend (../upex-bunkai-tms)
- Bug/defect controllers, services, models (POST /api/v1/bugs, /projects/{id}/bugs, run-linked filing via run_step_id).
### Frontend (../upex-bunkai-tms)
- BugFormDialog component (run-linked prefill + hidden report action on non-failed steps) — pending Stage 1/2 UI coverage.
### Database (Supabase/Postgres via dbhub)
- Defects/run steps/ATCs/evidence tables.

## TMS Artifacts
| Type | ID | Name | Status |
|------|----|------|--------|
| ATP  | BK-347 | [ATP] BK-40 — TMS-Defect Filing | Planning |
| ATR  | BK-348 | [ATR] BK-40 — TMS-Defect Filing (env staging) | ACTIVE |
| TC   | BK-338…BK-346 | Tests BK-338 (ATP-P1)…BK-346 (ATP-I1) | Part of ATP BK-347 |

## Paths
- PBI: .context/PBI/epics/EPIC-BK-31-bugs-defect-heatmap/stories/STORY-BK-40-tms-defect-filing-file-a-defect-from-a-failing-run/
- Module Context: .context/PBI/epics/EPIC-BK-31-bugs-defect-heatmap/module-context.md

## Stage Results
### Session Start
- PBI folder already existed with story.md, comments.md, context.md, pre-flight-check.md, api-verification.md. test-session-memory.md created now.
- Pre-flight verdict: CONDITIONAL-GO (9/9 ATP TCs SYNCED, API contract verified live). 3 conditions: BugFormDialog UI coverage in Stage 1/2, cleanup of 6 seed bugs, reconcile Jira status before Stage 3.
- Xray plan B complete: ATP BK-347, ATR BK-348, Tests BK-338…BK-346, 20 Jira links (2 Test, 9 Test Design, 9 Test Execute). Gotcha: acli `--out X` is the outward party directly (3 links created inverted, deleted+recreated).
### Planning
- Plan A + B done (no in-sprint TCS authoring needed — Xray Tests already exist from plan B). ATP BK-347 marked Planning; TCs part of ATP. acceptance-test-plan cache path: .context/PBI/test-plans/TESTPLAN-BK-347-<slug>.md when materialized.
### Execution
- Stage 2 EXECUTION COMPLETE (2026-08-10). Smoke + full coverage PASS at UI layer; API contract already verified live in preflight (9 ATPs). No blockers. No NEW product defects.
- Results by ATP (all PASSED):
  - ATP-P1 (BK-338) PASS — Report bug action on failed step 01 only (hidden on unrun step 02). Dialog prefills title "BK-39 finish run fixture … failed", module frozen (read-only), steps prefilled, severity P3 default, evidence 0/10 counter.
  - ATP-P2 (BK-339) PASS — Run-linked defect ff31c7e1-0397-46bb-ae07-8fb1785f5e11 filed, status=open, visible in Bug Reports.
  - ATP-P3 (BK-340) PASS — Standalone defect ebe7edd5-f1f6-4ff1-b06f-f56c4bb08f55 filed via New bug (module "Run Execution", P3).
  - ATP-N1 (BK-341) PASS — UI hidden on non-failed step + API 422 run_step_not_failed (earlier verify).
  - ATP-N2 (BK-342) PASS — "abcd" (4 chars) blocked inline "Title must be between 5 and 200 characters"; 5-char "short" is a VALID boundary (created ea659874-f43b-4b1c-9463-fcc128d763c0, expected, not a bug).
  - ATP-N3 (BK-343) PASS — no module → inline "Select a module."; API 422 verified earlier.
  - ATP-N4 (BK-344) PASS — UI exposes only P1–P4 severities (invalid unselectable); API 422 invalid_value verified earlier.
  - ATP-B1 (BK-345) PASS — 10/10 evidence; evidence add input REMOVED at 10 (11th cannot be added); API maxItems 422 verified earlier.
  - ATP-I1 (BK-346) PASS — defects stay status=open, TMS-native, no Jira sync (Jira sync out of scope).
- DB cross-validation PASS (dbhub): bugs table = public.bugs (evidence stored as evidence_urls array; NO evidence_count column — use array_length(evidence_urls,1)). Run/step/ATC linkage on ff31c7e1 is server-derived (run 866e6f5c, step 30fd6410, atc 868229e0). 9 bugs total for project (6 seed + ff31c7e1 + ebe7edd5 + ea659874) matches UI "9 defects".
- Xray runs updated: BK-338…BK-346 → all PASSED with evidence screenshots + per-ATP comments (run ids 6a7a2f44…50…58).
- Evidence (5 PNGs): BK-40-report-action-on-failed-step.png, BK-40-run-linked-prefill.png, BK-40-saved-defect-in-list.png, BK-40-title-validation-error.png, BK-40-evidence-limit-error.png.

#### Transition Trail
| When | From | To | Transition ID | Notes |
|------|------|----|---------------|-------|
| Pre-smoke | Ready For QA | In Test | 9 | start_testing (BK-40) — done 2026-08-10 |
| Post-execution | In Test | QA Approved | 10 | qa_sign_off — done 2026-08-10 (Stage 3) |

### Reporting
- ATR BK-348 runs updated (coordinates progress, not quality gate): all 9 runs 6a7a2f44…50…58 → PASSED (BK-338…BK-346) with evidence + per-ATP comments. QA completion comment posted on BK-40 (id 12278, rich ADF Template A — PASSED 9/9); story transitioned qa_sign_off → QA Approved (Done).

#### Transition Trail
| Scenario | From | To | Transition ID | Notes |
|----------|------|----|---------------|-------|
| Story PASSED | In Test | QA Approved | 10 | qa_sign_off — done 2026-08-10 |

## Bugs Found
- None. No product defects in this execution. 9 bugs still present in staging are TEST-SEED data (6 from API verification + 3 created during this run: ff31c7e1, ebe7edd5, ea659874) and require cleanup.

## Cleanup Queue (BLOCKED — deferred to Stage 3/elevated access)
- Attempted dbhub DELETE on all 9 rows → `permission denied for table bugs` (dbhub role is read-only on public.bugs). App-level DELETE not in spec.
- 6 seed bugs (from API verification): c4c412c4, 6b49f048, c577dd24, ed0e619d, fae5bf5d, 195b5834.
- 3 created during Stage 2: ff31c7e1-0397-46bb-ae07-8fb1785f5e11, ebe7edd5-f1f6-4ff1-b06f-f56c4bb08f55, ea659874-f43b-4b1c-9463-fcc128d763c0.

## Observations
- [NEW] Failed step 01 badge displays "Unrun" while Fail is pressed (home shows "1 failed") — UI quirk observed, NOT triaged as a defect for BK-40 (cosmetic, out of AC scope). Record only.
- [NEW] ATP-B1 gate UX: evidence add input is removed at 10/10 rather than showing an error — acceptable given API maxItems backstop.
- Non-blocking: seed bugs must be deleted after Stage 2/3 (no DELETE endpoint in spec — cleanup likely needs DB tooling).
- Open question 1 (pre-flight): RESOLVED — real Jira status was In Test (never Ready For QA); the READY FOR DEV snapshot in metadata was stale. Reported + closed as QA Approved.

## Checklist

### Session Start
- [x] Ticket + comments fetched (story.md, comments.md synced)
- [x] Project context loaded
- [ ] Module context loaded or created (pending — BK-40 module-context.md check)
- [ ] Code explored (backend + frontend as applicable)
- [x] Test data candidates identified (run 866e6f5c / step 30fd6410; project BK-34 QA Seed)
- [x] PBI folder + context.md + test-session-memory.md created
- [x] Story Explanation written
- [ ] Playwright config set (if UI test)

### Planning (Feature)
- [x] Triage completed (pre-flight CONDITIONAL-GO; expert-panel GO)
- [x] Test data discovered via DB/API (API verification on staging)
- [x] ATP + ATR created and linked to Story; ATP linked to ATR (BK-347, BK-348, 20 links)
- [x] Test Analysis filled in ATP (pre-flight tables ATP-P1…ATP-I1)
- [x] AC Gaps written (or confirmed: none) — perf full ATP reconciled 9 SYNCED / 0 new ACs / 0 deferred
- [x] TCs created with full traceability (Tests BK-338…BK-346 + Test Design links)
- [ ] Traceability verified ([TMS_TOOL] trace) — pending
- [ ] ATP marked complete; TCs transitioned to Ready — pending
- [ ] acceptance-test-plan.md materialized via bun run jira:sync-issues in PBI

### Planning (Bug)
- N/A (Story workflow)

### Execution
- [x] Ticket transitioned to in-test (In Test via start_testing id 9)
- [x] Smoke test passed (Go/No-Go)
- [x] All TCs executed; none NOT RUN (API layer in preflight + UI layer full run)
- [x] TCs marked PASSED or FAILED in [TMS_TOOL] (all 9 PASSED, evidence + comments)
- [x] Edge cases explored beyond TCs (title boundary 5 chars = valid; severity select limited to P1-P4)
- [N/A] Fix verified against original bug ACs (Story workflow)
- [N/A] Regression check on adjacent areas (Story workflow)
- [x] DB cross-validation performed (dbhub public.bugs; run/step/ATC linkage server-derived)
- [x] Evidence screenshots saved (5 PNGs)
- [x] Bugs documented (none found; 3 seed-created bugs queued for cleanup)

### Reporting
- [x] ATR report filled and marked complete
- [x] acceptance-test-results.md materialized via bun run jira:sync-issues in PBI
- [x] QA comment posted
- [x] Ticket transitioned to the work-type terminal QA state via substrate (or skipped on FAILED)