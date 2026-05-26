# Risk Assessment — Bunkai TMS

> Generated: 2026-05-25
> Source: Phase 1 Project Assessment

## Risks

| # | Risk | Severity | Description | Impact | Recommendation | Owner |
|---|------|----------|-------------|--------|----------------|-------|
| R1 | No automated tests | HIGH | Zero test files found in the entire codebase. No unit, integration, or E2E tests exist. Every deployment is untested. | Bugs reach production undetected; regression risk is high for every change. | Implement test-automation pipeline after discovery: unit tests for services, integration for API routes, E2E for critical flows (auth, project creation, ATC CRUD). | TBD |
| R2 | No CI/CD pipeline | MEDIUM | No GitHub Actions or other CI server configured. Only Husky pre-commit hooks enforce code quality. | Code quality checks only run on the committer's machine; no shared gate before staging/production deploy. | Configure GitHub Actions to run lint, type-check, and (once written) tests on every PR and push to main/staging. | TBD |
| R3 | No monitoring / observability | MEDIUM | No Sentry, DataDog, or APM configured. Application errors are invisible unless a user reports them. | Silent failures in production; no crash reporting; no performance visibility. | Integrate Sentry for error tracking; add Vercel Analytics for Web Vitals. | TBD |
| R4 | No .env file committed | LOW | `.env` is gitignored; only `.env.example` exists. New contributors must manually create their `.env`. | Setup friction for new developers; risk of missing a required env var. | Document `cp .env.example .env` in setup guide; add `env:check` to installer. | TBD |
