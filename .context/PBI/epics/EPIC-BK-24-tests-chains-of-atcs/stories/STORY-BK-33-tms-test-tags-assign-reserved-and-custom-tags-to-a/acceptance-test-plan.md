# Acceptance Test Plan (ATP) — BK-33 Test Tags

**Story**: [BK-33](https://jira.upexgalaxy.com/browse/BK-33) — TMS-Test Tags | Assign reserved and custom tags to a test
**Epic**: BK-24 (Tests (chains of ATCs))
**Status**: Ready For QA
**TMS Modality**: jira-native (ATP published as fallback comment)
**Pre-flight Verdict**: GO (14/14 TCs SYNCED)
**Risk Score**: Medium (27/125 — complexity 3/5, uncertainty 3/5, blast radius 3/5)

## Summary

BK-33 refines Test tagging for the Test Repository. The story lets QA users assign, replace, clear, and filter Tests by reserved and custom tags while preserving data integrity under concurrent edits.

Coverage: 14 Gherkin scenarios (4 happy, 5 negative, 3 boundary, 2 integration).

## API Surface (from code exploration)

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/tests/{id}/tags` | PUT | Replace full tag set (body: `{ tags: string[] }`, header: `X-If-Match: <version>`) | `atc:write` |
| `/api/v1/tests?tag=<tag>` | GET | Filter Tests by single tag (workspace-scoped) | `atc:read` |

## DB Schema (verified via DBHub)

| Column | Type | Notes |
|---|---|---|
| `tests.tags` | ARRAY | Stores tag values |
| `tests.version` | integer | Optimistic locking |
| `tests.workspace_id` | uuid | Workspace isolation (RLS) |

## Test Outlines

### GROUP: Happy Path

- **TC-1: [Positive] Assign reserved tags to a Test** — Given Test has no tags, When PUT tags=["smoke","regression"], Then Test saved with tags + appears in filter results
- **TC-2: [Positive] Assign custom tags alongside reserved tags** — Given Test has tag "smoke", When PUT tags=["smoke","checkout","mobile"], Then Test saved with all 3 tags
- **TC-3: [Positive] Replace the full tag set on a Test** — Given Test has tags ["smoke","checkout"], When PUT tags=["sanity","billing"], Then old tags removed, new tags saved
- **TC-4: [Positive] Remove all tags from a Test** — Given Test has tags, When PUT tags=[], Then Test has no tags + not in filtered results

### GROUP: Negative

- **TC-5: [Negative] Reject a custom tag longer than 50 characters** — When PUT with tag >50 chars, Then 422 validation_failed + existing tags unchanged
- **TC-6: [Negative] Reject a tag containing a comma** — When PUT with "smoke,critical", Then 422 + existing tags unchanged
- **TC-7: [Negative] Reject more than 20 tags** — When PUT with 21 tags, Then 422 + existing tags unchanged
- **TC-8: [Negative] Reject stale concurrent tag updates** — Given 2 users same version, User A saves first, When User B saves with stale version, Then 409 conflict + User A's tags preserved
- **TC-9: [Negative] Reject tag updates for a Test the user cannot edit** — When read-only user PUTs, Then 403 forbidden + tags unchanged

### GROUP: Boundary and Normalization

- **TC-10: [Boundary] Normalize reserved tag casing** — When PUT with ["SMOKE","Sanity"], Then saved as ["smoke","sanity"]
- **TC-11: [Boundary] Trim whitespace and deduplicate tags** — When PUT with [" smoke ","smoke"," checkout "], Then saved as ["smoke","checkout"]
- **TC-12: [Boundary] Preserve valid custom tag casing after trimming** — When PUT with [" Mobile-P1 "], Then saved as ["Mobile-P1"]

### GROUP: Integration

- **TC-13: [Integration] Tag filtering returns only matching Tests** — Given 3 Tests with different tags, When GET ?tag=smoke, Then only matching Tests returned + no cross-workspace leak
- **TC-14: [Integration] Tag updates refresh search and suite grouping** — Given Test in smoke suite, When replace with regression, Then removed from smoke filter + appears in regression filter

## Traceability

| AC | TCs |
|---|---|
| AC-1 reserved tags | TC-1, TC-10, TC-13, TC-14 |
| AC-2 custom tags | TC-2, TC-12, TC-13 |
| AC-3 remove all tags | TC-4 |
| AC-4 case-insensitive reserved | TC-10 |
| AC-5 invalid formats | TC-5, TC-6, TC-7 |
| AC-6 duplicate prevention | TC-11 |
| AC-7 filter by tag | TC-1, TC-2, TC-3, TC-4, TC-13, TC-14 |
| AC-8 concurrent updates | TC-8 |
| Permissions + workspace isolation | TC-9, TC-13 |

## Technical Decisions

- **Smoke subset** (time-constrained): TC-1, TC-3, TC-5, TC-13 (core happy + replacement + validation + filtering)
- **Trifuerza surfaces**: API (all 14 TCs), DB (TC-8 version conflict, TC-13 workspace isolation, TC-10/11/12 normalization verification), UI (tag chip editing — exploratory only)
- **Test data**: use existing Tests in staging DB (c79ca50b-... "Add to Cart", 8b188fc8-... "Agent Retry Test")
