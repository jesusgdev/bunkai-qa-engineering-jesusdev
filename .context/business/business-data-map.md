# Business Data Map — Bunkai TMS

> Last verified against target repo on 2026-06-09.
> Target repo: `../upex-bunkai-tms`
> Source baseline: `supabase/migrations/0001_tenancy.sql` through `0021_atc_create_update.sql`, `app/api/v1/**/route.ts`, `app/(app)/**`, `lib/**`, existing PRD/SRS context.

```
+-------------------------------------------------------------+
| Bunkai TMS                                                   |
| A workspace-scoped test management system for turning Jira   |
| stories and acceptance criteria into anchored ATCs.           |
+-------------------------------------------------------------+
```

## Executive Summary

Bunkai TMS helps QA teams keep test knowledge traceable. A workspace owns projects, projects contain module trees, modules contain user stories, and user stories contain acceptance criteria. ATCs are then anchored to acceptance criteria so every test case has a business reason and every requirement can be checked for test coverage.

The system has three high-value business loops: onboarding a team into a workspace, importing backlog content from Jira, and authoring ATCs against that backlog. These loops are protected by Supabase Auth, workspace membership/RLS, role checks, and PAT scopes for automation callers.

For shift-left-testing, this map is the grounding layer for finding missing ACs, risky workflow states, unclear role behavior, destructive cascades, and integration failure modes before implementation enters sprint execution.

```
QA Lead / Admin        QA Engineer / Member       Automation / Agent
     |                         |                         |
     v                         v                         v
Manage workspace       Author stories, ACs,       Use PAT/API to read
members/imports        ATCs, module tree          or write test assets
```

| Actor | Value Proposition | Shift-Left Focus |
|-------|-------------------|------------------|
| QA Lead / Admin | Creates safe workspace boundaries, invites teammates, imports Jira backlog | Role gates, invite expiry/revoke, import failure handling |
| QA Engineer / Member | Organizes product modules, stories, ACs, and ATCs | AC quality, ready-to-test gate, ATC anchoring, destructive archive paths |
| Automation / Agent | Uses PATs and OpenAPI-backed endpoints to access test assets | PAT scopes, revocation, idempotency, API/RLS parity |

## Entity Map

```
Workspace
  +-- WorkspaceMember (role/status)
  +-- WorkspaceInvite + WorkspaceInviteSecret
  +-- Project
  |     +-- Module (tree path, archived_at)
  |           +-- UserStory (status, jira_key, archived_at)
  |                 +-- AcceptanceCriterion (position, archived_at)
  |                 +-- ATC (version, execution status, archived_at)
  |                       +-- ATCStep
  |                       +-- ATCAssertion
  |                       +-- ATC <-> AcceptanceCriterion
  +-- AccessToken + AccessTokenSecret
  +-- ImportJob

Operational support:
  IdempotencyKey, ActivityLog, FeatureFlag, UserViewState, MagicLinkToken
```

| Entity | Business Role | Why It Exists | Evidence |
|--------|---------------|---------------|----------|
| Workspace | Tenant boundary | Separates teams, permissions, projects, and data visibility | `supabase/migrations/0001_tenancy.sql`, `app/api/v1/workspaces/route.ts` |
| WorkspaceMember | RBAC membership | Grants `viewer`, `member`, `admin`, or `owner` rights inside a workspace | `0001_tenancy.sql`, `0005_rls_helpers.sql` |
| WorkspaceInvite | Team onboarding request | Lets admins/owners invite users by email without pre-creating accounts | `0010_workspace_invites.sql`, `app/api/v1/workspaces/[id]/invites/route.ts` |
| WorkspaceInviteSecret | Invite token secret | Stores invite token hash separately so raw token is only returned once | `0011_split_token_secrets.sql` |
| Project | Product/repository under test | Groups modules, stories, ACs, and ATCs for one application or product area | `0002_projects_modules.sql` |
| Module | Feature/module hierarchy | Provides navigable tree for product areas and test organization | `0002_projects_modules.sql`, `0014_module_soft_delete.sql`, `0015_module_move.sql` |
| UserStory | Requirement container | Stores backlog requirement content and optional Jira traceability | `0003_authoring.sql`, `0016_user_story_uniqueness.sql` |
| AcceptanceCriterion | Testable requirement condition | Defines the smallest business condition ATCs must cover | `0017_acceptance_criteria_ordering.sql` |
| ATC | Acceptance Test Case | Stores executable/manual test intent anchored to ACs | `0004_atcs.sql`, `0021_atc_create_update.sql` |
| ATCStep | Ordered test action | Captures step-by-step action data for an ATC | `0004_atcs.sql`, `0021_atc_create_update.sql` |
| ATCAssertion | Ordered expected result | Captures expected outcomes independent from steps | `0004_atcs.sql`, `0021_atc_create_update.sql` |
| ATC-AcceptanceCriterion Link | Traceability bridge | Proves which ACs an ATC validates | `0004_atcs.sql`, `0021_atc_create_update.sql` |
| AccessToken | PAT metadata | Enables CLI/agent/API automation without browser sessions | `0008_access_tokens.sql`, `app/api/v1/tokens/route.ts` |
| AccessTokenSecret | PAT secret hash | Separates raw secret from metadata; raw PAT shown once | `0011_split_token_secrets.sql`, `lib/api/middleware/bearer.ts` |
| ImportJob | Jira import execution | Tracks async one-way import status and counts | `0019_import_jobs.sql`, `0020_import_jobs_one_active.sql` |
| IdempotencyKey | Replay protection | Prevents duplicate POST effects for retried requests | `0009_cross_cutting.sql`, `lib/api/idempotency.ts` |
| ActivityLog | Audit-light history | Records business events, confirmed for ATC create/update | `0009_cross_cutting.sql`, `0021_atc_create_update.sql` |
| FeatureFlag | Runtime feature switch | Allows global/workspace-scoped flags; app consumer not verified | `0009_cross_cutting.sql` |
| UserViewState | UI preference persistence | Stores per-user/project view choices | `0009_cross_cutting.sql` |
| MagicLinkToken | Auth audit/replay support | Tracks magic-link issuance and replay-related metadata | `0009_cross_cutting.sql`, `0011_split_token_secrets.sql` |

## Key Relationships

| Relationship | Meaning | Shift-Left Implication |
|--------------|---------|------------------------|
| Workspace -> Project -> Module -> Story -> AC | Product knowledge hierarchy | Stories without ACs cannot be treated as ready for reliable testing |
| Story -> ATC and AC -> ATC | ATCs are anchored to business requirements | AC provenance must be explicit in every ATC story |
| Module -> descendants via `path` | Tree structure is materialized as slash-separated slug path | Rename/move/delete ACs must discuss child impact |
| Invite -> InviteSecret | Raw invite token is one-time material | Acceptance criteria must include token visibility and expiry/revoke behavior |
| AccessToken -> AccessTokenSecret | PAT metadata and secret hash are split | Tests must not expect raw secret after creation |
| ImportJob -> Project/Module/Story/AC | Jira import materializes backlog into Bunkai hierarchy | Import AC parsing and duplicate handling affect downstream QA quality |

## Business Flows

### Flow 1 — Workspace Bootstrap

```
Authenticated User
  -> POST /api/v1/workspaces or onboarding form
  -> validate slug/name
  -> bunkai_bootstrap_workspace()
  -> Workspace + owner WorkspaceMember
  -> redirect/list projects
```

1. The user signs in and has no usable workspace.
2. The onboarding/API request validates workspace name and slug.
3. `bunkai_bootstrap_workspace()` creates the workspace and owner membership atomically.
4. The user becomes owner and can create projects or invite teammates.

| Business Rule | Evidence | Shift-Left Prompt |
|---------------|----------|-------------------|
| Workspace slug must be valid and unique | `0006_bootstrap_workspace.sql`, `app/api/v1/workspaces/route.ts` | What should happen for reserved words, uppercase, spaces, duplicate slug? |
| First membership is owner | `0006_bootstrap_workspace.sql` | Should owner be able to transfer ownership? No route found. |
| RLS scopes workspace reads/writes | `0001_tenancy.sql`, `0005_rls_helpers.sql` | Are non-member 404/403 expectations explicit in ACs? |

### Flow 2 — Project And Module Authoring

```
Member/Admin/Owner
  -> create project in workspace
  -> create nested module
  -> rename or move module
  -> path rebuilt for descendants
  -> optional archive cascade
```

1. A workspace member creates a project.
2. Modules are created under projects or parent modules.
3. Module paths are slash-separated slug chains and have a max depth of 6.
4. Moving a module rejects cross-project parents, cycles, and over-depth trees.
5. Archiving a module cascades to descendant modules, stories, ACs, and ATCs.

| Business Rule | Evidence | Shift-Left Prompt |
|---------------|----------|-------------------|
| Module tree max depth is 6 | `lib/modules/path.ts`, `0015_module_move.sql` | Are max-depth and cycle errors in ACs for move? |
| Module delete is archive cascade, not hard delete | `0014_module_soft_delete.sql`, `app/api/v1/modules/[id]/route.ts` | Do stories mention all affected descendants? |
| Module descriptions use Markdown | `0013_module_description.sql` | Do ACs cover sanitization/rendering? |

### Flow 3 — Story And Acceptance Criteria Authoring

```
Module
  -> create UserStory
  -> add AcceptanceCriteria
  -> reorder / edit / archive AC
  -> ready_to_test gate checks active AC count
```

1. A member creates a story inside an active module.
2. The story can carry an optional Jira key, which is unique and treated as immutable after creation.
3. ACs are ordered under the story using active-only position uniqueness.
4. Reordering uses atomic rebalance logic.
5. `ready_to_test` is blocked unless the story has at least one active AC; archiving the last AC reverts the story to `draft`.

| Business Rule | Evidence | Shift-Left Prompt |
|---------------|----------|-------------------|
| Ready story must have active ACs | `0018_ready_to_test_gate_fn.sql` | Do ACs describe reverting to draft when last AC is archived? |
| AC order is active-only and rebalanced | `0017_acceptance_criteria_ordering.sql` | Are concurrent reorder and delete covered? |
| Jira key is optional but unique/immutable | `0016_user_story_uniqueness.sql`, `lib/user-stories/validation.ts` | Should manual stories allow no Jira key? |

### Flow 4 — ATC Create And Update

```
QA Engineer / PAT caller
  -> POST /api/v1/atcs or PATCH /api/v1/atcs/{id}
  -> authorize cookie/PAT + atc:write
  -> validate module/story/AC provenance
  -> transactional RPC replaces steps/assertions/links
  -> version increments + activity logged
```

1. Caller uses browser session or PAT with appropriate capability.
2. Request validates title, layer, tags, step/assertion structure, and AC IDs.
3. BK-18 RPCs require linked ACs and verify ACs belong to the ATC story.
4. Update can use `X-If-Match` for optimistic locking.
5. Steps, assertions, and AC links are full-replaced transactionally.

| Business Rule | Evidence | Shift-Left Prompt |
|---------------|----------|-------------------|
| ATC must anchor to one or more valid ACs in the same story | `0021_atc_create_update.sql`, `lib/atcs/builder-guards.ts` | Does each ATC story state AC provenance? |
| ATC update bumps version | `0021_atc_create_update.sql`, `lib/atcs/optimistic-lock.ts` | Are stale edit conflicts covered? |
| Module/story identity is effectively immutable on edit | `0021_atc_create_update.sql` | Should moving an ATC be separate future work? |
| Markdown/user content is sanitized | `lib/atcs/sanitize.ts`, `lib/markdown/sanitize.ts` | Are XSS-like inputs in negative ACs? |

### Flow 5 — PAT Lifecycle For Automation

```
Browser session or headless signin/signup
  -> create PAT
  -> raw bk_pat_<prefix>.<secret> shown once
  -> secret hash stored separately
  -> Authorization: Bearer ...
  -> prefix lookup + hash compare + expiry/revoke checks
```

1. A user creates a PAT through token endpoints or through headless auth routes.
2. Raw token is returned once and only hash metadata persists.
3. API calls resolve PAT before cookie session and convert it into a principal with a Supabase user JWT for RLS parity.
4. Revoked, expired, unknown, or insufficient-scope PATs are rejected.

| Business Rule | Evidence | Shift-Left Prompt |
|---------------|----------|-------------------|
| Raw PAT cannot be recovered after creation | `0008_access_tokens.sql`, `0011_split_token_secrets.sql` | Do ACs cover one-time secret visibility? |
| PAT cannot mint/revoke PAT, except headless auth mint flow | `lib/api/principal.ts`, `app/api/v1/auth/signin/route.ts` | Is the exception intentional in the story? |
| PAT callers must respect same RLS boundary | `lib/api/principal.ts` | Are cookie/PAT parity scenarios included? |

### Flow 6 — Workspace Invites

```
Admin/Owner
  -> POST /workspaces/{id}/invites
  -> raw invite token returned once
  -> invitee signs in with matching email
  -> POST /invites/accept
  -> active WorkspaceMember upserted
```

1. Admin or owner creates an invite with role and email.
2. Token hash is stored separately; raw token is exposed to the caller.
3. Invite can be rotated or revoked.
4. Invitee must be authenticated and email must match.
5. Acceptance marks invite accepted and upserts active membership.

| Business Rule | Evidence | Shift-Left Prompt |
|---------------|----------|-------------------|
| Invite is pending until accepted/revoked/expired | `0010_workspace_invites.sql` | Are expired/revoked/accepted replay paths explicit? |
| Email must match signed-in user | `app/api/v1/invites/accept/route.ts` | Are wrong-account acceptance cases covered? |
| Invite email delivery is not implemented in code | `app/api/v1/workspaces/[id]/invites/route.ts` | Should story state manual token copy or email delivery? |

### Flow 7 — Jira Import

```
QA Lead
  -> POST /api/v1/imports (JQL/project)
  -> ImportJob queued
  -> Vercel after() worker fetches Jira
  -> ADF -> Markdown + AC extraction
  -> upsert stories/ACs
  -> poll GET /api/v1/imports/{id}
```

1. User starts one async import for a project.
2. One queued/running job per project is allowed.
3. Worker fetches Jira issues, maps components to modules, falls back to Inbox when needed.
4. Story body is converted from ADF to Markdown.
5. AC extraction appends new ACs and skips duplicates by normalized title.
6. Import job records counts and final status.

| Business Rule | Evidence | Shift-Left Prompt |
|---------------|----------|-------------------|
| Only one active import per project | `0020_import_jobs_one_active.sql` | Are duplicate import submissions covered? |
| Jira auth failures surface as failed jobs | `lib/jira/client.ts`, `lib/jira/import-runner.ts` | Are failed/polling/error states in ACs? |
| Inbox fallback handles unknown components | `lib/jira/import-runner.ts` | Should team accept Inbox default? |

## State Machines

### Workspace Invite

```
pending -> accepted
pending -> revoked
pending -> expired (time-based)
accepted/revoked/expired -> terminal
```

| From | To | Triggering Event | Effects |
|------|----|------------------|---------|
| pending | accepted | Invitee accepts with matching email | `accepted_at` set, active membership upserted |
| pending | revoked | Admin/owner revokes | `revoked_at` set, token unusable |
| pending | expired | `expires_at < now()` | Acceptance rejected |
| pending | pending | Rotate token | Old token replaced, expiry reset |

### Import Job

```
queued -> running -> completed
                 +-> failed
```

| From | To | Triggering Event | Effects |
|------|----|------------------|---------|
| queued | running | Worker claims job | Start timestamp set |
| running | completed | All issues processed | Counts persisted |
| running | failed | Jira/API/parser error | Error code/message persisted |

### User Story Readiness

```
draft <-> ready_to_test
ready_to_test -> draft (last active AC archived)
```

| From | To | Triggering Event | Effects |
|------|----|------------------|---------|
| draft | ready_to_test | Status update with >=1 active AC | Story can enter QA planning |
| ready_to_test | draft | Last active AC archived | Story loses ready gate |

### Module Archive

```
active -> archived
```

| From | To | Triggering Event | Effects |
|------|----|------------------|---------|
| active | archived | DELETE module route | Descendant modules, stories, ACs, ATCs archived |

### ATC Version And Execution Status

```
version 1 -> version N (edit)

unrun -> running -> pass
                +-> fail
                +-> blocked
                +-> skipped
```

| From | To | Triggering Event | Effects |
|------|----|------------------|---------|
| version N | version N+1 | Successful update | Children/links replaced, activity logged |
| any execution status | another status | Runner/update endpoint | Schema supports this, route not verified |

### PAT

```
active -> revoked
active -> expired
```

| From | To | Triggering Event | Effects |
|------|----|------------------|---------|
| active | revoked | DELETE token endpoint | `revoked_at` set, calls rejected |
| active | expired | Time passes beyond `expires_at` | Calls rejected |

### Idempotency Key

```
pending -> succeeded
pending -> failed
```

| From | To | Triggering Event | Effects |
|------|----|------------------|---------|
| pending | succeeded | Request completes | Snapshot can be replayed for same key/payload |
| pending | failed | Request errors | Failure recorded |

## Automatic Processes

### Database Triggers And RPC Side Effects

| Process | Trigger | Why It Exists | Evidence |
|---------|---------|---------------|----------|
| ATC `updated_at` refresh | ATC update | Keeps modification time reliable | `0004_atcs.sql` |
| ATC FTS vector refresh | ATC title/content change | Powers search | `0004_atcs.sql` |
| Module descendant path rebuild | Module rename/move | Keeps tree navigation correct | `0014_module_soft_delete.sql`, `0015_module_move.sql` |
| Module archive cascade | Module archive | Prevents orphan active descendants | `0014_module_soft_delete.sql` |
| AC position rebalance | AC insert/move/archive | Maintains unique active order | `0017_acceptance_criteria_ordering.sql` |
| Ready-to-test downgrade | Last active AC archived | Prevents QA-ready story with no ACs | `0018_ready_to_test_gate_fn.sql` |
| ATC child replacement | ATC create/update RPC | Keeps steps/assertions/links transactional | `0021_atc_create_update.sql` |
| ATC activity events | ATC create/update | Provides audit-light trail | `0021_atc_create_update.sql` |

### Cron Jobs

| Process | Schedule | Why It Exists | Evidence |
|---------|----------|---------------|----------|
| None verified | N/A | No scheduled job found in source | `scripts/`, `app/api/`, `supabase/migrations/` inspected |

### Incoming Webhooks

| Process | Source | Why It Exists | Evidence |
|---------|--------|---------------|----------|
| None verified | N/A | No inbound webhook route found | `app/api/v1/**/route.ts` inspected |

### Background Jobs

| Process | Trigger | Why It Exists | Evidence |
|---------|---------|---------------|----------|
| Jira import runner | `POST /api/v1/imports`, then Vercel `after()` | Allows long-running import without blocking request | `app/api/v1/imports/route.ts`, `lib/jira/import-runner.ts` |

## External Integrations

### Supabase Auth And Postgres

```
Browser/API caller -> Next.js -> Supabase Auth / RLS-scoped DB
```

Supabase is both the authentication provider and primary database. Browser sessions use cookies; PAT callers are converted into a user JWT so RLS still applies.

| Data Impact | Dependent Flows | Failure Mode |
|-------------|-----------------|--------------|
| Auth sessions, users, RLS-scoped reads/writes | Login, workspace, authoring, ATC, PAT | 401/403, hidden rows, failed writes |

### Jira Cloud

```
Bunkai import job -> Jira REST -> ADF/AC parser -> Bunkai stories + ACs
```

Jira supplies external backlog content. Imports are async and one-way.

| Data Impact | Dependent Flows | Failure Mode |
|-------------|-----------------|--------------|
| Creates/updates stories and ACs from issues | Jira import, shift-left readiness | Failed job, skipped issue, Inbox fallback, stale backlog |

### Resend / Supabase SMTP

```
Supabase Auth -> configured SMTP -> user email inbox
```

Email delivery is required for magic-link login. Direct Resend code was not verified; current evidence points to Supabase Auth SMTP configuration.

| Data Impact | Dependent Flows | Failure Mode |
|-------------|-----------------|--------------|
| No app table impact; enables login link delivery | Login/onboarding | User cannot receive login link |

### Vercel

```
HTTP request -> Next.js route handler -> Vercel runtime / after()
```

Vercel hosts the application and runs background import work through `after()`.

| Data Impact | Dependent Flows | Failure Mode |
|-------------|-----------------|--------------|
| Runtime availability; background import completion | All flows, Jira import | Request failures, import stalls/fails |

### OpenAPI / Scalar

```
route.openapi.ts -> openapi-gen -> public/openapi.json -> /api/docs
```

OpenAPI is the technical API source for downstream automation. Business API narrative belongs in `business-api-map.md`.

| Data Impact | Dependent Flows | Failure Mode |
|-------------|-----------------|--------------|
| No business data; documents API contracts | API tests, agents, shift-left API review | Stale docs, missing route coverage |

## Shift-Left Risk Checklist

| Risk Area | Why It Matters | Questions For AC Refinement |
|-----------|----------------|-----------------------------|
| RLS and roles | Same entity behaves differently by role/member status | Which roles can create, edit, delete/archive, invite, import, and view? |
| One-time secrets | PATs and invite tokens are not recoverable | Is raw-secret display, copy, rotate, and loss behavior specified? |
| Destructive cascades | Module archive impacts descendants and ATCs | Does AC mention descendant modules/stories/ACs/ATCs? |
| Reordering/concurrency | AC positions and ATC versions can conflict | Are stale updates and simultaneous reorder/delete scenarios covered? |
| Ready-to-test gate | Story quality depends on active ACs | What happens when ACs are missing or removed after readiness? |
| Jira import | External data can be malformed/stale/duplicated | Are JQL errors, duplicate import, Inbox fallback, and AC extraction covered? |
| Markdown/sanitization | User-authored content is rendered | Are script tags, links, markdown tables, and long content covered? |
| API/RLS parity | PAT callers should see same workspace limits | Are session and PAT paths both specified? |

## Discovery Gaps

The following items could not be verified from source and require human confirmation:

- [ ] Direct ATC delete/archive route: schema supports `archived_at`, but only module cascade archive was verified.
- [ ] Workspace delete/owner-transfer behavior: DB policy exists, but no direct workspace delete or ownership transfer route was found.
- [ ] Member removal/suspension flow: membership statuses exist, but no member removal endpoint was verified.
- [ ] Invite email delivery: invite token is returned by API, but email delivery code was not verified.
- [ ] Idempotency infrastructure usage: `idempotency_keys` exists, but active route usage of `beginIdempotentRequest` was not verified.
- [ ] Feature flags and user view state usage: tables exist, but app-layer consumers were not verified.
- [ ] Magic-link audit table usage: tables exist, but current magic-link route linkage was not fully verified.
- [ ] ATC execution status transitions: schema supports runner-like states, but no runner/update endpoint was found.
- [ ] Activity log coverage beyond ATC create/update was not verified.
- [ ] OpenAPI completeness against all route handlers should be checked with `bun run openapi:diff` in the target repo.
