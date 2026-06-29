# Bug Report - BK-182

## Summary

Bearer run creation cannot resolve active workspace.

## Source

Found during BK-39 sprint-testing while creating a Run fixture for AI/CI/PAT parity coverage.

## Environment

- Environment: staging
- Auth source: Bearer PAT with scopes `atc:read`, `atc:write`, `run:execute`
- User: `bunkai-staging-user@xenievzoau.resend.app`
- Active workspace from `/api/v1/me`: `545d5efe-a168-4f32-a4be-a148a2fc96db`

## Steps To Reproduce

1. Authenticate with a valid Bearer PAT that includes `run:execute`.
2. Confirm `/api/v1/me` returns an active workspace and role.
3. Call `POST /api/v1/runs` with valid `test_id`, `environment_id`, `executor_mode`, `start_token`, and `Idempotency-Key`.

## Actual Result

The endpoint returns validation failure: `No active workspace could be resolved for this request.`

## Expected Result

Bearer callers should resolve a valid workspace membership or accept the workspace context needed for Run creation, while still enforcing membership and `run:execute` authorization.

## Impact

AI/CI/PAT callers cannot create Runs through the public start-run endpoint even when they can authenticate and have valid workspace membership. Cookie-session Run creation works, and BK-39 finish endpoint works with Bearer on an existing Run.

## Classification

- Severity: Medium
- Error type: Functional / auth-context resolution
- Blocks BK-39: No
- Related story: BK-39
