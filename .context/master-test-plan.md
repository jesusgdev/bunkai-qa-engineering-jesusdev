# Master Test Plan - Bunkai TMS

> Last generated: 2026-06-09
> Strategy layer above: `.context/business/business-data-map.md`, `.context/business/business-feature-map.md`, `.context/business/business-api-map.md`
> Target app validated read-only at: `../upex-bunkai-tms`

```
+---------------------------------------------------------------------+
| Bunkai TMS                                                          |
| What to test in this system, and why it matters to the business.    |
+---------------------------------------------------------------------+
```

## Source Grounding

This plan is grounded in the current discovery maps and a read-only source validation of the target app. It intentionally does not duplicate flow diagrams, endpoint schemas, or detailed test cases.

| Source | How it shaped this plan |
|--------|--------------------------|
| `.context/business/business-data-map.md` | Core entities, flows, state machines, automatic processes, integrations, discovery gaps |
| `.context/business/business-feature-map.md` | Feature catalog, CRUD gaps, QA relevance priorities, planned-vs-implemented boundaries |
| `.context/business/business-api-map.md` | Auth/PAT/RLS model, API journeys, external failure points |
| `.context/PRD/*.md` | Product value, personas, core journeys, business language |
| `.context/SRS/*.md` | Architecture, functional rules, NFR risks, observability and CI gaps |
| `.context/infrastructure/*.md` | Runtime, deployment, environment, test/CI posture |
| `../upex-bunkai-tms` source validation | Confirmed Next.js/Supabase structure, 21 migrations, no GitHub Actions, Jira import worker, PAT/RLS, ATC RPCs |

## Executive Risk Map

Bunkai's highest risk is not ordinary CRUD. The product value depends on keeping tenant data isolated, importing Jira requirements correctly, and proving every ATC is anchored to the right acceptance criteria. The most fragile areas combine authorization, async processing, database side effects, one-time secrets, and transactional replacement logic. You should test the system as a chain: auth and workspace access feed the hierarchy, the hierarchy feeds stories and ACs, stories and ACs feed ATCs, and Jira import can poison that whole chain if it silently imports the wrong data.

| Priority | Flow | Why it matters | Depends on / Affects |
|----------|------|----------------|-----------------------|
| CRITICAL | Auth, principal resolution, and workspace/RLS boundary | A data leak or false access denial breaks every tenant-scoped flow | Supabase Auth, PAT middleware, workspace membership, all protected entities |
| CRITICAL | ATC create/update with AC anchoring | This is the product's traceability core; wrong provenance destroys coverage trust | Project/module/story/AC hierarchy, PAT/session auth, ATC RPCs, activity log |
| CRITICAL | Jira import to Story/AC materialization | Bad imports create stale or incorrect requirements, corrupting downstream QA work | Jira Cloud, Vercel `after()`, ImportJob, ADF parser, module mapping |
| CRITICAL | Workspace bootstrap and onboarding | If sign-in or first workspace creation fails, users cannot start using the product | Magic link, callback, workspace bootstrap RPC, owner membership |
| HIGH | Project/module tree create, move, and archive | Module hierarchy is the spine for stories, ACs, ATCs, and future test organization | Workspace/project roles, path rebuild logic, cascade archive RPCs |
| HIGH | Story and acceptance criteria authoring/readiness | Test planning only works when stories have active, ordered, testable ACs | Module state, Jira key rules, AC ordering, ready-to-test triggers |
| HIGH | PAT lifecycle for automation | Agents and CI need safe API access without bypassing tenant boundaries | Session auth, hashed token secrets, scopes, expiry/revoke, RLS parity |
| HIGH | Workspace invite lifecycle | Invite tokens control who joins a workspace and with what role | Admin/owner role, invite token secret, email match, expiry/revoke/rotate states |
| HIGH | Markdown/user-authored content sanitization | Stories, ACs, modules, and ATCs render user content; XSS would undermine trust | Markdown renderer, ATC sanitizers, form inputs, API validation |
| HIGH | Runtime and deployment confidence | No CI gate or APM means regressions and background failures can ship unnoticed | Vercel, Supabase migrations, local Playwright scripts, manual monitoring |

## What To Test First And Why

### Auth, Principal Resolution, And Workspace/RLS Boundary

**Why it matters:** Bunkai is workspace-scoped. If browser sessions, PAT callers, role checks, or RLS disagree, one user can see another team's work or a valid user can be locked out of their own project.

**What commonly breaks:** Mixed session and bearer credentials, non-member reads returning ambiguous empty states, viewer/member/admin role drift, active workspace cookie scope, and service-role operations that accidentally bypass the prior authorization check.

**Dependencies:** Supabase Auth, `lib/api/principal.ts`, PAT bearer middleware, workspace membership rows, RLS helper functions, protected App Router pages.

**What an experienced QA would check:**

- Verify each role can only perform the actions documented for viewer, member, admin, and owner.
- Verify non-member and cross-workspace reads/writes do not expose data through UI, API, PAT, or service-role-backed flows.
- Verify PAT callers obey the same workspace boundary as browser-session callers.
- Verify a request carrying both cookie and PAT credentials executes under the intended principal precedence.
- Verify active workspace switching changes the scope of subsequent project/module/story reads.

### ATC Create/Update With AC Anchoring

**Why it matters:** ATCs are valuable only when they prove coverage against acceptance criteria. A test case linked to no AC, the wrong AC, or a different story is false confidence.

**What commonly breaks:** No-AC creation, cross-story AC IDs, cross-project module IDs, stale update overwrites, partial child replacement, missing version bump, missing activity event, and session/PAT authorization mismatch.

**Dependencies:** Story and AC data quality, `POST /api/v1/atcs`, `PATCH /api/v1/atcs/[id]`, `atc:write` capability, `0021_atc_create_update.sql`, optimistic locking.

**What an experienced QA would check:**

- Verify create/update rejects no AC, wrong-story AC, and cross-project module/story combinations.
- Verify PATCH full replacement removes omitted steps/assertions/links atomically and does not leave orphaned children.
- Verify `X-If-Match` protects against concurrent stale edits.
- Verify version increments and activity events are created only after successful transactions.
- Verify session and PAT flows have the same business outcome except for explicit scope restrictions.

### Jira Import To Story/AC Materialization

**Why it matters:** Jira import is the bridge from the team's backlog into Bunkai. If it silently skips, duplicates, or mis-parses requirements, all later shift-left and test documentation work starts from bad inputs.

**What commonly breaks:** One-active-job enforcement, invalid JQL, Jira auth failure, rate limits, malformed ADF, duplicate AC normalization, component-to-module mapping, Inbox fallback, partial failure accounting, stuck job states.

**Dependencies:** Jira Cloud, import API routes, Vercel `after()` worker, ImportJob state, ADF-to-Markdown conversion, AC extraction, module mapping.

**What an experienced QA would check:**

- Verify a valid import moves from queued to running to completed with trustworthy counts.
- Verify a duplicate import request is blocked while another job is active for the same project.
- Verify unknown Jira components fall into Inbox only when that fallback is intentional and visible.
- Verify failed Jira auth, malformed payloads, and parser errors become failed jobs with actionable reasons.
- Verify rerunning the same import does not duplicate stories or ACs.

### Workspace Bootstrap And Onboarding

**Why it matters:** This is the first value moment. If magic-link auth or workspace creation fails, no user can reach project authoring or invite teammates.

**What commonly breaks:** Email delivery assumptions, expired/invalid login links, callback/session persistence, duplicate workspace slug, invalid slug formatting, owner membership not created atomically, onboarding redirect loops.

**Dependencies:** Supabase Auth, configured SMTP/Resend path, login UI, auth callback, `bunkai_bootstrap_workspace()`, workspace APIs.

**What an experienced QA would check:**

- Verify login request, email callback, session creation, and protected-route access as one complete path.
- Verify invalid or expired magic links produce recoverable errors.
- Verify workspace slug validation covers spaces, uppercase, reserved-looking names, and duplicates.
- Verify first workspace creation creates owner membership atomically.
- Verify a user with no workspace lands in onboarding and a user with workspace lands in projects.

### Project/Module Tree Create, Move, And Archive

**Why it matters:** The module tree is the organizing spine for stories, ACs, ATCs, and planned test repositories. Tree corruption makes coverage navigation unreliable.

**What commonly breaks:** Path rebuild after rename/move, cycle detection, max depth 6 enforcement, cross-project parent rejection, soft-delete cascade, archived descendants still visible in active views.

**Dependencies:** Project membership, module path logic, `0014_module_soft_delete.sql`, `0015_module_move.sql`, project explorer UI.

**What an experienced QA would check:**

- Verify module creation at root and nested levels up to the allowed limit.
- Verify moving a subtree rebuilds descendant paths without losing stories or ACs.
- Verify cycles, cross-project parents, and depth overflow are rejected before any partial mutation.
- Verify module archive cascades to descendant modules, stories, ACs, and ATCs.
- Verify archived data is hidden from active work surfaces but not hard-deleted unexpectedly.

### Story And Acceptance Criteria Authoring/Readiness

**Why it matters:** Shift-left testing depends on stories being testable. A ready story with no active ACs is a process failure that will flow into bad ATPs, ATRs, and automation plans.

**What commonly breaks:** Optional Jira key uniqueness/immutability, AC ordering conflicts, active-only position rebalance, archiving the last active AC, ready-to-test state drift, Markdown rendering.

**Dependencies:** Module state, user story routes, AC routes, `0017_acceptance_criteria_ordering.sql`, `0018_ready_to_test_gate_fn.sql`, story/AC UI.

**What an experienced QA would check:**

- Verify manual stories can exist without Jira key while imported Jira keys remain unique and immutable.
- Verify AC create/edit/reorder/archive preserves active-only order.
- Verify archiving the last active AC downgrades a ready story to draft.
- Verify concurrent reorder/archive actions do not create duplicate positions.
- Verify Markdown content is rendered safely and consistently in story and AC views.

### PAT Lifecycle For Automation

**Why it matters:** PATs are how agents, CLI tools, and future CI flows access Bunkai without browser sessions. A PAT bug is both an automation blocker and a security risk.

**What commonly breaks:** Raw token recoverability, prefix/hash lookup, expired/revoked token acceptance, insufficient scope acceptance, PAT mint/revoke exceptions, `last_used_at` audit update, workspace RLS parity.

**Dependencies:** Session auth for PAT creation, `AccessToken`, `AccessTokenSecret`, bearer middleware, scopes such as `atc:read` and `atc:write`.

**What an experienced QA would check:**

- Verify raw PAT is shown once and cannot be recovered later.
- Verify revoked, expired, malformed, unknown, and insufficient-scope PATs fail before the business mutation.
- Verify `atc:read` cannot write and `atc:write` can only write inside allowed workspace scope.
- Verify headless signin/signup PAT behavior is intentionally different from normal PAT management.
- Verify audit side effects do not mask authentication failures.

### Workspace Invite Lifecycle

**Why it matters:** Invites decide who gains access to a workspace and with what power. Token replay or wrong-email acceptance can expose a team's test repository.

**What commonly breaks:** Raw invite URL handling, wrong account acceptance, expired/revoked/accepted replay, token rotation, role escalation, unclear email delivery expectation.

**Dependencies:** Admin/owner authorization, invite token secret split, invite accept route, member upsert, members UI.

**What an experienced QA would check:**

- Verify only admin/owner can create, rotate, or revoke invites.
- Verify wrong-email acceptance is rejected even with a valid token.
- Verify expired, revoked, accepted, and rotated-old tokens cannot be replayed.
- Verify role assignment is bounded to valid workspace roles.
- Verify the UI makes the current token-copy/email-delivery behavior clear.

### Markdown/User-Authored Content Sanitization

**Why it matters:** Bunkai stores and renders user-authored requirement and test content. Unsafe rendering can turn QA artifacts into an attack vector.

**What commonly breaks:** Script tags, unsafe links, malformed Markdown, large content blocks, tables/code fences, tags and ATC step/assertion content passing through different sanitizers.

**Dependencies:** Module descriptions, story body, AC content, ATC title/tags/steps/assertions, Markdown sanitizers, UI renderers.

**What an experienced QA would check:**

- Verify script-like content is stored safely and rendered inert.
- Verify links, images, tables, code blocks, long strings, and malformed Markdown do not break UI layout.
- Verify API and UI sanitization produce consistent results for the same content.
- Verify ATC tags and structured editor fields cannot inject executable content.

## State Machines That Matter

| State machine | Why transitions matter | Highest-risk transitions | Terminal / forbidden states | Detection today |
|---------------|------------------------|--------------------------|------------------------------|-----------------|
| Workspace Invite | Controls access to tenant data | pending -> accepted, pending -> revoked, pending -> expired, rotate while pending | accepted/revoked/expired are terminal; old rotated token must be forbidden | API/UI state, no verified email delivery path |
| Import Job | Determines whether Jira data becomes trusted Bunkai data | queued -> running -> completed/failed | One active queued/running job per project; no stuck running jobs | Poll endpoint and persisted counts/errors |
| User Story Readiness | Prevents QA-ready stories without active ACs | draft -> ready_to_test, ready_to_test -> draft after last AC archive | ready_to_test with zero active ACs must be forbidden | DB trigger/function side effect; UI must refresh state |
| Module Archive | Destructive cascade across the knowledge tree | active -> archived | Active descendants under archived parent must be forbidden | Active views and DB archived flags |
| ATC Version | Prevents lost test edits | version N -> N+1 after successful PATCH | Stale `X-If-Match` update must be rejected | API response/version and activity log |
| PAT | Controls automation access | active -> revoked, active -> expired | Revoked/expired token must never authenticate | API auth responses; `last_used_at` best-effort update |
| ATC Execution Status | Schema supports run-like states | unrun -> running/pass/fail/blocked/skipped | Route not verified; do not assume runner behavior | Discovery gap until runner/update endpoint exists |
| Idempotency Key | Prevents duplicate POST effects | pending -> succeeded/failed | Same key with different payload should not replay | Infrastructure exists; active route usage unverified |

## Silent Killers - Automated Processes

These deserve explicit QA strategy because they can fail while the UI still looks healthy.

| Process | What it does | What breaks if it misses, repeats, or runs out of order | Detection today | Recommended QA strategy |
|---------|--------------|-----------------------------------------------|-----------------|-------------------------|
| Jira import worker via Vercel `after()` | Processes queued import after request returns | Successful enqueue with no imported stories/ACs, stale status, missing errors | ImportJob status/counts/errors | Synthetic import probe with status polling and data assertions |
| ADF-to-Markdown and AC extraction | Converts Jira issue body into Bunkai requirement content | Missing ACs, duplicated ACs, changed meaning, broken Markdown | Import counts and resulting Story/AC rows | Golden Jira fixtures covering malformed/complex ADF and duplicate AC text |
| Inbox fallback for unknown components | Places unmapped Jira issues in a default module | Import appears successful while project structure drifts | Imported module assignment | Verify fallback is visible, countable, and accepted by business owner |
| Module descendant path rebuild | Recomputes descendant paths after move/rename | Navigation points to stale or duplicate paths | Module tree UI/API | Multi-level subtree move checks with descendant path assertions |
| Module archive cascade | Archives descendants, stories, ACs, and ATCs | Active orphan descendants or accidental hard delete | Active views and archived flags | Cascade audit after delete with active and archived queries |
| AC position rebalance | Maintains active-only order after create/move/archive | Duplicate positions, missing positions, wrong story readiness | AC panel/API | Concurrent reorder/archive scenario plus active-only ordering assertion |
| Ready-to-test downgrade | Downgrades ready story when last active AC is archived | Story remains ready without testable criteria | Story status field/UI | Last-AC archive probe and status refresh assertion |
| ATC child replacement RPC | Replaces steps/assertions/links transactionally | Lost steps, duplicate children, wrong links after partial failure | ATC response and DB rows | Update with changed child set and verify exact replacement |
| ATC activity events | Records create/update audit-light trail | No traceability for who changed test content | ActivityLog rows; no UI verified | Assert audit row for successful creates/updates, not for failed writes |
| PAT `last_used_at` update | Tracks token use after successful auth | Security/audit signal silently stale | Fire-and-forget behavior | Do not block auth on audit; verify value updates eventually when available |
| Magic-link audit write | Records magic-link issuance/replay context | Login audit assumptions are false | Best-effort/background signal | Treat as observability check, not login success oracle |
| Manual migration application | Applies schema changes outside CI | Staging/prod schema drift, missing RLS/RPC changes | No CI migration gate found | Pre-release migration checksum/schema audit |

## External Integrations - Failure Points

| Integration | Business flows affected | Critical failure points | Acceptable degradation | Known quirks / QA notes |
|-------------|-------------------------|-------------------------|------------------------|-------------------------|
| Supabase Auth | Login, onboarding, session-backed APIs | Magic-link delivery, callback exchange, session lookup, auth rate limits | Clear login error and retry path; no partial workspace mutation | Supabase default limits/config are external to repo |
| Supabase Postgres/RLS | Every protected flow | RLS hidden rows, write denials, service-role bypass, RPC failures | Consistent error envelope or empty scoped result; never cross-tenant fallback | SECURITY DEFINER RPCs require route-level negative tests |
| Resend / Supabase SMTP | Magic-link login | Email not delivered or delayed | User can request another link; UI does not imply login is complete | Direct Resend app code not verified; delivery likely external config |
| Jira Cloud | Jira import, Story/AC quality | Auth failure, invalid JQL, rate limits, malformed ADF, skipped issues | ImportJob fails with actionable reason; partial failures are counted | Async worker means enqueue success is not import success |
| Vercel | All routes, Jira import worker | Cold starts, route timeout, `after()` worker stall, env drift | Health/API error visible; import polling exposes stuck/failed state | No `vercel.json` or GitHub Actions found; dashboard config is external |
| OpenAPI / Scalar | API tests, agent integration | Stale docs, missing route annotations, tag registry drift | App still works; automation should validate against generated spec/source | Use `bun run api:sync` and OpenAPI diff outside this plan |
| Monaco Editor | ATC editing UI | Editor load failure, large content input, browser compatibility | Existing ATC data remains intact; save fails visibly | Treat editor as UI risk, not data source of truth |

## Dependency Cascade Between Flows

```
Auth bootstrap
  -> principal resolution
  -> workspace membership / RLS
  -> project and module visibility
  -> story and AC authoring
  -> ready-to-test signal
  -> ATC provenance validation
  -> ATC version, children, activity log
```

```
Jira Cloud
  -> ImportJob via Vercel after()
  -> ADF to Markdown conversion
  -> module mapping / Inbox fallback
  -> Story and AC materialization
  -> ATC anchoring quality
  -> downstream shift-left and automation confidence
```

```
Workspace owner/admin
  -> invite creation / rotation / revoke
  -> matching-email acceptance
  -> active WorkspaceMember
  -> role-based project/module/story/ATC permissions
```

Testing one node in isolation hides the real risk. For example, an ATC can be syntactically valid and still be business-invalid if the imported AC came from the wrong Jira issue, the module fallback was wrong, or the PAT caller bypassed the intended workspace boundary.

## Edge Cases Developers Commonly Forget

| Theme | Bunkai-specific edge case |
|-------|---------------------------|
| Permission boundaries | Viewer can access UI but must not mutate through API; member must not invite; non-member must not infer workspace data |
| Mixed credentials | Request includes both session cookie and PAT; principal precedence must be explicit |
| Cross-tenant IDs | Valid UUID from another workspace/project/story must be rejected or hidden consistently |
| One-time secrets | PAT and invite raw secrets must not be recoverable after creation or rotation |
| Wrong-user invite | Authenticated user with different email attempts to accept a valid invite token |
| Token replay | Expired, revoked, accepted, or rotated invite/PAT is reused |
| Tree constraints | Moving a module creates a cycle, exceeds depth only because of descendants, or targets another project |
| Destructive cascades | Module archive misses nested story/AC/ATC rows or hard-deletes content unexpectedly |
| AC concurrency | One user reorders while another archives or reorders the same AC set |
| Readiness drift | Last active AC is archived but story remains `ready_to_test` |
| ATC provenance | AC belongs to another story but has a valid ID and similar title |
| ATC replacement | PATCH omits a step/assertion and should remove it rather than silently preserve stale children |
| Optimistic locking | Two editors save the same ATC; stale update must fail without data loss |
| Jira duplicates | Same Jira issue imported twice; AC title normalization differs by punctuation/case/Markdown |
| Jira partial failures | One malformed issue fails but entire job is incorrectly marked completed or failed without counts |
| Inbox fallback | Unknown component makes import look successful while organizing content in the wrong module |
| Markdown security | Script tags, unsafe links, long content, tables, and code fences in stories/ACs/ATCs |
| Planned UI affordances | OAuth buttons and New Test control are visible/disabled; tests must not assume implementation |
| Observability | ActivityLog or `last_used_at` silently fails and creates false audit confidence |
| Environment drift | Local target checkout is `staging` while project config still records target branch as `main` |

## Pre-Release Checklist

1. Verify browser session and PAT callers cannot read or mutate data outside their workspace under any role.
2. Verify workspace bootstrap creates the workspace and owner membership atomically after successful login.
3. Verify ATC create/update rejects missing ACs, wrong-story ACs, cross-project IDs, and stale `X-If-Match` versions.
4. Verify ATC update fully replaces steps/assertions/links and records version/activity only on successful transaction.
5. Verify Jira import completes with accurate counts, handles duplicate imports, and exposes failed auth/parser/JQL states.
6. Verify module move rejects cycles, cross-project parents, and max-depth overflow before any partial path mutation.
7. Verify module archive cascades to descendant modules, stories, ACs, and ATCs without hard deletion.
8. Verify story cannot remain `ready_to_test` when it has zero active ACs.
9. Verify AC ordering remains unique and gapless after reorder/archive, including concurrent changes.
10. Verify PAT creation shows raw secret once and revoked/expired/insufficient-scope tokens fail before mutation.
11. Verify invite acceptance rejects wrong-email, expired, revoked, accepted, and rotated-old tokens.
12. Verify Markdown/user content renders safely across module, story, AC, and ATC surfaces.
13. Verify import worker and DB side effects are observable through status, counts, logs, or direct read-only validation.
14. Verify staging schema matches the expected migration set before release.
15. Verify no release depends on planned-only OAuth, Test Repository, or Test Chains behavior unless those stories have been implemented.

## Medium / Lower Priority Areas

These still matter, but they should not displace the CRITICAL/HIGH chain above during early regression planning.

- OpenAPI/Scalar docs availability and tag completeness.
- Design token and `/qa` informational pages.
- Monaco editor browser compatibility beyond ATC save integrity.
- Feature flag and user view state behavior until app consumers are verified.
- OAuth UI messaging while providers remain disabled.
- Planned Test Repository and Test Chains until implementation begins.

## What Is NOT In This Plan

- Flow-level diagrams and full transition tables -> `.context/business/business-data-map.md`
- Feature catalog, CRUD matrix, feature flags -> `.context/business/business-feature-map.md`
- API endpoint inventory and schemas -> `bun run api:sync` plus `.context/business/business-api-map.md`
- Detailed test case definitions and traceability -> TMS via `/test-documentation`
- Sprint-specific execution order -> `/sprint-testing` artifacts under `.context/PBI/`
- KATA implementation plans and automated test code -> `/test-automation`
- Release GO/NO-GO execution report -> `/regression-testing`

## Discovery Gaps

The following items could not be fully verified from source/context and require human confirmation or a focused follow-up:

- [ ] `.context/project-config.md` still records the target branch as `main`, but the local target checkout validated for this plan is on `staging`.
- [ ] `.context/project-config.md` still says the schema has 8 migration files; target source currently has 21 migrations through `0021_atc_create_update.sql`.
- [ ] Direct ATC delete/archive endpoint was not found, although ATC `archived_at` and cascade archive exist.
- [ ] Workspace delete and owner-transfer behavior were not found.
- [ ] Member removal/suspension endpoint was not found.
- [ ] Invite email delivery was not verified; API returns token/URL behavior, but actual send path is not proven.
- [ ] Idempotency table/library exists, but active route adoption was not verified.
- [ ] Feature flag and user view state tables exist, but app consumers were not verified.
- [ ] Magic-link audit table usage and replay semantics were not fully verified.
- [ ] ActivityLog coverage beyond ATC create/update was not verified.
- [ ] ATC execution status transitions exist in schema, but no runner/update endpoint was verified.
- [ ] OpenAPI completeness should be checked against all route handlers with the target repo's OpenAPI tooling.
- [ ] No GitHub Actions or CI regression gate was found; release confidence depends on local/manual verification unless CI is added.
- [ ] No APM/Sentry/production observability stack was verified.
- [ ] Backup/restore and migration promotion strategy for Supabase staging/production was not verified.
- [ ] OAuth, Test Repository, and Test Chains are planned or disabled, not implemented production flows.
