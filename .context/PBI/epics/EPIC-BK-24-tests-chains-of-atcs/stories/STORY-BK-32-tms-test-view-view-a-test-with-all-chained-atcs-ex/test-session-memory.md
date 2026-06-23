# Test Session Memory — BK-32

## TMS Modality
jira-native (XRAY_* commented out, ATR via fallback comment)

## Environment
- WEB_URL: https://staging-upexbunkai.vercel.app/
- API_URL: https://staging-upexbunkai.vercel.app/api/v1
- API_TOKEN: EXPIRED mid-session (was bk_pat_Myc8o... for user 5441e8c1)
- Active workspace: a222895a-a22a-4193-9c7f-70c43e78bede

## Test Data

### Test with 4 ATCs (from BK-28)
- Test ID: 7b14c384-c4f9-403f-8cae-0b85a1cfcfe5
- Chain [A, D, B, C] (reordered in BK-28), version 2
- ATC-B edited in TC-3: now 2 steps + 2 assertions

### Test with 7 ATCs (perf)
- Test ID: 4099b919-4f73-488a-9373-796264b608cd
- Chain [A, B, C, D, E, F, G], version 1
- Perf: 293ms warm (target <500ms) ✓

### Cross-workspace Test
- Test ID: c79ca50b-6ad5-4ef1-b857-26801b098de6 (workspace baa9bff7)

## TC Results (before blocker)

| TC | Scenario | Result |
|---|---|---|
| TC-1 | Expanded view 4 ATCs | PASS |
| TC-2 | Positions match saved order | PASS |
| TC-3 | Live ATC content after edit | PASS |
| TC-4 | ATC with 0 assertions → clear state | PASS |
| TC-5 | Cross-workspace 404 (no leak) | PASS |
| TC-5b | Missing Test 404 | PASS |
| TC-6 | Read-only (POST/DELETE/PATCH → 405) | PASS |
| TC-7 | 7-ATC perf <500ms (293ms warm) | PASS |
| TC-8 | Long content readable | BLOCKED (token expired) |

## Stage State
- Session Start: completed
- Stage 1: completed (8 TC outlines, ATC-05 dropped)
- Stage 2: IN PROGRESS (8/9 TCs done, TC-8 blocked)
- Stage 3: pending

## Blocker
API_TOKEN expired mid-session. STAGING_USER_PASSWORD also invalid (401 Invalid credentials).
User needs to refresh .env credentials + restart agent session.
