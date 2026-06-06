# As a QA Engineer I want to reorder the ATCs inside an existing Test so that I can fix the sequence after seeing it does not match the User Story flow

**Jira Key:** [BK-28](https://upexgalaxy67.atlassian.net/browse/BK-28)
**Epic:** [BK-24](https://upexgalaxy67.atlassian.net/browse/BK-24) (Tests (chains of ATCs))
**Priority:** Medium
**Story Points:** 1
**Status:** Shift-Left QA

---

## User Story

***Source spec:*** BK-016

## User story

***As a*** QA Engineer (Elena persona)
***I want to*** reorder the ATCs inside an existing Test
***So that*** I can fix the execution sequence after discovering the original order does not match the User Story flow I am verifying

## Definition of done

- [ ] Functionality available behind the workspace's role permissions (member and above can reorder; viewer cannot)
- [ ] New order is visible immediately after saving and persists across page reloads
- [ ] Activity log records who reordered the Test, when, and what the new chain looks like
- [ ] The same reorder operation works whether triggered from the UI or from an AI agent / CI client using the Bunkai surface
- [ ] Acceptance criteria validated end-to-end against staging
- [ ] No P0 / P1 bugs open against this story

---

## Acceptance Criteria

```gherkin
Feature: Reorder the ATCs inside an existing Test

  Scenario: Elena drags an ATC into a new position and saves
    Given Elena has an existing Test "Add to Cart from Empty State" containing four ATCs in the order A, B, C, D
    When she opens the Test, drags ATC D to the second position so the chain becomes A, D, B, C, and clicks "Save"
    Then the Test is updated and the chain is now A, D, B, C
    And when she or any teammate reopens the Test, the chain still shows A, D, B, C
    And the activity log of her workspace records that Elena reordered this Test, with a timestamp and the new chain

  Scenario: Saving without changing the order is a no-op
    Given Elena has an existing Test containing ATCs A, B, C in that order
    When she opens the Test, drags an ATC and drops it back in its original slot, then clicks "Save"
    Then the system recognizes there is no change and does NOT record a new reorder entry in the activity log
    And the Test's last-modified timestamp does not change

  Scenario: A viewer cannot reorder a Test
    Given Pablo is signed in to the same workspace as Elena but with role "viewer"
    When he opens the same Test
    Then the reorder controls are not available to him (drag handles are absent or visibly disabled)
    And any attempt to invoke the reorder action through any other client is rejected with a clear permission message

  Scenario: Two teammates reorder the same Test at the same time
    Given Elena and her teammate Mateo are both viewing Test "Add to Cart from Empty State" at the same moment, both seeing the chain A, B, C
    And Mateo reorders the chain to C, B, A and saves first
    When Elena now tries to save her own reorder to B, A, C, which was based on the stale A, B, C view
    Then the system blocks Elena's save and shows a clear message that the Test was changed by someone else, with the current order C, B, A
    And Elena can review the new chain and decide whether to start over or keep Mateo's version
```

---

## QA Refinements (Shift-Left Analysis)

> Added 2026-06-04 by Shift-Left QA. Full ATP DRAFT lives in custom field 🧪 Acceptance Test Plan (ATP) and mirrored as a comment on this issue. This section captures the slices PO + Dev need before estimation.

### Refined Acceptance Criteria — summary

**12 Gherkin scenarios produced** (Happy 2 / No-op 2 / Negative 4 / Boundary 2 / Integration 2). Key contract decisions:

| # | Decision | Rationale | Source |
|---|---|---|---|
| 1 | **API endpoint**: `PATCH /api/v1/tests/{id}/reorder` with body `{ chain: [uuid, ...] }` | Dedicated sub-resource keeps reorder separate from full Test PATCH (which would handle title edits, metadata, etc.). Body is the complete new order, not a diff — the server computes the delta. Matches the pattern of BK-18's dedicated PATCH for ATC edits. | Senior DEV |
| 2 | **Optimistic locking**: `If-Match: <version>` header. Absent = skip check (lenient mode for simple UI clients). Present & mismatch = 409 `conflict` with current chain in response body. | Industry standard (RFC 7232). Prevents lost updates when two teammates reorder concurrently. The BK-18 ATC PATCH already uses this pattern — the route handler checks the header before calling the DB operation. Lenient mode allows UI clients that don't track version to still work; Bearer/agent clients SHOULD send it for safety. | Senior DEV |
| 3 | **No-op detection**: Server compares submitted chain vs stored chain as ordered arrays. If `JSON.stringify(submitted) === JSON.stringify(stored)` → 200, no version bump, no activity log, no `updated_at` change. | Business rule §5 — user does not pay a cost for double-checking. Cheap O(n) comparison before opening a DB transaction. If the order hasn't changed, there's nothing to write. The `bunkai_set_updated_at()` trigger on the `tests` table will not fire because no UPDATE occurs. | Senior DEV |
| 4 | **Version field on `tests`**: Monotonically increasing integer, per-Test. BK-27 (Test assembly) starts at 1 on create. Each real reorder increments by 1. No-op does NOT bump. | Enables optimistic locking. Same pattern as `atcs.version` in migration 0004. The version is the single source of truth for "has this Test changed since I last saw it?" — used by both the API (If-Match check) and the UI (stale-data warning). | Senior DEV |
| 5 | **Chain validation**: Submitted chain must be a permutation of stored chain (same set, any order). Set equality check before write. Extra/missing/duplicate ATC → 422. | Reorder ≠ add/remove. The business rule is explicit: "Reorder preserves the set of ATCs exactly." A set equality check (`new Set(a).size === new Set(b).size && [...new Set(a)].every(x => b.includes(x))`) catches mismatches, duplicates, and missing items in one pass. | Senior QA |
| 6 | **Permission gate**: `requireAuth()` + role check (`member`, `admin`, `owner`). `viewer` → 403 `forbidden`. RLS enforces at DB level; API enforces at route level for fast-fail. | Same pattern as ATC routes in migration 0004 — `atcs_update_workspace_role_member_plus` policy requires `wm.role in ('member','admin','owner')`. The API route checks first to return a clean 403 before the DB query runs. `requireAuth` from `lib/api/auth.ts` handles both Bearer PAT and cookie sessions. | Senior QA |
| 7 | **Activity log event**: `test.reordered` with payload `{ test_id, author_id, old_chain: [uuid...], new_chain: [uuid...], timestamp }`. Fires ONLY on real reorder (version bumped). | Mirrors `atc.created`/`atc.updated` event pattern. Full chains (not just summary) in the payload — audit trail needs the before/after for debugging. If no `event_log` table exists yet (check BK-27 migration), this Story creates a minimal one: `id uuid, event_type text, payload jsonb, author_id uuid, created_at timestamptz`. | Senior QA |
| 8 | **DB operation**: UPDATE `test_steps` positions in a single transaction. The `chain` array maps to positions 1, 2, 3... — position N = `chain[N-1]`. | `test_steps(atc_id, position)` with `unique(test_id, position)` from BK-27. Reorder = bulk UPDATE of positions inside one transaction. On any failure → rollback, zero rows written. Same transactional boundary pattern as BK-18's `bunkai_save_atc` RPC. | Senior DEV |

### Edge Cases Identified

**12 edge cases catalogued** (4 High, 5 Medium, 3 Low):

| Sev | Edge Case | Mitigation / Decision |
|---|---|---|
| 🔴 High | PATCH with invalid/expired/revoked PAT | Auth middleware (`requireBearerToken` in `lib/api/middleware/bearer.ts`) returns 401 `unauthorized` — same pattern as tokens routes. Error raised BEFORE any DB query runs. |
| 🔴 High | PATCH by viewer role | `requireAuth` + role check → 403 `forbidden` — same as ATC routes. RLS policy `tests_update_workspace_role_member_plus` also blocks at DB level (defense in depth). |
| 🔴 High | Concurrent reorder — version conflict (two clients at version 1) | First wins (200, version bumps to 2), second gets 409 `conflict`. Response body includes `current_chain` and `current_version` so the UI can show a conflict modal. Same pattern as BK-18's If-Match handling. |
| 🔴 High | Chain set mismatch (submitted chain has different ATC ids than stored) | 422 `chain_mismatch` — set equality check before write. Response body `details` includes `missing` (ATCs in stored but not submitted) and `extra` (ATCs in submitted but not stored). No rows updated in `test_steps`. |
| 🟡 Medium | Chain with duplicate ATC ids (e.g., `[A, A, B, C]`) | 422 `chain_invalid` — chain must be a permutation, not a multiset. Zod `superRefine` on the request schema checks `new Set(chain).size === chain.length`. |
| 🟡 Medium | Empty chain array `[]` | 422 `chain_invalid` — Zod `minItems: 1` on the `chain` field. A Test must have ≥1 ATC (BK-27 business rule). |
| 🟡 Medium | Chain with single ATC (no-op reorder by definition) | No-op detection catches it → 200, no version bump, no activity log. The array comparison `[A] === [A]` is trivially equal. |
| 🟡 Medium | PATCH to non-existent Test id | 404 `not_found` — same pattern as `tokens/[id]` route. The SELECT query returns zero rows → throw `ApiError('not_found', 404)`. |
| 🟡 Medium | `If-Match` header absent | **Decision**: Accept without version check (lenient mode for simple UI clients). Version still bumps on real change. — Senior DEV. Matches the BK-18 decision for ATC PATCH. Bearer/agent clients SHOULD send it. |
| 🟢 Low | Chain order submitted is already the current order (UI double-save) | No-op detection → 200, no side effects. The `bunkai_set_updated_at()` trigger does not fire because no UPDATE occurs. |
| 🟢 Low | ATC id in chain references a deleted ATC | Orphan reference — out of scope for BK-28. BK-27 should handle ATC deletion cascade (if an ATC is deleted, it's removed from all `test_steps` rows). If it happens before BK-27 implements cascade, the set equality check returns 422 `chain_mismatch` (the query returns fewer ids than expected). |
| 🟢 Low | Very long chain (50+ ATCs) | No hard limit in MVP. Zod accepts arbitrary array length. Performance: set equality check is O(n), position UPDATE is O(n) — acceptable for n=50. If chains grow to 500+, consider a max limit in a future Story. |

### Clarified Business Rules

- **Version semantics**: Monotonically increasing integer on the `tests` table. BK-27 (Test assembly) sets `version = 1` on create. Each real reorder increments by 1. No-op reorder does NOT bump — the `bunkai_set_updated_at()` trigger only fires on actual UPDATE.
- **Optimistic locking**: `If-Match: <current_version>` header on PATCH. Absent = skip version check (lenient mode for simple UI clients). Present & mismatch = 409 `conflict` with `current_chain` and `current_version` in response body. The route handler checks the header BEFORE opening the DB transaction — cheap fail-fast.
- **No-op detection**: Server compares `submitted_chain` vs `stored_chain` as ordered arrays using `JSON.stringify` equality. Exact order match = no-op → 200, no version bump, no activity log, no `updated_at` change. The user does not pay a cost for double-checking.
- **Chain validation**: Submitted chain must be a permutation of stored chain (same set, any order). Set equality check: `new Set(a).size === new Set(b).size && [...new Set(a)].every(x => b.includes(x))`. Uniqueness check: `new Set(chain).size === chain.length`. Both checks run BEFORE the DB transaction opens.
- **Transactional boundary**: One DB transaction per reorder. The transaction UPDATEs `test_steps` positions in bulk. On any failure (constraint violation, RLS denial) → rollback, zero rows written. Same pattern as BK-18's `bunkai_save_atc` RPC.
- **Activity log**: `test.reordered` event fires ONLY on real reorder (version bumped). Payload includes `test_id`, `author_id`, `old_chain` (array of uuids before reorder), `new_chain` (array of uuids after reorder), and `timestamp`. If no `event_log` table exists, this Story creates one. Events are fire-and-forget (after-commit hook) — if the event bus is down, the API response is still 200.
- **RLS**: The `tests` table inherits workspace RLS from BK-27. SELECT requires active workspace membership. UPDATE (reorder) requires `wm.role in ('member', 'admin', 'owner')`. The API route checks role first for fast-fail; RLS is defense in depth.
- **Idempotency**: Not required for MVP. Optimistic locking + no-op detection make retries inherently safe. Double-click from UI: first returns 200 (version bumps), second returns 200 (no-op, same order). Agent retry: same behavior. No `Idempotency-Key` header needed.
- **Soft-delete**: OUT of scope for BK-28. Test deletion will be a future Story. If a Test is soft-deleted, its `test_steps` rows should be cascade-deleted or soft-deleted too — BK-27 should define this.

### Open Questions for PO / Dev / Design

**For PO (2):**

1. **`If-Match` requirement**: Should reorder REQUIRE the version header (strict mode — 400 if absent) or accept without it (lenient — skip check)? **Decision (Senior PO)**: Lenient — UI clients may not track version. Bearer/agent clients SHOULD send it for safety. Absent = skip check, version still bumps on real change. This matches the BK-18 decision for ATC PATCH. Strict mode can be added later if audit requirements demand it — changing from lenient→strict is backward-compatible; the reverse is not.
2. **Activity log scope**: Should the activity log show the full old and new chains, or just a summary ("Elena reordered Test X")? **Decision (Senior PO)**: Full chains — audit trail needs the before/after for debugging. The `test.reordered` event payload includes both `old_chain` and `new_chain` arrays. Event consumers (future activity-log UI, BK-30 Runs) can filter or aggregate as needed.

**For Dev (3):**

1. **`tests` table schema**: Does BK-27's migration include a `version` column on `tests`? If not, BK-28 needs to add it. **Decision (Senior DEV)**: BK-27 should include `version int not null default 1` in the initial `tests` table migration. If it does not, BK-28 adds it via a new migration: `ALTER TABLE tests ADD COLUMN version int not null default 1`. The column is required for optimistic locking. Same pattern as `atcs.version` in migration 0004.
2. **Activity log infrastructure**: Does an `event_log` table exist yet? Or does BK-28 need to create it? **Decision (Senior DEV)**: Check BK-27 and prior migrations. If no `event_log` exists, BK-28 creates a minimal one: `create table event_log (id uuid primary key default gen_random_uuid(), event_type text not null, payload jsonb not null, author_id uuid not null, created_at timestamptz not null default now())`. This is a shared concern — if BK-27 already creates it, BK-28 just writes to it. RLS on `event_log` should follow the same workspace-membership pattern as other tables.
3. **Chain storage**: Is `test_steps` the canonical source of ATC order (one row per ATC with `position` column)? **Decision (Senior DEV)**: Yes — `test_steps(atc_id, position)` with `unique(test_id, position)` from BK-27. Reorder = bulk UPDATE of positions in a single transaction. The `chain` array in the API body maps to positions: position 1 = `chain[0]`, position 2 = `chain[1]`, etc. The UPDATE uses `CASE WHEN atc_id = $1 THEN 1 WHEN atc_id = $2 THEN 2 ... END` or an `unnest` with ordinality for efficiency.

**For Design (2):**

1. **Conflict resolution UX**: When Elena's save is blocked (409), what does she see? **Decision (Senior Design)**: Modal with side-by-side comparison: "Your order: A, D, B, C" vs "Current order: C, B, A". Two buttons: "Keep theirs" (reload the Test with the current chain) and "Apply mine" (retry the PATCH with the new `If-Match` = current version). The modal should show the ATC titles (not just ids) for readability.
2. **No-op feedback**: When Elena saves without changes, should there be a toast? **Decision (Senior Design)**: No toast — silent 200. The "Save" button briefly shows a checkmark (✓) then returns to enabled state. No noise for no change. The user already sees the chain hasn't moved, so a toast would be redundant.

### Scope refinement — IN vs OUT of BK-28

***IN BK-28:***
- `PATCH /api/v1/tests/{id}/reorder` endpoint (NEW)
- Request body schema: `{ chain: [uuid, ...] }` — complete new order, validated with Zod
- `If-Match: <version>` header (optional, optimistic locking)
- No-op detection (JSON.stringify array equality check)
- Chain validation: set equality, uniqueness, `minItems: 1`
- Permission gate: `requireAuth()` + role check (`member`, `admin`, `owner`)
- Version bump on real reorder (monotonically increasing integer)
- Activity log entry: `test.reordered` with `old_chain` and `new_chain` arrays
- DB: bulk UPDATE `test_steps` positions in a single transaction
- Error codes: `chain_mismatch` (422), `chain_invalid` (422), `conflict` (409)
- `event_log` table creation (if not exists from BK-27)
- Integration tests: concurrent reorder, no-op detection, permission gating, chain validation, transactional rollback
- UI: drag-and-drop reorder + save button + conflict modal (Design decisions applied)

***OUT (delegated to other Stories):***
- Test creation → BK-27 (Test assembly)
- Add/remove ATCs from Test → BK-? (future Story — different operation, different endpoint)
- Test deletion → BK-? (future Story — soft-delete, cascade rules)
- Run execution in reordered sequence → BK-30 (Manual Runs epic — reads `test_steps` order)
- Activity log UI / feed → BK-? (future Story — displays `event_log` entries)
- Bulk reorder (multiple Tests at once) → future (not a current user need)
- `used_in` response expansion on Test → BK-27 or future (which Tests reference this ATC)
- Idempotency-Key support → future (when POST idempotency needed for Test creation)

---

**See custom field 🧪 Acceptance Test Plan (ATP) + Shift-Left comment for the complete refinement (~12 test outlines, full Gherkin scenarios, AC↔code reconciliation per divergence).**

---

## Refined Acceptance Criteria (Shift-Left QA pass — 2026-06-04)

> Refined and consolidated by QA during the pre-sprint Shift-Left review. Reconciliation reasoning (AC ↔ code divergences, decisions, edge cases, scope cuts) is captured in the **🧪 Acceptance Test Plan (ATP)** field and the **Shift-Left Refinement** comment on this issue.

```gherkin
Background:
  Given the workspace has a Test "Add to Cart from Empty State" with id TEST-1
    And TEST-1 contains ATCs in the order [ATC-A, ATC-B, ATC-C, ATC-D]
    And TEST-1 is at version 1
    And Elena is a workspace member with role "member"
    And Elena has a valid Personal Access Token with scope "test:write"

# ---- Happy path ----

Scenario: Successful reorder of ATCs in a Test
  Given Elena has a valid PAT with "test:write" scope
  When she PATCHes /api/v1/tests/TEST-1/reorder with body:
    | chain | ["ATC-A", "ATC-D", "ATC-B", "ATC-C"] |
    And header If-Match: "1"
  Then the API returns 200
    And the response body has "version" = 2
    And the response body has "chain" = ["ATC-A", "ATC-D", "ATC-B", "ATC-C"]
    And SELECT count(*) FROM test_steps WHERE test_id = TEST-1 returns 4
    And the test_steps row with position 1 has atc_id = ATC-A
    And the test_steps row with position 2 has atc_id = ATC-D
    And the test_steps row with position 3 has atc_id = ATC-B
    And the test_steps row with position 4 has atc_id = ATC-C
    And a "test.reordered" event is logged with old_chain = [ATC-A, ATC-B, ATC-C, ATC-D]
    And the event payload includes new_chain = [ATC-A, ATC-D, ATC-B, ATC-C]
    And when Elena or any teammate GETs the Test, the chain shows A, D, B, C

Scenario: Reorder persists across sessions
  Given the Test TEST-1 has chain [ATC-A, ATC-D, ATC-B, ATC-C] at version 2
  When a different user Mateo GETs /api/v1/tests/TEST-1
  Then the response body has "chain" = ["ATC-A", "ATC-D", "ATC-B", "ATC-C"]
    And the response body has "version" = 2

# ---- No-op path ----

Scenario: Saving the same order is a no-op
  Given TEST-1 has chain [ATC-A, ATC-B, ATC-C] at version 3
    And updated_at = "2026-06-04T10:00:00Z"
  When Elena PATCHes /api/v1/tests/TEST-1/reorder with body:
    | chain | ["ATC-A", "ATC-B", "ATC-C"] |
  Then the API returns 200
    And the response body has "version" = 3 (unchanged)
    And SELECT updated_at FROM tests WHERE id = TEST-1 returns "2026-06-04T10:00:00Z"
    And no "test.reordered" event is logged

Scenario: Single-ATC Test reorder is a no-op
  Given TEST-1 has chain [ATC-A] at version 1
  When Elena PATCHes /api/v1/tests/TEST-1/reorder with body:
    | chain | ["ATC-A"] |
  Then the API returns 200
    And the response body has "version" = 1 (unchanged)
    And no "test.reordered" event is logged

# ---- Negative path ----

Scenario: Unauthenticated request rejected
  Given no Authorization header
  When the user PATCHes /api/v1/tests/TEST-1/reorder with valid body
  Then the API returns 401
    And the error code is "unauthorized"
    And no rows are updated in test_steps

Scenario: Viewer role cannot reorder
  Given Pablo is a workspace member with role "viewer"
  When Pablo PATCHes /api/v1/tests/TEST-1/reorder with valid body
  Then the API returns 403
    And the error code is "forbidden"
    And no rows are updated in test_steps

Scenario: Version conflict on concurrent reorder
  Given TEST-1 is at version 1 with chain [ATC-A, ATC-B, ATC-C]
  When two PATCH requests arrive with If-Match: "1"
    And the first request reorders to [ATC-C, ATC-B, ATC-A]
    And the second request reorders to [ATC-B, ATC-A, ATC-C]
  Then the first returns 200 with version 2
    And the second returns 409 with error code "conflict"
    And the 409 response body includes "current_chain" = ["ATC-C", "ATC-B", "ATC-A"]
    And the 409 response body includes "current_version" = 2
    And SELECT count(*) FROM event_log WHERE event_type = 'test.reordered' returns 1

Scenario: Chain set mismatch (different ATCs)
  Given TEST-1 contains ATCs [ATC-A, ATC-B, ATC-C]
  When Elena PATCHes /api/v1/tests/TEST-1/reorder with body:
    | chain | ["ATC-A", "ATC-X", "ATC-C"] |
  Then the API returns 422
    And the error code is "chain_mismatch"
    And the response body details include "missing" = ["ATC-B"]
    And the response body details include "extra" = ["ATC-X"]
    And SELECT count(*) FROM test_steps WHERE test_id = TEST-1 returns 3 (unchanged)

# ---- Boundary / edge ----

Scenario: Chain with duplicate ATC ids rejected
  When Elena PATCHes /api/v1/tests/TEST-1/reorder with body:
    | chain | ["ATC-A", "ATC-A", "ATC-B"] |
  Then the API returns 422
    And the error code is "chain_invalid"
    And the response message mentions "duplicate ATC references"
    And no rows are updated in test_steps

Scenario: Empty chain array rejected
  When Elena PATCHes /api/v1/tests/TEST-1/reorder with body:
    | chain | [] |
  Then the API returns 422
    And the error code is "chain_invalid"
    And the response message mentions "at least one ATC"
    And no rows are updated in test_steps

# ---- Integration ----

Scenario: Activity log captures reorder with full chain details
  Given TEST-1 has chain [ATC-A, ATC-B, ATC-C] at version 1
  When Elena PATCHes /api/v1/tests/TEST-1/reorder with body:
    | chain | ["ATC-C", "ATC-A", "ATC-B"] |
  Then the API returns 200
    And a "test.reordered" event exists in the event_log table
    And the event payload includes "old_chain" = ["ATC-A", "ATC-B", "ATC-C"]
    And the event payload includes "new_chain" = ["ATC-C", "ATC-A", "ATC-B"]
    And the event payload includes "author_id" = Elena's user id
    And the event payload includes a timestamp within 1 second of the API response

Scenario: Retry-safe reorder (double-click)
  Given TEST-1 has chain [ATC-A, ATC-B, ATC-C] at version 1
  When Elena sends the same reorder PATCH [ATC-C, ATC-B, ATC-A] twice rapidly
  Then the first returns 200 with version 2
    And the second returns 200 with version 2 (no-op, same order)
    And SELECT count(*) FROM event_log WHERE event_type = 'test.reordered' AND payload->>'test_id' = TEST-1 returns 1
```

***Markers used:*** all NEEDS PO/DEV CONFIRMATION items are explicitly resolved with Senior PO/DEV/Design decisions inline in §Key Contract Decisions and §Open Questions. The AC text above is final with those decisions applied.

---

**Copied from Refined AC by QA — Shift-Left pass 2026-06-04. PO ownership of this field returns after Estimation grooming; any further AC edits must go through PO.**

---

## References

- [BK-18 Shift-Left Refinement](https://upexgalaxy67.atlassian.net/browse/BK-18) — optimistic locking pattern, If-Match precedent
- [Migration 0004 — ATCs](../upex-bunkai-tms/supabase/migrations/0004_atcs.sql) — version field pattern, RLS policies
- [Migration 0009 — Cross-cutting](../upex-bunkai-tms/supabase/migrations/0009_cross_cutting.sql) — shared infra patterns
- [Auth middleware](../upex-bunkai-tms/lib/api/auth.ts) — `requireAuth`, `requireScopeOrCookie`
- [Error envelope](../upex-bunkai-tms/lib/api/error-envelope.ts) — `ApiError`, `API_ERROR_CODES` map
- [API handler](../upex-bunkai-tms/lib/api/handler.ts) — `withApiHandler`, ZodError mapping

---

## Business Rules

## Business rules

- Reorder preserves the set of ATCs exactly. Adding or removing an ATC is a different operation and is out of scope of this story.
- The new chain order Elena defines is the order in which the ATCs will run during execution. The order is preserved verbatim.
- Two ATCs in the same Test can reference the same ATC; reordering moves the references, not the underlying ATC.
- Only workspace members with role `member`, `admin`, or `owner` can reorder a Test. Role `viewer` is read-only.
- A reorder that produces the same final order as before is not a "real" change — it must NOT pollute the activity log or bump the Test's last-modified timestamp. The user does not pay a cost for double-checking.
- A real reorder must produce exactly one activity-log entry, even if the user submits the same reorder twice in rapid succession (retry-safe).
- When two teammates reorder the same Test concurrently, the second save is blocked with a clear message — it never silently overwrites. The user always sees the current state before deciding.
- Reorder inherits the Test's workspace boundary — no cross-workspace reorder is possible because no cross-workspace Test is reachable in the first place.

---

## Scope

## In scope

- Elena can reorder the ATCs inside an existing Test she has access to, preserving the set of ATCs (no add, no remove)
- The new order persists across reloads and across sessions
- The same reorder operation is reachable from the UI and from any headless client (AI agent, CI) using the Bunkai surface
- A no-op reorder (saving the same order back) does NOT create an activity log entry and does NOT bump the Test's last-modified timestamp
- Activity log captures every real reorder event: author, timestamp, and the new chain after the reorder
- Permission rules: only member, admin, and owner can reorder; viewer cannot, and the affordance is hidden from them
- Concurrent-edit safety: if a teammate reordered the same Test in between, Elena's stale save is blocked with a clear message instead of silently overwriting

---

## Workflow

## User flow

1. Elena opens a Test she previously created (or one a teammate created in her workspace).
2. The Test detail view shows the current ATC chain in order, with drag handles next to each ATC (visible only if Elena has reorder permission).
3. Elena drags an ATC up or down to a new position. The UI gives immediate visual feedback as she drops.
4. She continues reordering until the sequence matches the User Story flow she is verifying.
5. She clicks "Save".
6. The system checks for conflicts — has anyone else reordered this same Test since Elena opened it?

   - If yes: the save is blocked with a message showing the current order; Elena reviews and decides whether to keep her change or accept the teammate's.
   - If no: the new order is committed.

1. If the order Elena submitted is identical to what was there before, the system saves no change — no activity log entry, no last-modified bump.
2. If the order actually changed, the activity log of her workspace shows the new chain alongside her name and a timestamp.
3. From here, anyone who opens the Test later will see the updated chain, and any subsequent Run will execute the ATCs in the new order — covered by the Manual Runs epic (BK-006).

## Note for the AI-agent and CI-agent path

When an agent reorders a Test through the Bunkai headless surface instead of the UI, the same business rules apply: same permission gate, same no-op detection, same concurrent-edit guard, same activity-log entry. The agent provides the Test identifier + the new chain order + a retry-safe identifier. There is no "agent-only" reorder path.

---

## Traceability

### Story (1)

- [BK-27](https://upexgalaxy67.atlassian.net/browse/BK-27): As a QA Engineer I want to assemble a Test by chaining ATCs from my workspace so that I can run the validations together when verifying a User Story _(Shift-Left QA)_

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 5/27/2026
- **Updated:** 5/27/2026
- **Reporter:** Ely
- **Assignee:** Unassigned
- **Labels:** master-sprint-4, mvp, tests-epic

---

_Synced from Jira by sync-jira-issues_
_Last sync: 2026-05-27T14:56:45.968Z_
