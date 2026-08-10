# BK-40 — API Verification (staging)

> Pre-flight API check done 2026-08-10. Env: staging (`https://staging-upexbunkai.vercel.app`).
> Project `d75e73ac-b42a-487e-99e8-ac55859fc392` (BK-34 QA Seed) · Workspace `545d5efe-a168-4f32-a4be-a148a2fc96db` · User `5441e8c1-3315-4f5e-b678-735f02841488`.

## Auth

- `POST /api/v1/auth/signin` → `{user, session, pat, warning}`.
- `session.access_token` (JWT ES256) is **rejected** by `/api/v1/me` as Bearer.
- Only **`pat.token`** authenticates (scopes `atc:read`, `atc:write`, `run:execute`).
- Server warning: "Store the PAT token now — it cannot be retrieved later." PAT kept at `/tmp/bk40_pat.txt`.

## Verified ATP (API layer)

| ATP | Scenario | Result |
|-----|----------|--------|
| P1 / C1-C2 | File run-linked defect from a **failed** run step | ✅ 201, context derived server-side (`run_id`, `atc_id`, `module_id` filled in) |
| P2 / C5 | Save valid standalone defect | ✅ 201, `status: open`, evidence stored |
| P3 / C5 | Defect visible in defects list | ✅ `GET /projects/{id}/bugs` returns 6 items |
| C6 | Heatmap reflects defects | ✅ `GET /projects/{id}/bugs/heatmap`: modules `low`/`elevated`, trend `rising` |
| N1 | Title <5 or >200 | ✅ 422 `validation_failed`, "Title must be between 5 and 200 characters" |
| N2 | Severity not P1–P4 | ✅ 422 `invalid_value` (allowed P1/P2/P3/P4) |
| N3 | Module not in project | ✅ 422 |
| N4 | Evidence >10 (or bad URI) | ✅ 422 `maxItems`/uri checks |
| B1 | Exactly 10 evidence links | ✅ 201, all 10 stored |
| Never 1 | Bug stays open (no auto-close) | ✅ all seeds remain `open` |
| Never 2 | Context cannot be reassigned client-side | ✅ run-linked POST with client `module_id`/`project_id` overrides **ignored** — context always derived from `run_step_id` |
| Never 3 | Run-linked only from failed step | ✅ step `skipped`/`pending` → 422 reason `run_step_not_failed` |

## Other endpoint notes

- `GET /api/v1/bugs` requires `project_id` query (else 422).
- `GET /api/v1/projects/{id}/runs/report` lists runs; `GET /api/v1/runs/{id}` returns steps+ATCs.
- Marking a step requires run `running` (409 if closed) via `POST /runs/{id}/steps/{stepId}/mark`.
- Seed runs only had `skipped`/`pending` steps — marked step `30fd6410` of run `866e6f5c` `failed` to exercise the run-linked path.

## Seed data left in staging (no DELETE endpoint in spec)

`c577dd24`, `c4c412c4`, `6b49f048` (standalone P2), `ed0e619d`, `fae5bf5d` (run-linked P2), `195b5834` (boundary P4).