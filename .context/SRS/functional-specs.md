# Functional Specifications — Bunkai TMS

> Generated: 2026-05-25

## Feature Map

| ID | Feature | Module | Priority | Status in Code |
|----|---------|--------|----------|----------------|
| F-001 | Magic-link authentication | Auth | P0 | ✅ Complete |
| F-002 | PAT bearer token auth | Auth | P0 | ✅ Complete |
| F-003 | Session persistence | Auth | P0 | ✅ Complete |
| F-004 | Create workspace via onboarding | Workspace | P0 | ✅ Complete |
| F-005 | Workspace-scoped RLS | Workspace | P0 | ✅ Complete |
| F-006 | Module tree navigation | Dashboard | P0 | ✅ Complete |
| F-007 | ATC CRUD with server actions | ATC | P0 | ✅ Complete |
| F-008 | ATC step editor | ATC | P0 | ✅ Complete |
| F-009 | ATC anchoring to ACs | ATC | P0 | ✅ Complete |
| F-010 | ATC search (full-text) | ATC | P1 | ✅ Complete |
| F-011 | OpenAPI spec + docs | API | P1 | ✅ Complete |
| F-012 | Idempotent API operations | API | P1 | ✅ Complete |
| F-013 | Health check endpoint | API | P1 | ✅ Complete |
| F-014 | RBAC: viewer/member/admin/owner | Authz | P1 | ✅ Complete |
| F-015 | User story import | Sync | P2 | ❌ Not built |
| F-016 | Jira issue sync | Sync | P2 | ❌ Scripts exist |
| F-017 | Test execution runner | Runner | P3 | ❌ Not built |
| F-018 | Batch ATC operations | ATC | P3 | ❌ Not built |
| F-019 | Export/import ATCs | ATC | P3 | ❌ Not built |

## Feature Specifications

### F-001: Magic-link Authentication

**Module:** Auth
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `app/(auth)/login/`, `app/(auth)/login/magic-link-form.tsx`, `app/auth/callback/route.ts`

**Description:** Users can sign in with their email — a one-time password (OTP) link is sent via email.

**Acceptance Criteria:**
1. User enters any valid email in the login form
2. System sends OTP email via Resend (configured as Supabase Auth SMTP)
3. User clicks link → `/auth/callback` exchanges code for session
4. User redirects to `/onboarding` (no workspace) or `/projects` (has workspace)
5. Invalid/expired link shows error, user can re-request

### F-002: PAT Bearer Token Auth

**Module:** Auth
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `app/api/v1/tokens/`, `lib/api/middleware/bearer.ts`

**Description:** Automation users can create Personal Access Tokens for scripted API access.

**Acceptance Criteria:**
1. Authenticated user POSTs to `/api/v1/tokens` → receives `bk_pat_<prefix>.<secret>` once
2. SHA-256 hash of secret stored in `access_tokens` table
3. API calls with `Authorization: Bearer bk_pat_<prefix>.<secret>` are validated
4. Token lookup is O(1) via `token_prefix` index
5. Hash comparison is constant-time
6. Expired or revoked tokens are rejected with 401
7. User can list and revoke their own tokens

### F-003: Session Persistence

**Module:** Auth
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `lib/supabase/server.ts`, `lib/supabase/client.ts`, `components/providers/auth-context.tsx`

**Description:** Session is maintained across page loads via Supabase SSR cookie management.

**Acceptance Criteria:**
1. Session cookie set after successful auth callback
2. Each request to protected routes extracts and refreshes session
3. Middleware redirects unauthenticated users to `/login`
4. Session refresh happens transparently

### F-004: Create Workspace (Onboarding)

**Module:** Workspace
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `app/(app)/onboarding/`, `onboarding-form.tsx`

**Description:** New users without a workspace see an onboarding page to create their first workspace.

**Acceptance Criteria:**
1. New user (no workspace memberships) lands on `/onboarding`
2. User enters workspace slug + name
3. `bunkai_bootstrap_workspace()` RPC creates workspace + owner membership
4. Duplicate slug → validation error
5. Invalid slug (bad characters) → validation error
6. Redirect to `/projects` on success

### F-005: Workspace-Scoped RLS

**Module:** Workspace
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `supabase/migrations/0005_rls_helpers.sql`

**Description:** PostgreSQL RLS ensures users only see data within their workspaces.

**Acceptance Criteria:**
1. User queries only return rows for workspaces where they are a member
2. `get_user_workspace_ids()` helper function used across all RLS policies
3. RLS is tested via integration test (but no test file exists yet)
4. Admin CRUD policies scope to workspace-level access

### F-006: Module Tree Navigation

**Module:** Dashboard
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `app/(app)/projects/[projectSlug]/page.tsx`, `components/layout/Sidebar.tsx`, `lib/tree.ts`

**Description:** Hierarchical module tree in the sidebar for navigating ATCs.

**Acceptance Criteria:**
1. Sidebar displays modules as collapsible tree with user stories as leaves
2. Module tree is built from flat DB rows via `buildModuleTree()`
3. Clicking a module/user story filters the ATC table or navigates to it
4. Tree reflects current project's structure

### F-007: ATC CRUD (Server Actions)

**Module:** ATC
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `app/(app)/projects/[projectSlug]/atcs/[atcId]/actions.ts`

**Description:** Create, read, update ATCs via Next.js Server Actions + RPCs.

**Acceptance Criteria:**
1. `bunkai_save_atc()` RPC handles INSERT or UPDATE (upsert)
2. `p_ac_ids` param must be non-empty (at least one AC linked)
3. Steps and assertions saved via CASCADE inserts (DELETE old + INSERT new)
4. ATC version incremented on each save
5. Deletion of an ATC is restricted if it is referenced elsewhere (RESTRICT FK)

### F-008: ATC Step Editor

**Module:** ATC
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `components/atcs/StepEditor.tsx`, `components/atcs/AtcEditor.tsx`, `lib/atc-parse.ts`

**Description:** WYSIWYG editor for ATC steps with markdown parsing.

**Acceptance Criteria:**
1. Steps are parsed from markdown format
2. Each step can have optional `input:` and `expected:` values
3. Steps are numbered in order of the `position` column
4. Empty step content is allowed (user hasn't typed yet)
5. Monaco Editor integration provides code editing

### F-009: ATC Anchoring to ACs

**Module:** ATC
**Priority:** P0
**Status:** ✅ Complete
**Code references:** `components/atcs/AnchoringPanel.tsx`

**Description:** ATCs are linked to one or more acceptance criteria, creating traceability.

**Acceptance Criteria:**
1. AnchoringPanel shows available ACs from the user story
2. User selects one or more ACs to link
3. Links stored in `atc_acceptance_criteria` junction table
4. ATC save fails if no AC is selected (`p_ac_ids` must be non-empty)
5. Viewing an ATC shows its linked ACs

### F-010: ATC Full-Text Search

**Module:** ATC
**Priority:** P1
**Status:** ✅ Complete
**Code references:** `supabase/migrations/0004_atcs.sql` (atcs.tsv GIN index)

**Description:** PostgreSQL full-text search across ATC titles.

**Acceptance Criteria:**
1. `tsv` column stores search vector (atc title)
2. GIN index on `tsv` enables fast `@@ websearch_to_tsquery(term)` queries
3. Search is scoped to the current project
4. Results ranked by relevance

### F-011: OpenAPI Spec + Docs

**Module:** API
**Priority:** P1
**Status:** ✅ Complete
**Code references:** `app/api/openapi/`, `lib/openapi/registry.ts`

**Description:** Auto-generated OpenAPI 3.1 spec with Scalar documentation UI.

**Acceptance Criteria:**
1. Each route handler exports OpenAPI metadata via `@openapi/openapi` decorator
2. `/api/openapi` serves the compiled JSON spec
3. `/api/openapi/docs` renders interactive Scalar UI
4. Spec includes all v1 routes: health, auth, tokens

### F-012: Idempotent API Operations

**Module:** API
**Priority:** P1
**Status:** ✅ Complete
**Code references:** `lib/api/idempotency.ts`

**Description:** Critical API operations support idempotency keys.

**Acceptance Criteria:**
1. Client sends `Idempotency-Key` header
2. Server stores successful response keyed by idempotency key
3. Same key within TTL returns cached response instead of re-executing
4. Uniqueness: any `idempotency_key` must be processable only once

### F-013: Health Check Endpoint

**Module:** API
**Priority:** P1
**Status:** ✅ Complete
**Code references:** `app/api/v1/health/route.ts`

**Description:** `/api/v1/health` returns 200 OK with status information.

**Acceptance Criteria:**
1. Returns `{ status: "ok", timestamp, version }`
2. Unauthenticated — no auth required
3. Used for monitoring/liveness checks

### F-014: RBAC

**Module:** Authz
**Priority:** P1
**Status:** ✅ Complete
**Code references:** `supabase/migrations/0001_tenancy.sql`, `0005_rls_helpers.sql`

**Description:** Role-based access control with four roles: viewer, member, admin, owner.

**Acceptance Criteria:**
| Role | View ATCs | Create/Edit ATCs | Manage Members | Delete Workspace |
|------|-----------|-----------------|----------------|-----------------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ❌ |
| Member | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ |

### F-015 → F-019: Not Built

These features are scoped out. They exist as requirements or scripts but have no production UI/code.

## UI Feature Mapping

### Screens / Pages Map

| Screen | Route | Features Used | Layout |
|--------|-------|---------------|--------|
| Login | `/login` | F-001 | Split layout (brand panel + form) |
| Onboarding | `/onboarding` | F-004 | Centered card |
| Project Dashboard | `/projects/[slug]` | F-006, F-007, F-010 | Sidebar + main panel |
| ATC Detail | `/projects/[slug]/atcs/[id]` | F-008, F-009 | Full-width editor |
| API Docs | `/api/openapi/docs` | F-011 | Scalar UI (full page) |

### Layout Components

| Component | Route(s) | Purpose |
|-----------|----------|---------|
| Sidebar | `/projects/*` | Module tree navigation (F-006) |
| Topbar | `/projects/*` | Workspace name, breadcrumbs, search |
| AuthProvider | `(app)/*` | Session management (F-003) |
| Toaster | Root layout | Toast notifications |
| CommandPalette | `/projects/*` | ⌘K quick actions |
| WorkspaceSwitcher | `/projects/*` | Switch between workspaces |
| Wordmark | `/login`, Topbar | Brand logo |

## Error Handling Patterns

### API Error Envelope

Every API error returns a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "title": "Validation failed",
    "detail": "p_ac_ids must be a non-empty array",
    "source": { "pointer": "/body/p_ac_ids" },
    "status": 422
  },
  "request_id": "req_abc123"
}
```

**Error codes detected:**
- `VALIDATION_ERROR` — 422, input validation
- `NOT_FOUND` — 404, resource doesn't exist
- `UNAUTHORIZED` — 401, authentication failure
- `FORBIDDEN` — 403, authorization failure (RLS)
- `CONFLICT` — 409, duplicate/version conflict
- `INTERNAL_ERROR` — 500, unexpected error
- `UNPROCESSABLE` — 422, business rule violation

### Server Action Error Handling

ATC server actions validate via Zod schemas before DB calls. Validation errors surface as form errors.

## Edge Cases

| Scenario | Expected Behavior | Status |
|----------|------------------|--------|
| User creates workspace with the same slug as deleted workspace | UNIQUE constraint prevents it | ✅ |
| Module tree with 10k modules | `buildModuleTree()` must handle large datasets | ❓ Untested |
| ATC with 500 steps | Step reordering is O(n) | ❓ Untested |
| Two users edit same ATC simultaneously | Last writer wins (no merge) | ❓ No conflict detection |
| PAT token prefix collision | UUID prefix collision is astronomically unlikely | ✅ |
| Workspace has 0 projects | Empty state shown | ✅ |

## Non-Functional Specifications

See `.context/SRS/non-functional-specs.md`
