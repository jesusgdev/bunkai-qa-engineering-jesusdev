# Business API Map — Bunkai TMS

> Last verified against OpenAPI/source on 2026-06-09.
> Target repo: `../upex-bunkai-tms`
> OpenAPI source: `../upex-bunkai-tms/public/openapi.json`, `../upex-bunkai-tms/app/api/v1/**/route.openapi.ts`, `../upex-bunkai-tms/scripts/openapi-gen.ts`

## Executive Summary

Bunkai's API lets the business operate a test management workflow through two caller types: browser users with Supabase session cookies and automation/agent callers with PAT bearer tokens. Both paths resolve into the same workspace-scoped principal model so Postgres RLS remains the core data boundary.

The highest-value API journeys are authentication/bootstrap, workspace and invite management, PAT lifecycle, project hierarchy management, Jira import, and ATC authoring. These journeys are more important for QA than a raw endpoint catalog because they describe where business value, authorization, side effects, and failure modes concentrate.

This document is intentionally narrative. Exact endpoint schemas belong to OpenAPI and generated API types; entity rules belong to `business-data-map.md`; CRUD and UI coverage belong to `business-feature-map.md`.

## Permission & Auth Model

| Tier | Who It Applies To | How To Acquire | Where Enforced |
|------|-------------------|----------------|----------------|
| Public | Health checks, OpenAPI docs, magic-link request, headless signup/signin | No auth required | `lib/api/handler.ts`, route-level auth config |
| Browser session | Human users in the web app | Supabase Auth magic link/session cookie | `middleware.ts`, `lib/api/principal.ts`, `lib/supabase/server.ts` |
| Bearer PAT | CLI, automation, AI agents | `bk_pat_<prefix>.<secret>` returned on token creation/headless auth | `lib/api/middleware/bearer.ts`, `lib/api/pat.ts` |
| Capability-gated PAT | API callers needing scoped actions | PAT with scopes such as `atc:read`, `atc:write`, `run:execute`, `workspace:admin` | `lib/api/principal.ts`, ATC routes |
| Workspace/RLS | Any authenticated caller | Membership in workspace | Supabase RLS policies + user-scoped Supabase client |
| Service-role exception | Controlled server operations | Server-only env secret | ATC RPC/import/invite internals after prior authorization |

### Browser Session Flow

```
User
  -> /login email form
  -> POST /api/v1/auth/magic-link
  -> Supabase Auth sends email
  -> /auth/callback exchanges code
  -> session cookie
  -> protected UI/API request
  -> RLS-scoped Supabase client
```

### PAT Flow

```
User / headless client
  -> create PAT or signin/signup endpoint
  -> raw bk_pat_<prefix>.<secret> returned once
  -> Authorization: Bearer bk_pat_<prefix>.<secret>
  -> prefix lookup
  -> hash compare in AccessTokenSecret
  -> expiry/revoke/scope checks
  -> user-scoped JWT for RLS parity
  -> handler
```

### Auth Nuances For QA

| Nuance | Why It Matters | Evidence |
|--------|----------------|----------|
| PAT is resolved before session | A request with both credentials may use PAT permissions | `lib/api/principal.ts` |
| PAT callers are mapped back to user identity | Cookie and PAT paths should obey same workspace RLS | `lib/api/principal.ts` |
| Raw secrets are one-time | Test setup must capture PAT/invite tokens immediately | `0011_split_token_secrets.sql` |
| PAT cannot normally mint/revoke PAT, but headless auth can mint on signin/signup | This exception must be explicit in ACs | `app/api/v1/auth/signin/route.ts`, `app/api/v1/auth/signup/route.ts` |
| Service-role is used after app-level authorization in some flows | RLS bypass points need specific negative tests | ATC RPC/import/invite routes |

## Critical Business Journeys

### Journey 1 — Auth Bootstrap

**Purpose:** let a human or headless client enter Bunkai and receive usable credentials.

```
Client
  -> Auth route
  -> Supabase Auth / credential validation
  -> session cookie or PAT
  -> principal available to protected routes
```

1. Browser user requests magic link through `POST /api/v1/auth/magic-link`.
2. Supabase handles email delivery and callback exchange.
3. Headless clients can use signup/signin endpoints to receive a PAT.
4. Future calls resolve to either cookie session or PAT principal.

| Endpoints Involved | Entities Touched | Feature IDs |
|--------------------|------------------|-------------|
| `POST /api/v1/auth/magic-link`, `POST /api/v1/auth/signup`, `POST /api/v1/auth/signin` | MagicLinkToken, AccessToken, AccessTokenSecret, WorkspaceMember indirectly | FEAT-AUTH-001, FEAT-AUTH-003, FEAT-AUTH-004 |

### Journey 2 — Workspace And Invite Lifecycle

**Purpose:** create tenant boundaries and bring the right teammates into them.

```
Admin/Owner
  -> Workspace routes
  -> Invite routes
  -> InviteSecret token handling
  -> Invitee accepts with matching email
  -> active WorkspaceMember
```

1. User creates/list workspaces and selects active workspace.
2. Admin/owner creates an invite with role and email.
3. Raw invite token is returned once; token can be rotated or revoked.
4. Invitee signs in, accepts token, and must match invite email.
5. Membership becomes active and RLS grants workspace access.

| Endpoints Involved | Entities Touched | Feature IDs |
|--------------------|------------------|-------------|
| `GET/POST /api/v1/workspaces`, `GET/PATCH /api/v1/workspaces/[id]`, invite routes, `POST /api/v1/invites/accept` | Workspace, WorkspaceMember, WorkspaceInvite, WorkspaceInviteSecret | FEAT-WS-001, FEAT-WS-002, FEAT-TEAM-001..004 |

### Journey 3 — PAT Lifecycle For Automation

**Purpose:** let CI, CLI, and AI agents safely access test assets.

```
Session user
  -> POST /api/v1/tokens
  -> raw PAT returned once
  -> automation sends bearer token
  -> PAT middleware validates prefix/hash/scope
  -> protected API action
```

1. Session user lists or creates PATs.
2. PAT secret hash is stored separately; raw PAT is unrecoverable.
3. Automation uses bearer token for protected requests.
4. Revoked/expired/insufficient-scope tokens fail before business action.

| Endpoints Involved | Entities Touched | Feature IDs |
|--------------------|------------------|-------------|
| `GET/POST /api/v1/tokens`, `DELETE /api/v1/tokens/[id]` | AccessToken, AccessTokenSecret | FEAT-AUTH-004 |

### Journey 4 — Project Hierarchy Management

**Purpose:** maintain the workspace -> project -> module -> story -> AC structure that shift-left depends on.

```
Member+
  -> create project
  -> create/move/archive module
  -> create story
  -> add/reorder/archive ACs
  -> ready_to_test gate evaluated
```

1. Project groups a product or app under one workspace.
2. Module tree organizes areas and feature hierarchy.
3. Stories and ACs hold requirement content.
4. AC ordering and ready-to-test gate define whether a story is testable.

| Endpoints Involved | Entities Touched | Feature IDs |
|--------------------|------------------|-------------|
| `POST /api/v1/workspaces/[id]/projects`, module routes, story routes, AC routes | Project, Module, UserStory, AcceptanceCriterion | FEAT-PROJ-001, FEAT-MOD-001..004, FEAT-US-001..003, FEAT-AC-001..003 |

### Journey 5 — Jira Import

**Purpose:** materialize external backlog stories and ACs into Bunkai.

```
QA Lead
  -> POST /api/v1/imports
  -> ImportJob queued
  -> Vercel after() worker
  -> Jira REST
  -> ADF->Markdown + AC extraction
  -> upsert stories/ACs
  -> GET /api/v1/imports/{id}
```

1. User submits import settings/JQL for a project.
2. System enforces one active job per project.
3. Worker fetches Jira, converts ADF to Markdown, extracts ACs.
4. Unknown components fall into Inbox.
5. Poll endpoint reports progress, counts, failure reason, or completion.

| Endpoints Involved | Entities Touched | Feature IDs |
|--------------------|------------------|-------------|
| `POST /api/v1/imports`, `GET /api/v1/imports/[id]` | ImportJob, Module, UserStory, AcceptanceCriterion | FEAT-JIRA-001, FEAT-JIRA-002, FEAT-JIRA-003 |

### Journey 6 — ATC Authoring

**Purpose:** create or update test cases anchored to acceptance criteria.

```
QA Engineer / PAT caller
  -> POST/PATCH ATC route
  -> withApiHandler + principal
  -> atc:write capability
  -> BK-18 RPC validates provenance
  -> steps/assertions/links replaced transactionally
  -> version bump + activity log
```

1. Caller submits ATC metadata, steps, assertions, tags, and AC IDs.
2. API validates auth, scopes, payload shape, module/story/AC provenance.
3. RPC creates or updates ATC, children, and anchor links transactionally.
4. Updates can reject stale `X-If-Match` versions.
5. Activity log captures create/update events.

| Endpoints Involved | Entities Touched | Feature IDs |
|--------------------|------------------|-------------|
| `POST /api/v1/atcs`, `PATCH /api/v1/atcs/[id]` | ATC, ATCStep, ATCAssertion, ATC-AcceptanceCriterion, ActivityLog | FEAT-ATC-001..004 |

## Architecture Behind The API

```
Browser / CLI / Agent
  -> Next.js App Router route handlers
  -> withApiHandler
       -> request id
       -> structured logging
       -> error envelope
       -> identity resolution
       -> optional capability checks
  -> Supabase user client (RLS)
  -> controlled admin client / SECURITY DEFINER RPCs where needed
  -> Supabase Postgres / Auth
  -> Jira / Vercel / OpenAPI integrations
```

| Component | Role | Persistence / Integrations Touched | Why It Matters For QA |
|-----------|------|------------------------------------|-----------------------|
| `app/api/v1/**/route.ts` | Business API handlers | Supabase, Jira, PAT, invites, ATCs | Entry points for API test journeys |
| `lib/api/handler.ts` | Shared API wrapper | Request IDs, logging, error mapping | Normalizes success/error expectations |
| `lib/api/principal.ts` | Cookie/PAT identity resolver | Supabase user JWT, PAT scopes | Critical for RLS parity and auth testing |
| `lib/api/middleware/bearer.ts` | PAT validator | AccessToken/AccessTokenSecret | Security-critical bearer logic |
| Supabase RLS | Workspace data boundary | All core tables | Determines 403 vs hidden data behavior |
| SECURITY DEFINER RPCs | Atomic business writes | Workspace bootstrap, ATC create/update | RLS bypass must be authorized first |
| `lib/jira/import-runner.ts` | Async import worker | Jira, ImportJob, stories, ACs | External failure and data fidelity risk |
| OpenAPI generator | API contract documentation | `public/openapi.json` | Source for technical sync and tests |

## External Integrations

| Service | Trigger | Direction | Failure Mode (User-Visible) | Journeys Affected |
|---------|---------|-----------|-----------------------------|-------------------|
| Supabase Auth | Magic-link/signin/session lookup | Outbound | Login failure, 401, missing session | Auth bootstrap, workspace access |
| Supabase Postgres/RLS | Protected handlers | Outbound | 403/404/write failure, hidden rows | All protected journeys |
| Resend / Supabase SMTP | Magic-link delivery | Indirect outbound | User never receives email | Auth bootstrap |
| Jira Cloud | `POST /api/v1/imports` worker | Outbound async | Import job failed, skipped issues, stale requirements | Jira import |
| Vercel | Route runtime + `after()` | Hosting/background | Route unavailable or import worker stalls | All journeys, Jira import |
| Scalar/OpenAPI | `/api/docs`, `/api/openapi` | Docs surface | Docs stale/unavailable | API test planning |

## Cross-References

| Context Need | Source |
|--------------|--------|
| Business entities, state machines, validation rules | `.context/business/business-data-map.md` |
| Feature IDs, CRUD matrix, UI surface, planned work | `.context/business/business-feature-map.md` |
| Exact endpoint specs | `../upex-bunkai-tms/public/openapi.json` |
| Per-route OpenAPI annotations | `../upex-bunkai-tms/app/api/v1/**/route.openapi.ts` |
| OpenAPI generation/diff scripts | `../upex-bunkai-tms/scripts/openapi-gen.ts`, `scripts/openapi-diff.ts` |
| Type sync for automation | `bun run api:sync` in this QA repo or target repo, depending active configuration |

## Discovery Gaps

The following items could not be verified from source and require human confirmation:

- [ ] Existing context was stale against current API: old docs mentioned mainly health/auth/tokens, while code now includes workspaces, invites, imports, modules, stories, ACs, and ATCs.
- [ ] Env naming mismatch risk: code/context references legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` in some docs, while target `.env.example` lists `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY`.
- [ ] OpenAPI tag registry completeness should be checked against all `route.openapi.ts` files.
- [ ] Invite email delivery is not verified; API returns token but does not prove email is sent.
- [ ] Service-role/admin-client usage needs route-by-route negative tests to prove prior authorization is sufficient.
- [ ] Direct ATC read/delete/archive route coverage is incomplete: create/update routes verified, direct delete/archive not found.
- [ ] Project update/delete routes were not found.
- [ ] Idempotency infrastructure exists, but active route adoption was not verified.
