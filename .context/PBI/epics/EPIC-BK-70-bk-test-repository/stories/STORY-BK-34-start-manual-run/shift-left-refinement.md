# BK-34 Shift-Left Refinement

## Metadata

| Field | Value |
|---|---|
| Jira Key | BK-34 |
| Story | TMS-Run Execution | Start a manual run in a chosen environment |
| Mode | Provisional shift-left handoff |
| Date | 2026-06-08 |
| Team Pattern | expert-development-team-analysis |
| Dependency Override | BK-70 ignored by explicit user instruction for this trial |

## Story Summary

As a QA Engineer, I want to start a manual run of a Test against a chosen environment so that I get a fresh checklist where every step is pending and I can begin executing immediately.

## Expert Review Summary

| Role | Review Focus | Outcome |
|---|---|---|
| Senior PO | User value and scope | Scope is the run-start entry point only; step result updates, abort, finish, reports, and defects remain out of scope. |
| Senior Product/UX Design | Run-start flow | User must clearly see environment selection, no-ATC/no-step blockers, and success state for the newly created run. |
| Senior Technical Architect | Contracts and state | Run creation is a state-machine entry point; idempotency and environment validation need explicit API contract. |
| Senior Developers | Implementation feasibility | Requires Test, ordered steps/ATCs, project environments, run records, step-result initialization, executor metadata, and idempotency token handling. |
| Senior QA Lead | Testability | ACs need positive, negative, boundary, and integration coverage, especially duplicate-start and invalid-environment behavior. |
| Delivery/Scrum Lead | Readiness | Provisional refinement is usable for grooming, but final implementation readiness depends on confirming base Test Repository contracts. |

## Refined Scope

### In Scope

- Start a new manual Run from an existing Test.
- Select one configured Project environment before starting the Run.
- Initialize every executable Test step in `pending` state.
- Preserve step order from the Test's ATC chain/Test definition.
- Block run creation when the Test has no executable steps.
- Block run creation when selected environment is not configured for the Project.
- Support idempotent retry with the same start token within 24 hours.
- Store executor mode: `human`, `agent`, or `ci`.
- Make the new Run visible in the Test run history.

### Out Of Scope

- Marking step results pass/fail/block, covered by BK-35.
- Aborting a run, covered by BK-36.
- Viewing/filtering run history beyond immediate visibility, covered by BK-37.
- Reporting pass/fail totals, covered by BK-38.
- Finishing a run with final verdict, covered by BK-39.
- Filing/listing/syncing defects, covered by BK-40..BK-43.
- Creating or editing the underlying Test definition.

## Refined Acceptance Criteria

```gherkin
Background:
  Given an authenticated workspace member with role >= member
    And a Project exists in the active workspace
    And the Project has at least one configured environment
    And a Test exists in that Project

Scenario: Start a manual run for a Test with executable steps
  Given the Test has executable steps in a defined order
    And the user selects a configured Project environment
    And the user provides a unique start token
  When the user starts a manual Run for the Test
  Then the Run is created successfully
    And the Run is linked to the Test
    And the Run stores the selected environment
    And every executable step is initialized with status "pending"
    And the step order matches the Test definition order
    And the Run stores executor mode "human" when started by a human user

Scenario: Block run start when the Test has no executable steps
  Given the Test has no executable steps
    And the user selects a configured Project environment
  When the user starts a manual Run for the Test
  Then run creation is blocked
    And the user sees a clear message explaining that the Test needs at least one executable step
    And no Run record is created

Scenario: Block run start when selected environment is not configured for the Project
  Given the Test has executable steps
    And the selected environment is not configured for the Project
  When the user starts a manual Run for the Test
  Then run creation is blocked
    And the user sees a clear invalid-environment message
    And no Run record is created

Scenario: Retry with the same start token within 24 hours opens the existing Run
  Given a Run was already started for the same Test with start token "token-123"
    And less than 24 hours have passed
  When the user starts the same Test again with start token "token-123"
  Then the existing Run is returned
    And no duplicate Run is created
    And the user can continue from the existing pending checklist

Scenario: Same Test can start a separate Run with a different start token
  Given a Run already exists for the Test with start token "token-123"
    And the Test is otherwise executable
  When the user starts the same Test with start token "token-456"
  Then a new separate Run is created
    And the original Run remains unchanged

Scenario: Agent or CI started run stores executor mode correctly
  Given the Test has executable steps
    And the selected environment is configured for the Project
  When the Run is started by an automation agent or CI context
  Then the Run stores executor mode "agent" or "ci" according to the caller context
    And the Run remains visible to authorized project members

Scenario: Newly started Run appears in Test run history
  Given a Run is started successfully for the Test
  When a teammate with access to the Project views the Test run history
  Then the newly started Run is visible
    And the history entry includes environment, executor mode, start timestamp, and initial status
```

## Edge Cases And Risks

| Risk | Severity | Expected Handling |
|---|---|---|
| User double-clicks Start Run | High | Same start token returns existing Run; no duplicate checklist. |
| Test has zero steps/ATCs | High | Block with clear message and no DB write. |
| Environment belongs to another Project | High | Reject; do not create cross-project Run. |
| Test changed while user starts Run | Medium | Run should snapshot executable step order at creation time or explicitly define live-reference behavior. |
| Token reused after 24 hours | Medium | Needs PO/Dev confirmation: create new Run or reject expired token. |
| Executor mode cannot be inferred | Medium | Needs Dev confirmation: default to `human` for authenticated UI sessions. |
| Unauthorized user starts Run | High | Return unauthorized/forbidden and create no Run. |

## Open Questions

| Owner | Question | Why It Matters |
|---|---|---|
| PO | After the 24-hour idempotency window, should the same token create a new Run or be rejected as expired? | Defines retry semantics and user messaging. |
| PO | Should a Test with zero ATCs but manually-authored steps be executable? | Original AC says no ATCs, but Test Repository supports steps; clarify executable source. |
| Design | What exact success state should the user see after Run creation: redirect to run page, inline checklist, or toast plus history update? | Prevents implementation mismatch. |
| Dev | Should run creation snapshot step content/order or reference the Test definition live? | Affects auditability if Test changes during/after execution. |
| Dev | What field stores the 24-hour start token and what unique constraint enforces idempotency? | Needed for reliable duplicate prevention. |

## ATP Draft

| ID | Outline | Type | Priority |
|---|---|---|---|
| BK-34-ATC-01 | Start Run creates pending checklist in correct order | Positive | High |
| BK-34-ATC-02 | Start Run blocks Test with no executable steps | Negative | High |
| BK-34-ATC-03 | Start Run blocks invalid Project environment | Negative | High |
| BK-34-ATC-04 | Same token within 24 hours returns existing Run | Boundary | High |
| BK-34-ATC-05 | Different token creates separate Run | Positive | Medium |
| BK-34-ATC-06 | Agent/CI executor mode is stored correctly | Integration | Medium |
| BK-34-ATC-07 | Newly started Run appears in run history | Integration | Medium |

## Handoff Notes

- This refinement is provisional because BK-70 dependency was ignored by explicit user instruction for this trial.
- Jira custom-field update was not used because the current REST sync/custom-field path is blocked; this body should be loaded as a Jira comment fallback.
- Recommended workflow target after handoff: `Estimation`, not `Ready For Dev`.
