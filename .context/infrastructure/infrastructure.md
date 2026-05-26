# Infrastructure — Bunkai TMS

> Generated: 2026-05-25

## Environment Architecture

### Environment Diagram

```mermaid
flowchart TD
  subgraph Local
    A[Bun + Next.js dev server] --> B[Local Supabase\n(supabase start)]
    B --> C[(Local PostgreSQL)]
  end

  subgraph Staging (default)
    D[Vercel Preview] --> E[Supabase Staging\n(project)]
    E --> F[(Staging DB)]
  end

  subgraph Production
    G[Vercel Production] --> H[Supabase Production\n(project)]
    H --> I[(Production DB)]
  end

  subgraph External
    J[Resend API] --> K[Email delivery]
    L[Jira Cloud API]
  end

  A --> J
  D --> J
  D --> L
  G --> J
  G --> L
```

### Auth Flow Across Environments

| Environment | Auth Provider | Email Backend | Session Storage |
|-------------|--------------|---------------|-----------------|
| Local | Supabase local (GoTrue) | Log output / Resend | Local cookies |
| Staging | Supabase staging | Resend | HTTP cookies |
| Production | Supabase production | Resend | HTTP cookies |

### Environment Configuration

| Var | Local | Staging | Production |
|-----|-------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://localhost:54321` | Supabase staging URL | Supabase prod URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local anon key | Staging anon key | Prod anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Local service key | Staging service key | Prod service key |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:54322/postgres` | Supabase connection string | Supabase connection string |
| `RESEND_API_KEY` | Same/fake | staging key | production key |

Managed in `.env.local` for local. Vercel env vars for staging/production.

## CI/CD Pipeline

### Current State

```
Local commit → Husky hooks → Vercel auto-deploy
                    ↓
             format:check
             lint:check
             types:check
             vars:check
```

### Gaps

| Feature | Status | Need |
|---------|--------|------|
| GitHub Actions | ❌ Not configured | Test execution, lint, type check on PR |
| Test execution | ❌ No tests exist | Playwright E2E, API tests |
| Preview deploys | ✅ Vercel (auto) | Works but no test gate |
| Regression suite | ❌ Not configured | Nightly regression |

## Database

### Migration Pipeline

```
supabase/migrations/
         ↓
bun run db:sync  (applies to local Supabase)
         ↓
Manual: apply to staging via Supabase dashboard or CLI
         ↓
Manual: apply to production via Supabase dashboard or CLI
```

**No automated migration pipeline.** Migrations are SQL files that must be applied manually.

### Backup Strategy

Not documented in repo. Supabase provides:
- Point-in-time recovery (Pro plan)
- Database exports via Dashboard
- Schema-only exports via `supabase db dump`

## Monitoring

| Tool | Status | Notes |
|------|--------|-------|
| Vercel Analytics | ❌ Not detected | Speed Insights, Web Vitals |
| Sentry | ❌ Not detected | Error tracking |
| Logging (app) | ✅ | `lib/api/logging.ts` — JSON structured |
| Health endpoint | ✅ | `GET /api/v1/health` |
| Performance monitoring | ❌ | No Lighthouse CI, no APM |

## Security

### Secrets Management

| Method | Coverage | Risk |
|--------|----------|------|
| `.env.local` (gitignored) | All secrets | Local-only; not shared |
| Vercel env vars | Staging + production | Managed via Vercel dashboard |
| `lib/env.ts` server validation | Server-side validation of env vars | Zod schema ensures all required vars present |

### Network Security

| Aspect | Status |
|--------|--------|
| HTTPS | ✅ Vercel (default) |
| CORS | Not explicitly configured (Next.js default) |
| CSP headers | Not detected |
| Rate limiting | ❌ Not implemented |
| DDoS protection | ✅ Vercel Edge Network |

## Build & Deploy

### Build Process

1. `bun install` — install dependencies from `bun.lock`
2. `next build` — Next.js production build (type check + bundling)
3. `next start` or deployed to Vercel

### Local Development

```bash
bun install
bun run dev          # Next.js dev server (HMR)
bun run db:sync      # Sync Supabase migration
bun run api:sync     # Generate types from OpenAPI
```

## Performance

### Current Baseline

| Metric | Measurement | Tool |
|--------|-------------|------|
| Time to First Byte | Unknown | — |
| Largest Contentful Paint | Unknown | — |
| First Input Delay | Unknown | — |
| Bundle size | Unknown | — |

### Known Performance Factors

| Factor | Impact | Notes |
|--------|--------|-------|
| Vercel cold starts | High | Serverless functions spin down |
| Supabase connection pool | Medium | Concurrent requests share pool |
| SSR queries | Medium | Every page load hits DB |
| Module tree rebuild | Low | O(n), in-memory |

## Scalability

### Current Limits

| Dimension | Limit | Source |
|-----------|-------|--------|
| Supabase Free plan | 500MB DB, 10k rows, 2GB bandwidth | Supabase pricing |
| Vercel Free plan | 100GB bandwidth, 6000 build mins | Vercel pricing |
| Magic-link rate limit | 30 req/hr per IP | Supabase Auth default |

### Upgrade Path

| Trigger | Action |
|---------|--------|
| >10k ATCs | Upgrade Supabase to Pro ($25/mo) |
| >100 users | Consider Vercel Pro ($20/mo) |
| API rate limiting needed | Add rate limit middleware or CloudFlare |
| Need test execution | Add GitHub Actions (free for public repos) |
