# Acceptance Test Report - BK-39

## QA Completion Summary

**Verdict**: PASSED WITH FOLLOW-UP
**Environment**: staging (`https://staging-upexbunkai.vercel.app`)
**Tester**: `bunkai-staging-user@xenievzoau.resend.app`
**Date**: 2026-06-26 UTC

BK-39 final-run finish behavior passed API, UI, and DB validation for the core story contract. One dependency follow-up remains: Bearer-based `POST /api/v1/runs` could not resolve active workspace, now tracked as BK-182. The BK-39 finish endpoint itself accepted Bearer `run:execute` and closed existing Runs correctly.

## Results

| Area | Result | Evidence |
|---|---|---|
| Finish success | PASS | Run `81ddd65f-d11b-44d0-b9c4-5e9bc09dc1d3` -> `passed`, `finished_at`, version `2`. |
| Pending steps skipped | PASS | DB shows `2` skipped, `0` pending after finish. |
| Missing verdict guard | PASS | Run `3e3a66ba-2912-48f0-b97a-ce53b2363060` returned 422 `finish_verdict_invalid` and stayed `running`. |
| Terminal guard | PASS | Retry finish on `81ddd65f-d11b-44d0-b9c4-5e9bc09dc1d3` returned 409 `run_not_finishable`. |
| Concurrent finish | PASS | Run `a0c00be8-e440-440a-a42e-291cab3fb843`: one request 200, competing request 409. |
| UI finish flow | PASS | Run `0ee62287-ad06-4faf-b00b-b7c961143c9c`: modal warned `2 pending steps will be marked skipped`; final verdict visible. |
| Already-executed result preservation | NOT RUN | No public step-result update endpoint available to put a step into executed state before finish. |

## Evidence

| Type | Path / Query |
|---|---|
| Screenshot | `evidence/BK-39-ui-final-verdict.png` |
| API output | Captured in session logs for finish 200/409/422 and concurrency first-wins. |
| DB cross-check | `public.runs`, `public.run_atcs`, `public.run_steps`, `public.activity_log` for listed Run IDs. |

## Test Data Used

| Entity | ID / Value | Cleanup |
|---|---|---|
| Workspace | `545d5efe-a168-4f32-a4be-a148a2fc96db` | Existing staging QA workspace; no cleanup. |
| Project | `d75e73ac-b42a-487e-99e8-ac55859fc392` | Existing BK-34 seed project; no cleanup. |
| Test fixture | `174d3ad2-89d0-49b0-aafa-469d0b11d9a0` | Keep as reusable BK-39 sprint fixture. |
| Runs | `81ddd65f-d11b-44d0-b9c4-5e9bc09dc1d3`, `3e3a66ba-2912-48f0-b97a-ce53b2363060`, `a0c00be8-e440-440a-a42e-291cab3fb843`, `0ee62287-ad06-4faf-b00b-b7c961143c9c` | Historical execution evidence; no destructive cleanup. |

## Defects / Follow-Up

| Type | Summary | Severity | Blocks BK-39? |
|---|---|---|---|
| BK-182 | Bearer `POST /api/v1/runs` failed with `No active workspace could be resolved for this request`; cookie-session creation works. | Medium | No - BK-39 finish endpoint passed with Bearer on existing Run. |

## AC Verified Behaviors

| Behavior | Status |
|---|---|
| Finish an in-progress Run with `passed` or `failed` | PASS |
| Record finish time | PASS |
| Mark pending steps skipped | PASS |
| Preserve executed step results | NOT RUN - no step-result update endpoint in scope |
| Block missing verdict | PASS |
| Block already closed Run | PASS |
| Handle concurrent finish attempts consistently | PASS |
| Show final verdict and finish time in UI | PASS |
| Failed verdict independent from defect lifecycle | PASS by scope/implementation contract |

## Final Recommendation

Move BK-39 forward as QA passed with a documented follow-up for PAT/Bearer Run creation. Do not block the BK-39 finish-verdict story on that dependency because the finish endpoint, UI, DB mutation, and audit behavior satisfy the story's core acceptance contract.
