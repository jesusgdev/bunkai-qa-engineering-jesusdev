# BK-39 Follow-Up Created

BK-39 remains `PASSED WITH FOLLOW-UP`.

Follow-up bug created and linked:

| Key | Summary | Impact |
|---|---|---|
| BK-182 | Bearer run creation cannot resolve active workspace | AI/CI/PAT callers cannot create Runs through `POST /api/v1/runs`; cookie-session creation works, and BK-39 finish endpoint works with Bearer on existing Runs. |

This does not block BK-39 because the finish-verdict endpoint, UI finish flow, DB state mutation, and terminal guards passed validation.
