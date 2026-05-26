# Executive Summary — Bunkai TMS

> Generated: 2026-05-25

## Problem Statement

Software QA teams struggle with test cases that are unstructured, untraceable, and disconnected from requirements. Traditional test management tools either impose heavy process overhead (HP ALM, TestRail) or lack traceability features (spreadsheets, Confluence pages). The result: QA engineers cannot prove which acceptance criteria a test covers, regression analysis is manual, and AI/agentic test execution has no structured data to consume.

Bunkai TMS solves this with **ATC anchoring** — every Atomic Test Component (ATC) is structurally linked to ≥1 acceptance criterion. This creates a fully traceable chain: User Story → Acceptance Criteria → ATC → Steps + Assertions. The system is built for three execution modes (manual, agentic, CI) from day one.

Found in: Login page feature ticks ("ATC — Acceptance Test Case — one observable behaviour, executable by humans or agents"), `0004_atcs.sql` (M:N join table enforces traceability), `metadata.description` ("ATCs, modular tests, full traceability").

## Solution Overview

### Product Vision
An open-core test management system where every test case is atomic, composable, and traceable back to its originating acceptance criterion — consumable by humans, AI agents, and CI pipelines alike.

### Core Capabilities

| # | Feature | Problem Addressed | Evidence |
|---|---------|-------------------|----------|
| 1 | ATC CRUD | No structured, reusable test cases | `atcs` table + `bunkai_save_atc` RPC + editor components |
| 2 | ATC Anchoring (M:N ATC↔AC) | Tests disconnected from requirements | `atc_acceptance_criteria` join table + anchoring panel component |
| 3 | Modular Module Tree | Flat, unorganized test suites | Self-referential `modules` tree (depth ≤ 6) + sidebar explorer |
| 4 | Multi-tenant RBAC | No per-workspace access control | `workspace_members` with viewer/member/admin/owner roles |
| 5 | Jira Integration | Manual issue synchronization | `jira:sync-*` scripts in `package.json` |
| 6 | PAT Auth for CLI/Agents | No API access for automation | `access_tokens` table + bearer middleware |
| 7 | OpenAPI Spec | No documented API surface | Auto-generated spec at `/api/openapi` + Scalar docs UI |
| 8 | Magic-link Auth | Simple, secure authentication | Supabase magic-link OTP flow |

Found in: `0001-0008` migrations, `app/(app)/projects/[projectSlug]/page.tsx` (project dashboard), `components/atcs/` (ATC editor suite), `lib/api/middleware/bearer.ts`.

### Key Differentiators
- **ATC anchoring moat**: every ATC structurally linked to its acceptance criteria (M:N join table, not a text field)
- **Agent-native**: PAT-based bearer auth designed for AI-agent and CLI execution, not just humans
- **Three execution modes**: manual · agentic · CI — same schema, same reports
- **Open-core**: Apache-2.0 licensed, self-hostable with `docker compose`, cloud option available

## Success Metrics

### Tracked Metrics
| Metric | Type | Implementation | Source |
|--------|------|----------------|--------|
| — | — | No analytics SDK detected in the codebase | — |

### Inferred KPIs
| KPI | How Bunkai Supports It |
|-----|----------------------|
| ATCs per project | Count of `atcs` rows (table tracks) |
| ATCs linked to ACs | Ratio via `atc_acceptance_criteria` join |
| Test pass rate | `atcs.status` aggregation |
| Module coverage | ATCs per module distribution |
| Active workspaces | `workspaces` table count |

### Unknown Metrics
| Gap | Impact |
|-----|--------|
| No analytics framework installed | Cannot measure user engagement, feature adoption |
| No performance monitoring | No visibility into response times or error rates |
| No business metrics | No tracking of workspace creation, project creation, user retention |

## Target Users

| Role | System Role | Need | Evidence |
|------|-------------|------|----------|
| QA Engineer | member/admin | Author structured test cases traceable to requirements | ATC editor + anchoring panel + module tree |
| QA Automation Engineer | member/admin | Consume tests programmatically, integrate with CI | PAT auth + OpenAPI spec |
| QA Lead / Test Manager | admin/owner | Oversee test coverage across projects, manage team | RBAC + workspace admin |
| Developer | viewer/member | View test coverage for stories they implement | Sidebar explorer + ATC table |

Found in: `MemberRole` type, RLS policies dividing read vs write permissions, sidebar/ATC-table UI accessible without admin privileges.

## Product Scope

### What's Included (Current — Phase E Bootstrap)
- Magic-link authentication with Supabase
- Workspace creation via onboarding flow
- Project creation (DB schema exists, UI placeholder)
- Module tree management (create/edit via DB)
- User story management with external Jira linking
- Acceptance criteria management
- Full ATC CRUD with atomic save (steps + assertions + AC linking)
- PAT-based bearer auth for CLI/agent execution
- OpenAPI spec generation from route annotations
- ATC search via full-text search (tsvector + GIN index)

### What's Not Included (Known Gaps)
- OAuth login (GitHub, Google — UI disabled, "ships next sprint")
- Project creation UI (placeholder only, "ships in Phase E")
- Multi-workspace navigator (placeholder, "Phase E")
- Test execution engine (schema supports statuses, no runner)
- CI integration (no GitHub Actions workflows)
- Analytics/telemetry
- Docker compose production deployment
- Email sending integration (magic-link infra needs Resend setup)

### Future Indicators
- Login page: "OAuth ships next sprint"
- Projects index: "Project creation UI ships in Phase E"
- Phase E commits in git history showing staged completion
- `docker compose` reference in login page footer

## Discovery Gaps

| Gap | Impact | Suggested Source |
|-----|--------|------------------|
| No analytics/metrics | Cannot measure product adoption or user behavior | Add PostHog or Plausible |
| No test execution engine | ATCs are authored but cannot be executed | TBD — separate runner service |
| No CI/CD beyond pre-commit | No automated quality gates before deploy | Add GitHub Actions |
| No email sending configured | Magic-link auth will fail at runtime | Configure Resend API key in `.env` |
| No Sentry/APM | Silent failures in production | Add Sentry error tracking |

## QA Relevance

### Critical Testing Areas
| Area | Why | Priority |
|------|-----|----------|
| Auth flow (magic-link) | Gate to entire application | P0 |
| ATC CRUD + anchoring | Core value proposition | P0 |
| RBAC permissions | Data isolation across workspaces | P0 |
| PAT lifecycle (create/list/revoke/validate) | Security boundary for API access | P1 |

### Risk Areas
| Risk | Impact |
|------|--------|
| No email sending configured | Auth flow completely blocked |
| No test execution engine | Cannot validate ATC correctness |
| No CI pipeline | No regression safety net |
| Single-workspace MVP assumption | May require re-architecture for multi-workspace |

## Document References

| Document | Status |
|----------|--------|
| User Personas | Generated |
| User Journeys | Generated |
| Architecture Spec | Generated |
| Functional Specs | Generated |
| Non-Functional Specs | Generated |
| Business Data Map | Pending |
| Business Feature Map | Pending (post-discovery) |
| Business API Map | Pending (post-discovery) |
