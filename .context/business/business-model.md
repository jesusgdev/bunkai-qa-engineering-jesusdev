# Business Model — Bunkai TMS

> Confidence: High (discovered from source code + schema)
> Generated: 2026-05-25

## Problem Statement

Software teams struggle to maintain structured, traceable test cases that link back to acceptance criteria. Traditional test management tools either lack tight integration with development workflows or impose heavy process overhead. Bunkai TMS solves this with a multi-tenant platform centered around ATCs (Atomic Test Components) — composable, anchored test cases that are always linked to their originating acceptance criteria.

Found in: README ("Open-core Test Management System — ATCs, Atomic Test Components, modular tests, full traceability"), DB schema (`atc_acceptance_criteria` M:N join table enforces traceability), app UI ("ATC anchoring" component).

## Business Model Canvas

| Block | Evidence | Confidence |
|-------|----------|------------|
| **Customer Segments** | QA engineers (primary), QA automation engineers, software developers, test managers. Found in: RBAC roles (`viewer/member/admin/owner`) define workspace membership; ATC layer types (`UI/API/Unit`) serve different testing audiences. | High |
| **Value Propositions** | 1. ATC anchoring — every ATC must link to ≥1 acceptance criterion (enforced by DB schema). 2. Multi-tenant with built-in RBAC. 3. Jira-native integration (synced issues, fields, workflows). 4. CLI/AI-agent auth via PATs. | High |
| **Channels** | Web application (Next.js SSR), API (REST with OpenAPI docs at `/api/openapi`), CLI via PAT-based auth for AI agents. | High |
| **Customer Relationships** | Self-service (workspace onboarding flow), automated (magic-link auth, RLS-based access control). | Medium |
| **Revenue Streams** | Open-core model: `community` (free), `cloud` (SaaS), `enterprise` (self-hosted/licensed). Found in: `WorkspacePlan` type = `'community' \| 'cloud' \| 'enterprise'`. | Medium — pricing details unknown |
| **Key Resources** | Next.js/Supabase infrastructure, PostgreSQL (RLS per workspace), Jira API integration. | High |
| **Key Activities** | ATC management (CRUD), workspace/project/module hierarchy management, Jira issue sync, OpenAPI spec generation, magic-link auth flow. Found in: all API route handlers, server actions, migration files. | High |
| **Key Partners** | Supabase (database + auth), Vercel (hosting), Resend (transactional email), Jira/Atlassian (issue tracking integration). Found in: package.json (Supabase deps), `.env.example` (Resend, Supabase, Atlassian vars). | High |
| **Cost Structure** | Vercel serverless compute + Supabase database (scales per workspace), Resend email credits. Unknown: exact pricing tiers. | Low — not verifiable from code |

## QA Relevance

| Business Aspect | Testing Implication |
|-----------------|-------------------|
| ATC anchoring (M:N AC↔ATC) | Validate that every ATC links to ≥1 AC; test deletion cascades |
| Multi-tenant RBAC | Test all 4 roles (viewer/member/admin/owner) across all CRUD operations |
| Magic-link auth | Test OTP generation, email delivery, expiry, session refresh |
| PAT auth (CLI/agents) | Test token create/list/revoke lifecycle; test `bk_pat_` prefix convention |
| Open-core plans (`community`/`cloud`/`enterprise`) | Test plan-based feature gating if implemented |
| Jira sync | Test bidirectional link between BK issues and Jira issues |

## Discovery Gaps

- [ ] Revenue model details: pricing, billing integration (Stripe?), free tier limits
- [ ] User acquisition channels (paid, organic, partner?)
- [ ] Competitors and market positioning
- [ ] Exact number of active workspaces/users
- [ ] SLA and uptime commitments
- [ ] Feature gating per plan (what's restricted to cloud/enterprise)
- [ ] API rate limiting policy for PAT-based auth

## Sources Used

| Claim | Source |
|-------|--------|
| Open-core TMS | README.md — terminology |
| Multi-tenant model | `workspaces` + `workspace_members` tables in migration 0001 |
| RBAC roles | `MemberRole` type = viewer/member/admin/owner in `lib/types.ts` |
| Plans | `WorkspacePlan` type = community/cloud/enterprise in `lib/types.ts` |
| ATC anchoring | `atc_acceptance_criteria` join table in migration 0004 |
| Magic-link auth | `app/auth/callback/route.ts` + `app/(auth)/login/page.tsx` |
| PAT auth | `access_tokens` table in migration 0008 + `lib/api/middleware/bearer.ts` |
| Jira integration | `jira:sync-*` scripts in `package.json` |
| Email provider | Resend via `.env.example` (`RESEND_API_KEY`) |
| Hosting | Vercel via `next.config.ts` (outputFileTracingRoot) + staging domain in `.agents/project.yaml` |
