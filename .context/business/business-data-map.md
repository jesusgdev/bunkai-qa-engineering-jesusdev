# Business Data Map — Bunkai TMS

> Generated: 2026-05-25

## Entity Lifecycles

### Workspace

```
Created (onboarding)
  │
  ▼
Active ──→ Archived (owner action)
  │
  └──→ Deleted (cascade on owner delete)
```

| State | Transitions | Triggers |
|-------|-------------|----------|
| `Created` | → Active | `bunkai_bootstrap_workspace()` RPC |
| `Active` | → Archived | Owner action (not implemented) |
| `Active` | → Deleted | Cascade (not implemented) |

### ATC

```
Draft ──→ Active (version 1)
 Active ──→ Active (version N)
 Active ──→ Deprecated
 Deprecated ──→ Archived
```

| State | Transitions | Triggers |
|-------|-------------|----------|
| `Draft` | → Active | First save via `bunkai_save_atc()` |
| `Active` | → Active (v+N) | Subsequent save (version incremented) |
| `Active` | → Deprecated | Manual (not implemented) |
| `Deprecated` | → Archived | Manual (not implemented) |

### Access Token

```
Active ──→ Expired (time-based)
Active ──→ Revoked (user action)
```

| State | Transitions | Triggers |
|-------|-------------|----------|
| `Active` | → Expired | `expires_at < now()` |
| `Active` | → Revoked | `DELETE /api/v1/tokens/[id]` sets `revoked_at` |

### Workspace Membership

```
Invited ──→ Active (user acceptance)
Active ──→ Removed (admin/owner)
```

| Role | Hierarchy |
|------|-----------|
| `owner` | Highest — can delete workspace, manage all |
| `admin` | Can manage members, edit content |
| `member` | Can create/edit ATCs |
| `viewer` | Read-only access |

## Data Relationships

### Core Hierarchy

```
Workspace (1) ──→ (N) Projects
  Project (1) ──→ (N) Modules (self-referencing tree)
    Module (1) ──→ (N) User Stories
      User Story (1) ──→ (N) Acceptance Criteria
        AC (1) ──→ (M) ATCs (via atc_acceptance_criteria)
      Module (1) ──→ (N) ATCs
    Project (1) ──→ (N) ATCs
  Workspace (1) ──→ (N) Access Tokens
  Workspace (1) ──→ (N) Workspace Members
    Workspace Member (1) ──→ (1) auth.users
```

### ATC Sub-Entities

```
ATC (1) ──→ (N) ATC Steps (ordered by position)
ATC (1) ──→ (N) ATC Assertions (ordered by position)
ATC (1) ──→ (N) Acceptance Criteria (many-to-many)
```

## State Machines (DB-Level)

### Module Tree

```
Module.path = '{parent_id}.{module_id}' (materialized path)
Position within the same parent must be unique.
```

### Entity Ordering

| Table | Order Column | Scope of Uniqueness |
|-------|-------------|---------------------|
| `acceptance_criteria` | `position` | `(user_story_id, position)` |
| `atc_steps` | `position` | `(atc_id, position)` |
| `atc_assertions` | `position` | `(atc_id, position)` |
| `modules` | `position` | `(project_id, parent_module_id, position)` |

## Business Rules

| ID | Rule | Enforcement | Violation Handling |
|----|------|------------|-------------------|
| BR-01 | ATC must be linked to at least one AC | App-level (server action validates `p_ac_ids` non-empty) | Validation error |
| BR-02 | ATC slug must be unique within project | DB UNIQUE `(project_id, slug)` | 23505 → conflict error |
| BR-03 | Workspace slug must be unique globally | DB UNIQUE `workspaces.slug` | 23505 → conflict error |
| BR-04 | Only workspace owner can delete workspace | RLS policy (not fully implemented) | 403 Forbidden |
| BR-05 | Only admin/owner can manage members | RLS: `workspace_members_insert_admin` | 403 Forbidden |
| BR-06 | ATC cannot be deleted if referenced | FK `RESTRICT` on `atc_acceptance_criteria` | FK violation |
| BR-07 | PAT can be scoped to specific permissions | `access_tokens.scopes` column | Scope check in middleware |
| BR-08 | User cannot have duplicate email-based session | N/A — each session is independent | — |
| BR-09 | Module path is materialized for tree queries | `modules.path` auto-computed | Application layer |

## Test Data Strategies

### Authentication Tests

| Scenario | Test Data | Setup |
|----------|-----------|-------|
| Valid magic link | Any email | — |
| Expired magic link | Any email + wait | Wait 1h or mock |
| Invalid code | Random code | — |
| Session persistence | Authenticated user | Login first |

### Workspace Tests

| Scenario | Test Data | Setup |
|----------|-----------|-------|
| Create workspace | New user | Fresh auth account |
| Duplicate slug | Existing slug | Create workspace first |
| Invalid slug | slug with spaces | — |

### ATC Tests

| Scenario | Test Data | Setup |
|----------|-----------|-------|
| Create ATC | Workspace + project + module + story + AC | Full hierarchy |
| Edit ATC steps | Existing ATC | Create ATC first |
| Link AC to ATC | Existing ATC + existing AC | Both exist |
| Search by term | Multiple ATCs with varied titles | Create ATCs |

### API Tests

| Scenario | Test Data | Setup |
|----------|-----------|-------|
| PAT authentication | Active PAT | Create token first |
| Expired PAT | PAT with past `expires_at` | Create expired token |
| Revoked PAT | PAT with `revoked_at` set | Create & revoke |
| Health check | — | No auth needed |

## Known Gaps

| Gap | Impact | Resolution |
|-----|--------|------------|
| No soft-delete for ATCs | Delete removes data permanently | Add `deleted_at` column |
| No ATC version history | Can't roll back | Store previous versions |
| No AC reordering UI | Position must be set manually | — |
| No user story ordering | Stories appear in insertion order | Add position column |
| No project delete | Projects accumulate | Add cascade delete |
| No test data seeds | Every test needs fresh setup | Add seed SQL or factory functions |
