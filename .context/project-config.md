# Project Configuration

> Project: Bunkai TMS
> Generated: 2026-05-25

## Repositories

| Repository | URL | Branch | Purpose |
|------------|-----|--------|---------|
| bunkai-qa-engineering | `../../bunkai-qa-engineering-jesusdev` | main | QA engineering boilerplate (Playwright + KATA + Allure) |
| upex-bunkai-tms | `https://github.com/upex-galaxy/upex-bunkai-tms.git` | main | Bunkai TMS application (Next.js + Supabase) |

## Tech Stack

### Frontend
- Framework: Next.js 15.5 (App Router)
- Language: TypeScript 5.9
- Styling: Tailwind CSS + CSS variables (custom design tokens)
- UI Library: shadcn/ui (New York style) with Radix primitives + Lucide icons
- Fonts: Inter, JetBrains Mono, Noto Serif JP
- State: React Context (auth context)
- Data fetching: Supabase SSR client (direct DB calls, no ORM abstraction layer beyond Supabase client)

### Backend
- Runtime: Next.js API routes (serverless)
- Language: TypeScript
- Framework: Next.js 15.5 Route Handlers
- Validation: Zod 4
- API pattern: `withApiHandler` wrapper (request-id, structured logging, error mapping)
- Auth: Supabase Auth (magic-link OTP), PAT (personal access tokens) for CLI/agent auth
- Database: Supabase PostgreSQL

### Database
- Type: PostgreSQL
- Provider: Supabase
- ORM: Supabase JS client (raw SQL through generated types)
- Migrations: SQL migration files in `supabase/migrations/`
- Schema: 8 migration files covering 10 tables + RLS policies + helper functions

### Infrastructure
- Cloud: Vercel
- CI/CD: Husky pre-commit + pre-push hooks (no GitHub Actions)
- Monitoring: Not configured (Discovery Gap)
- Email: Resend (for magic-link OTP)

## Environments

| Environment | URL | Purpose | Access |
|-------------|-----|---------|--------|
| Local | http://localhost:3000 | Development | Direct |
| Staging | https://staging-upexbunkai.vercel.app | Pre-prod testing | Via Vercel |
| Production | https://upexbunkai.vercel.app | Live | Read-only |

## Key dependencies (from bun.lock)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.5.18 | Framework |
| react / react-dom | 19.2.6 | UI runtime |
| zod | 4.4.3 | Validation |
| @supabase/ssr | latest | Server-side Supabase auth |
| @supabase/supabase-js | latest | Database client |
| tailwindcss | ^4 | Styling |
| shadcn/ui | latest | Component primitives |
| @monaco-editor/react | 4.7.0 | Code editor component |

## Tools and Access

- Issue tracker: Jira Cloud — resolved via `/acli`
- Project key: BK
- Database: Supabase PostgreSQL — resolved via DBHub MCP
- Email: Resend — transaction emails
- Auth: Supabase Auth (magic-link + PAT)

## Access Checklist

- [x] Repository read access
- [ ] Database access (MCP or direct)
- [x] Issue tracker access (Jira, user's Atlassian account)
- [x] Staging environment reachable (configured in `.agents/project.yaml`)
- [ ] CI/CD visibility (no GitHub Actions configured)

## Discovery Gaps

- [ ] Vercel deployment configuration details (vercel.json not found in repo — may be configured at Vercel dashboard level)
- [ ] Monitoring/observability stack — no Sentry, DataDog, or APM detected
- [ ] Staging/production Supabase database access credentials
- [ ] Team contacts and stakeholder list
- [ ] CI/CD pipeline details — no GitHub Actions workflows found
- [ ] Resend API configuration for email sending
