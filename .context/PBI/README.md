# PBI Structure — Bunkai TMS

> Generated: 2026-05-25

## Module Mapping

| Module | Features | ATC Context | Priority | File Owner |
|--------|----------|-------------|----------|------------|
| `auth` | Magic-link login, session, callback, PAT tokens | F-001, F-002, F-003 | P0 | `.context/PBI/auth/` |
| `workspace` | Onboarding, workspace CRUD, member management | F-004, F-014 | P0 | `.context/PBI/workspace/` |
| `project` | Project CRUD, navigation routing | F-005 scaffolding | P0 | `.context/PBI/project/` |
| `module-tree` | Module tree sidebar, navigation | F-006 | P0 | `.context/PBI/module-tree/` |
| `atc-editor` | ATC steps, assertions, versioning, save | F-007, F-008 | P0 | `.context/PBI/atc-editor/` |
| `atc-anchoring` | ATC ↔ AC linking, anchoring panel | F-009 | P0 | `.context/PBI/atc-anchoring/` |
| `atc-search` | Full-text search via GIN index | F-010 | P1 | `.context/PBI/atc-search/` |
| `api-tokens` | PAT create/list/revoke, middleware | F-002 (API angle) | P0 | `.context/PBI/atc-anchoring/` |
| `api-docs` | OpenAPI spec + Scalar docs | F-011 | P1 | `.context/PBI/api-docs/` |
| `idempotency` | Idempotent API operations | F-012 | P1 | `.context/PBI/idempotency/` |
| `tms-sync` | Jira issue sync, import | F-015, F-016 | P2 | `.context/PBI/tms-sync/` |
| `test-runner` | ATC execution engine | F-017 | P3 | `.context/PBI/test-runner/` |

## Structure

```
.context/PBI/
├── README.md                  # This file — PBI mapping + conventions
├── templates/                 # Per-module templates
│   ├── module-context-template.md     # ℹ️ template for module context docs
│   ├── PROGRESS-template.md          # ℹ️ progress tracker template
│   └── ROADMAP-template.md           # ℹ️ roadmap template
├── auth/                      # Auth module
│   ├── auth-test-plan.md     # ℹ️ existing test plan
│   └── test-specs/           # Existing test specs
├── workspace/                 # Workspace module (pending)
├── project/                   # Project module (pending)
├── module-tree/               # Module tree (pending)
├── atc-editor/                # ATC editor (pending)
├── atc-anchoring/             # ATC anchoring (pending)
└── ...                        # Other modules
```

## Conventions

| Rule | Convention |
|------|-----------|
| Module name | kebab-case |
| PBI folder | `.context/PBI/{module-name}/` |
| Context doc | `{module-name}-context.md` |
| Test plan | `{module-name}-test-plan.md` |
| Test report | `{module-name}-test-report.md` |
| Evidence | `{module-name}/evidence/` (gitignored) |
| Ticket subfolder | `.context/PBI/{module-name}/{TICKET-ID}-{brief-title}/` |

## Template Usage

When creating a new module PBI:

1. Copy `templates/module-context-template.md` → `{module}/context.md`
2. Copy `templates/PROGRESS-template.md` → `{module}/PROGRESS.md`
3. Copy `templates/ROADMAP-template.md` → `{module}/ROADMAP.md`
4. Fill placeholders (`{{module-name}}`, `{{description}}`, etc.)
5. Update this README to reflect the new module

## Ticket → Module Map

| TMS ID | Title | Module | Priority |
|--------|-------|--------|----------|
| BK-??? | Magic-link authentication | auth | P0 |
| BK-??? | PAT token management | auth | P0 |
| BK-??? | Workspace onboarding | workspace | P0 |
| BK-??? | Workspace member roles (RBAC) | workspace | P0 |
| BK-??? | Project dashboard | project | P0 |
| BK-??? | Module tree navigation | module-tree | P0 |
| BK-??? | ATC editor with steps/assertions | atc-editor | P0 |
| BK-??? | ATC anchoring to AC | atc-anchoring | P0 |
| BK-??? | ATC full-text search | atc-search | P1 |
| BK-??? | OpenAPI spec + docs | api-docs | P1 |
| BK-??? | Jira issue sync | tms-sync | P2 |

## Test Suite Recommendations

| Scope | Test Type | Priority | Tool |
|-------|-----------|----------|------|
| Auth flows | E2E | P0 | Playwright |
| API (CRUD) | Integration | P0 | Playwright API |
| RLS policies | Integration | P0 | Supabase tests |
| ATC editor | E2E | P0 | Playwright |
| Module tree | Component | P1 | Playwright |
| Full-text search | Integration | P1 | Playwright |
| OpenAPI spec | Unit (auto) | P1 | — |
| PAT middleware | Unit/Integration | P0 | Playwright |
