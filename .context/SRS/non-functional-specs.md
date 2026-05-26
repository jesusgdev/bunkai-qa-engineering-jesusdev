# Non-Functional Specifications — Bunkai TMS

> Generated: 2026-05-25

## Performance

| ID | Requirement | Target | Current | Evidence |
|----|-------------|--------|---------|----------|
| NFR-01 | ATC table page load (SSR) | < 2s | Unknown | Next.js SSR depends on DB query speed |
| NFR-02 | Module tree render (nested) | < 500ms | Unknown | `buildModuleTree()` O(n) — linear |
| NFR-03 | API response (with auth) | < 500ms p95 | Unknown | Depends on Supabase latency + middleware chain |
| NFR-04 | Full-text search across project ATCs | < 1s | Unknown | GIN index on `tsv` column |
| NFR-05 | ATC save + re-render | < 2s | Unknown | Server Action + RPC round-trip |

### Bottlenecks (Known)

| Bottleneck | Impact | Mitigation |
|------------|--------|------------|
| N+1 module tree query | Repeated queries for nested modules | `buildModuleTree()` reads all at once, builds in memory |
| Vercel cold starts | First request after idle is slow | Vercel Pro/Enterprise edge improvements |
| Supabase connection pool | Concurrent request contention | Vercel edge functions use pooled connections |
| No caching layer | Every SSR request hits DB | Consider SWR/isr for read-heavy pages |

## Security

| ID | Requirement | Target | Current | Evidence |
|----|-------------|--------|---------|----------|
| NFR-06 | Auth secrets never exposed client-side | ✅ Complete | ✅ All keys in `.env.local` | `lib/env.ts` validates server-only |
| NFR-07 | PAT hash comparison constant-time | ✅ Complete | ✅ `crypto.timingSafeEqual` or equivalent | `lib/api/middleware/bearer.ts` comment |
| NFR-08 | RLS enforced on every table | ✅ Complete | ✅ All tables have RLS policies | `supabase/migrations/0005_rls_helpers.sql` |
| NFR-09 | Magic-link OTP expires | ✅ Complete | ✅ OTP expires in 1 hour (Supabase default) | Supabase Auth config |
| NFR-10 | Rate limiting on magic-link | ❌ Not implemented | N/A | No rate limit middleware detected |
| NFR-11 | Input validation on all API routes | ✅ Complete | ✅ Zod 4 validation | `app/api/v1/*/route.ts` |

## Reliability

| ID | Requirement | Target | Current | Evidence |
|----|-------------|--------|---------|----------|
| NFR-12 | Idempotency key support | ✅ Complete | ✅ | `lib/api/idempotency.ts` |
| NFR-13 | Graceful error handling | ✅ Complete | ✅ Structured error envelope | `lib/api/error-envelope.ts` |
| NFR-14 | Request logging | ✅ Complete | ✅ JSON structured logging | `lib/api/logging.ts` |
| NFR-15 | Request ID propagation | ✅ Complete | ✅ `x-request-id` header | `lib/api/request-id.ts` |
| NFR-16 | Uptime (Vercel SLA) | 99.99% | Not measured | Vercel Pro: 99.99% SLA |
| NFR-17 | Database backup strategy | Unknown | Unknown | No backup automation in repo |

## Scalability

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Concurrent users | Unknown (pre-launch) | 100 concurrent | No load testing |
| ATCs per project | Unknown | 50k/project | GIN index scales, but no pagination detected |
| Workspace members | Unknown | 500/workspace | RLS query uses `auth.uid()` — linear |
| API throughput | Unknown | 100 req/s | Vercel serverless scales horizontally |

### Scaling Constraints

| Constraint | Explanation | Workaround |
|------------|-------------|------------|
| PostgreSQL row limit | Free plan: 500MB/10k rows | Upgrade to Pro |
| Vercel serverless timeout | 10s (60s with Pro) | Ensure all queries < threshold |
| Supabase Auth rate limit | 30 req/hr per IP for magic-link | Rate limit on client side |

## Maintainability

| Aspect | Assessment | Evidence |
|--------|------------|----------|
| Code organization | Good — clear app/lib/components separation | Directory structure |
| Typing | Good — strict TypeScript, generated DB types | `tsconfig.json` strict: true |
| Migration strategy | Good — sequential Supabase migrations | `supabase/migrations/0001-0008.sql` |
| API versioning | Minimal — v1 namespace only | `app/api/v1/` |
| Documentation | Good — OpenAPI spec + code comments | `lib/openapi/registry.ts` |
| Test coverage | ❌ **None** — no test files found | `tests/` does not exist |

### Observability

| Tool | Status | Notes |
|------|--------|-------|
| Structured logging | ✅ | `lib/api/logging.ts` — JSON format |
| Request ID tracking | ✅ | `lib/api/request-id.ts` — `x-request-id` |
| Health check | ✅ | `GET /api/v1/health` |
| Error tracking | ❌ | No Sentry/LogRocket |
| APM | ❌ | No Vercel Analytics or DataDog |

## Compatibility

| Requirement | Target | Current |
|-------------|--------|---------|
| Browsers | Modern (Chrome, Firefox, Safari, Edge) | ✅ Next.js default |
| Mobile | Responsive layout | ❓ Not verified — sidebar may need mobile adaptation |
| API consumers | Any HTTP client, PAT auth | ✅ Standard bearer token |
| Jira sync | Jira Cloud via API | ✅ Scripts exist in package.json |
| Zod version | Zod 4 (alpha at time of writing) | ✅ `zod@4.0.0-alpha.*` |

## Quality Targets (Phase E)

These targets define when the system is ready for production:

| Metric | Target | Measurement | Current |
|--------|--------|-------------|---------|
| Page load | < 2s p95 | Lighthouse / Playwright trace | Unknown |
| API response | < 500ms p95 | Log analysis | Unknown |
| Auth availability | 99.9% | Uptime monitoring | Unknown |
| RLS coverage | 100% of data tables | Migration audit | ✅ 8/8 tables |
| Test coverage | 80% core modules | Coverage report | 0% |
| Error rate | < 1% of API requests | Log analysis | Unknown |
| Vulnerability scan | 0 critical/high | npm audit + Dependabot | Unknown |

## DevEx

| Aspect | Assessment |
|--------|------------|
| Local setup | ✅ Documented in README — `bun install`, `bun run dev` |
| DB sync | ✅ `bun run db:sync` updates local Supabase |
| API sync | ✅ `bun run api:sync` regenerates types |
| Type generation | ✅ `supabase gen types` outputs to `lib/types/supabase.ts` |
| Pre-commit checks | ✅ Husky: lint-staged + type-check + vars-check |
| Hot reload | ✅ Next.js hot module replacement |

## Risk Register (NFR)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cold-start latency on serverless functions | High | Medium | Keep warming via cron |
| Supabase connection pool exhaustion | Low | High | Monitor pool, upgrade plan if needed |
| No rate limiting on auth | Medium | High | Add rate-limit middleware (CloudFlare or in-app) |
| PostgreSQL string parsing (Zod 4 alpha breaking changes) | Medium | Medium | Pin Zod version in lockfile |
| Vercel build timeout | Low | Low | Optimize bundle size, disable unused imports |
