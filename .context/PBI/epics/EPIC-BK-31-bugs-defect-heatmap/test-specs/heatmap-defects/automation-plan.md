# Automation Plan — Heatmap/Defects Module (BK-40 + BK-42)

**Module**: Heatmap/Defects
**Scope**: Module-driven (29 Candidate tests)
**Fixture**: `{ api }` (pure API, no browser)

## Implementation Approach

### Phase 1: Types + Component (DefectsApi.ts)

1. Create `api/schemas/defects.types.ts` with:
   - `DefectPayload` (POST body)
   - `DefectResponse` (201 response)
   - `HeatmapResponse` (GET heatmap response)
   - `HeatmapModule` (individual module in heatmap)
   - `HeatmapWindow` (7d | 30d | 90d)

2. Create `tests/components/api/DefectsApi.ts` extending `ApiBase`:
   - Helper: `getHeatmap(projectId, window?)` — GET heatmap
   - Helper: `getDefectById(defectId)` — GET defect
   - ATC: `createRunLinkedDefect(payload, runStepId)` — BK-338
   - ATC: `saveRunLinkedDefect(payload, runStepId)` — BK-339
   - ATC: `saveStandaloneDefect(payload)` — BK-340
   - ATC: `rejectNonFailedStep(runStepId)` — BK-341
   - ATC: `rejectInvalidTitleLength(payload)` — BK-342
   - ATC: `rejectMissingModule(payload)` — BK-343
   - ATC: `rejectInvalidSeverity(payload)` — BK-344
   - ATC: `enforceEvidenceLimit(payload, evidenceCount)` — BK-345
   - ATC: `verifyTmsNativeDefect(defectId)` — BK-346
   - ATC: `getHeatmapDefaultWindow(projectId)` — BK-351
   - ATC: `getHeatmapWindowSwitch(projectId, window)` — BK-352
   - ATC: `hideArchivedModules(projectId)` — BK-353
   - ATC: `verifyUtcHalfOpen(projectId)` — BK-354
   - ATC: `verifyEndExcluded(projectId)` — BK-355
   - ATC: `verifyRisingTrend(projectId)` — BK-356
   - ATC: `verifyFallingTrend(projectId)` — BK-357
   - ATC: `verifyPrevZeroTrend(projectId)` — BK-358
   - ATC: `verifyBothZeroTrend(projectId)` — BK-359
   - ATC: `verifyCurrZeroTrend(projectId)` — BK-360
   - ATC: `verifyParentRollup(projectId)` — BK-361
   - ATC: `verifyChildOwnCell(projectId)` — BK-362
   - ATC: `verifyColorNotOnly(projectId)` — BK-363
   - ATC: `verifyTrendWordDelta(projectId)` — BK-364
   - ATC: `verifyFullPathDisambiguation(projectId)` — BK-365
   - ATC: `verifyFreshnessLive(projectId)` — BK-366
   - ATC: `verifyGeneratedAt(projectId)` — BK-367
   - ATC: `rejectUnauthenticated(projectId)` — BK-368
   - ATC: `rejectNonMemberAccess(projectId)` — BK-369
   - ATC: `rejectUnsupportedWindow(projectId)` — BK-370

3. Register `DefectsApi` in `tests/components/ApiFixture.ts`

### Phase 2: Test Files

Create test files under `tests/integration/heatmap-defects/`:

| File | Tests | ATCs |
|---|---|---|
| `defectFiling.test.ts` | 9 | BK-338–346 |
| `heatmapPositive.test.ts` | 5 | BK-351–355 |
| `heatmapTrend.test.ts` | 5 | BK-356–360 |
| `heatmapHierarchy.test.ts` | 2 | BK-361–362 |
| `heatmapVisual.test.ts` | 3 | BK-363–365 |
| `heatmapIntegration.test.ts` | 2 | BK-366–367 |
| `heatmapSecurity.test.ts` | 2 | BK-368–369 |
| `heatmapNegative.test.ts` | 1 | BK-370 |

### Phase 3: Verification

```bash
bun run test tests/integration/heatmap-defects/
bun run types:check
bun run lint:check
bun run kata:manifest
```

## Test Data Strategy

| Data | Strategy | Source |
|---|---|---|
| Projects | Discover | Staging DB (78 projects) |
| Modules | Discover | Staging DB (329 active modules) |
| Bugs | Discover + Modify | BK-34 QA Seed (9 bugs) |
| Run steps | Discover | Staging DB (run 866e6f5c, step 30fd6410) |
| Credentials | Discover | .env (STAGING_USER_*) |

## Risks

1. **Seed data cleanup**: 6 seed bugs from BK-40 cannot be deleted (no DELETE endpoint). Tests must use existing data, not create new bugs that pollute staging.
2. **Rate limiting**: 29 tests hitting same endpoints. May need to batch or add delays.
3. **Auth tokens**: Need valid auth token for each test. Use `api.login()` fixture.

## Verification Checklist

- [ ] All 29 ATCs pass `bun run test`
- [ ] `bun run types:check` clean
- [ ] `bun run lint:check` clean
- [ ] `kata-manifest.json` updated with new component
- [ ] No hardcoded credentials
- [ ] No relative imports
- [ ] All `@atc('BK-XXX')` IDs match Xray test keys
