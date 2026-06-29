# BK-182 Jira Field Values

## Actual Result

`POST /api/v1/runs` with a valid Bearer PAT returns `No active workspace could be resolved for this request.` This happens even after `/api/v1/me` confirms an active workspace, role, and `run:execute` scope for the same token.

## Expected Result

Bearer callers with valid workspace membership and `run:execute` should resolve active workspace context and create a Run, while still enforcing membership and scope checks.

## Evidence

- Bearer `/api/v1/me`: authenticated user `bunkai-staging-user@xenievzoau.resend.app`, workspace `545d5efe-a168-4f32-a4be-a148a2fc96db`, role `owner`, scopes `atc:read`, `atc:write`, `run:execute`.
- Bearer `POST /api/v1/runs`: fails with `No active workspace could be resolved for this request.`
- Cookie-session `POST /api/v1/runs`: creates Runs successfully with the same staging test fixtures.
- Bearer `POST /api/v1/runs/{id}/finish`: succeeds on existing Runs during BK-39 validation.

## Workaround

Manual QA can create the Run through cookie-session UI/API flow and then use Bearer to validate finish behavior on the existing Run. This is only a partial workaround and does not unblock AI/CI/PAT Run creation.
