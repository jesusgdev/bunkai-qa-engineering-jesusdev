# Test Session Memory — BK-28

## TMS Modality

jira-native (XRAY_* commented out, ATR via fallback comment)

## Environment

- WEB_URL: https://staging-upexbunkai.vercel.app/
- API_URL: https://staging-upexbunkai.vercel.app/api/v1
- API_TOKEN: loaded from .env (user 5441e8c1, owner role)
- Active workspace: a222895a-a22a-4193-9c7f-70c43e78bede

## Test Data

### Test with 4 ATCs (primary)
- Test ID: 7b14c384-c4f9-403f-8cae-0b85a1cfcfe5
- Title: BK-28 Reorder Seed Test 20260622
- Version: 1
- Chain [A, B, C, D]:
  - pos=1 step_id=2203e0bd-0326-4b24-a791-fd29b07d0a6e atc_id=8d5025ba (ATC-A)
  - pos=2 step_id=4b590d93-5469-47a0-9b0a-41af943c9c56 atc_id=613e6ba3 (ATC-B)
  - pos=3 step_id=92f763b4-de5f-4de2-83f0-e425331b1cd3 atc_id=5906ed43 (ATC-C)
  - pos=4 step_id=28e30490-257b-4af0-aca6-008d5724d137 atc_id=df210c22 (ATC-D)

### Test with 1 ATC (for TC-4)
- Test ID: 09d28d3c-ad29-45d9-a014-dbb7ba6ccbb2
- Step ID: cada0b93-080d-47d8-8239-1c833148020a
- Version: 11

## API Contract

- Endpoint: PATCH /api/v1/tests/{id}/reorder
- Body: {"step_ids": ["uuid1", "uuid2", ...]}
- Header: X-If-Match: <version> (lenient — absent skips check)
- Auth: Bearer atc:write
- Errors: 422 chain_mismatch (missing/extra), 422 chain_invalid (empty/duplicate), 409 conflict (version mismatch), 401 (no auth), 403 (viewer role)

## Stage State

- Session Start: completed
- Stage 1: pending
- Stage 2: pending
- Stage 3: pending
