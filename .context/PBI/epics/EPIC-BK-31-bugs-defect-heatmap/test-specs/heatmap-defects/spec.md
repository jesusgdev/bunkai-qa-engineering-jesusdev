# Spec — Heatmap/Defects Module (BK-40 + BK-42)

**Module**: Heatmap/Defects
**Epic**: BK-31 (Bugs/Defect Heatmap)
**Stories**: BK-40 (Defect Filing), BK-42 (Heatmap)
**Modality**: jira-xray (API-only, Cucumber tests)
**Fixture**: `{ api }` (no browser needed)

## API Surface

### BK-40 — Defect Filing

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/bugs` | POST | Create defect (standalone) | `atc:write` |
| `/api/v1/projects/{id}/bugs` | POST | Create defect in project | `atc:write` |
| `/api/v1/runs/{id}/steps/{stepId}/defect` | POST | Create run-linked defect | `atc:write` |

**Request Body (POST /api/v1/bugs)**:
```json
{
  "title": "string (5-200 chars)",
  "description": "string (optional)",
  "severity": "P1|P2|P3|P4",
  "module_id": "uuid",
  "project_id": "uuid",
  "run_step_id": "uuid (optional, for run-linked)",
  "evidence": ["url1", "url2"] // max 10
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "title": "string",
  "severity": "P1",
  "status": "open",
  "module_id": "uuid",
  "project_id": "uuid",
  "created_at": "timestamp"
}
```

**Error Responses**:
- 401: Unauthorized (no auth header)
- 403: Forbidden (viewer role)
- 422: Validation failed (title length, invalid severity, missing module, cross-project module)

### BK-42 — Heatmap

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/projects/{id}/bugs/heatmap` | GET | Get defect heatmap data | `atc:read` |

**Query Params**:
- `window`: `7d|30d|90d` (default `30d`)

**Response (200)**:
```json
{
  "modules": [
    {
      "module_id": "uuid",
      "module_path": "string",
      "count": 5,
      "trend": "rising|falling|flat",
      "trend_pct": 20.5 | null,
      "heat_tier": "clean|low|elevated|hotspot"
    }
  ],
  "generated_at": "timestamp"
}
```

**Error Responses**:
- 401: Unauthorized
- 404: Not found (project access denied)
- 400: Bad request (unsupported window)

## Test Data

| Data | Available? | Source |
|---|---|---|
| Seed bugs (6) | Yes | BK-34 QA Seed project (d75e73ac) |
| Active modules (329) | Yes | Staging DB |
| Projects (78) | Yes | Staging DB |
| Staging credentials | Yes | .env (STAGING_USER_EMAIL, STAGING_USER_PASSWORD) |

## Components to Create

| Component | File | Layer | Purpose |
|---|---|---|---|
| `DefectsApi` | `tests/components/api/DefectsApi.ts` | L3 | Defect CRUD + heatmap |
| `defects.types.ts` | `api/schemas/defects.types.ts` | L1 | OpenAPI type facades |

## ATC Mapping (29 tests)

### BK-40 — Defect Filing (9 tests)

| ATC ID | Method | Description |
|---|---|---|
| BK-338 | `createRunLinkedDefect` | Happy path: run-linked form prefill |
| BK-339 | `saveRunLinkedDefect` | Happy path: save run-linked defect |
| BK-340 | `saveStandaloneDefect` | Happy path: save standalone defect |
| BK-341 | `rejectNonFailedStep` | Negative: non-failed step action |
| BK-342 | `rejectInvalidTitleLength` | Negative: invalid title length |
| BK-343 | `rejectMissingModule` | Negative: missing/cross-project module |
| BK-344 | `rejectInvalidSeverity` | Negative: invalid severity |
| BK-345 | `enforceEvidenceLimit` | Boundary: evidence link limit (10 max) |
| BK-346 | `verifyTmsNativeDefect` | Integration: no Jira sync |

### BK-42 — Heatmap (20 tests)

| ATC ID | Method | Description |
|---|---|---|
| BK-351 | `getHeatmapDefaultWindow` | Positive: default 30d window |
| BK-352 | `getHeatmapWindowSwitch` | Positive: 7d/30d/90d switch |
| BK-353 | `hideArchivedModules` | Boundary: archived modules hidden |
| BK-354 | `verifyUtcHalfOpen` | Boundary: UTC start included |
| BK-355 | `verifyEndExcluded` | Boundary: end boundary excluded |
| BK-356 | `verifyRisingTrend` | Trend: rising + positive percent |
| BK-357 | `verifyFallingTrend` | Trend: falling + negative percent |
| BK-358 | `verifyPrevZeroTrend` | Trend: prev 0 / curr > 0 |
| BK-359 | `verifyBothZeroTrend` | Trend: 0/0 flat |
| BK-360 | `verifyCurrZeroTrend` | Trend: curr 0 / prev > 0 |
| BK-361 | `verifyParentRollup` | Hierarchy: parent rollup via path-prefix |
| BK-362 | `verifyChildOwnCell` | Hierarchy: child keeps own cell |
| BK-363 | `verifyColorNotOnly` | Visual: hotspot not color-only |
| BK-364 | `verifyTrendWordDelta` | Visual: trend as word + delta |
| BK-365 | `verifyFullPathDisambiguation` | Visual: full module_path |
| BK-366 | `verifyFreshnessLive` | Integration: live RPC, no MV |
| BK-367 | `verifyGeneratedAt` | Integration: generated_at returned |
| BK-368 | `rejectUnauthenticated` | Security: 401 |
| BK-369 | `rejectNonMemberAccess` | Security: 404 |
| BK-370 | `rejectUnsupportedWindow` | Negative: 400 bad_request |
