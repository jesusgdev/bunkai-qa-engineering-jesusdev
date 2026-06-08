h1. BK Test Repository — Entity Definition

*Jira Key:* [BK-70|https://upexgalaxy69.atlassian.net/browse/BK-70]
*Epic:* BK-70 (BK Test Repository)
*Priority:* Medium
*Story Points:* TBD
*Status:* Backlog

----

h2. User Story

{quote}
*Source spec:* Greenfield — no prior spec exists
{quote}

h3. User story

As a QA Engineer, I want a Test Repository where Tests are defined as executable entities with steps, tags, and links to ATCs so that manual test execution has a structured, traceable foundation.

Defines the *Test* entity for the TMS — the parent entity that BK-33 (tags), BK-34..BK-39 (run execution), BK-40..BK-43 (defects), and BK-45..BK-50 (traceability/coverage) all depend on.

h3. Definition of done

* Implementation complete
* Unit tests written
* Code reviewed
* Documentation updated

----

h2. QA Refinements (Shift-Left Analysis)

{quote}
Added 2026-06-06 by Shift-Left QA. Full ATP DRAFT lives in custom field 🧪 Acceptance Test Plan (ATP) and mirrored as a comment on this issue. This section captures the slices PO + Dev need before estimation.
{quote}

h3. Refined Acceptance Criteria — summary

*13 Gherkin scenarios produced* (Happy 4 / Negative 5 / Boundary 2 / Integration 2). Key contract decisions:

|| # || Decision || Rationale || Source ||
| 1 | *Test slug format*: {{module-slug/test-uuid8}} | Mismo patrón que ATCs — determinista, único, legible. 8 chars balancea colisión vs brevedad. | Senior DEV |
| 2 | *Tags*: {{text[]}} column, no separate table | Mismo patrón que {{atcs.tags}} (migration 0004). GIN index on {{tsv}} para búsqueda tag-prefix. | Senior DEV |
| 3 | *test_steps*: standalone table, no JSONB | Pasos necesitan ordenamiento individual, reordering, y link a {{test_run_step_results}}. JSONB haría updates complejos. | Senior DEV |
| 4 | *test_atc_links*: M:N junction table | Un Test verifica múltiples ATCs; un ATC puede ser parte de múltiples Tests. Cross-project links rejected at app layer. | Senior DEV |
| 5 | *test_runs*: separate table from tests | Runs son instancias de ejecución — el Test es la definición. Separación definición/instancia. | Senior DEV |
| 6 | *test_defects*: own table, not Jira-only | Defectos nacen en el TMS, se sync one-way a Jira (BK-43). {{external_issue_id}} es referencia, no PK. | Senior DEV |
| 7 | *Error envelope*: {{{ ok: false, error: { code, message, details } }}} | Mismo patrón que API existente. Nuevos códigos: TEST_NOT_FOUND, DUPLICATE_SLUG, INVALID_TAG, RUN_ALREADY_FINISHED. | Senior DEV |

----

h3. Edge Cases Identified

*12 edge cases catalogued* (4 High, 5 Medium, 3 Low):

|| Sev || Edge Case || Mitigation / Decision ||
| {color:red}🔴 High{color} | Cross-project ATC link attempt | App-layer guard: verify {{atcs.project_id = tests.project_id}} before INSERT. Return `CROSS_PROJECT_LINK` 400. |
| {color:red}🔴 High{color} | Duplicate slug on Test creation | {{unique(project_id, slug)}} constraint at DB level. App catches {{23505}} and maps to `DUPLICATE_SLUG` 409. |
| {color:red}🔴 High{color} | Reserved tag case mismatch (`SMOKE` vs {{smoke}}) | App-layer normalization: reserved tags always lowercase. Reject with `INVALID_TAG` 400. |
| {color:red}🔴 High{color} | Step position collision | {{unique(test_id, position)}} constraint. App catches and returns `POSITION_CONFLICT` 409. |
| {color:orange}🟡 Medium{color} | Test deleted while run in progress | {{on delete cascade}} on {{test_runs.test_id}}. Run terminates implicitly. |
| {color:orange}🟡 Medium{color} | ATC deleted while linked to Test | {{on delete cascade}} on {{test_atc_links.atc_id}}. Link removed, Test remains. |
| {color:orange}🟡 Medium{color} | Empty tag array after tag removal | Allowed. Test becomes untagged. |
| {color:orange}🟡 Medium{color} | Test with no steps created | Allowed (draft state). Cannot start run until ≥1 step exists (BK-34 gate). |
| {color:orange}🟡 Medium{color} | tsv not refreshed after tag change | Trigger {{bunkai_tests_refresh_tsv}} on INSERT/UPDATE OF title, tags. |
| {color:green}🟢 Low{color} | Unicode in tag names | Allowed for custom tags. Reserved tags are ASCII-only. |
| {color:green}🟢 Low{color} | Test title exceeds 500 chars | Zod {{z.string().max(500)}}. Client-side validation mirrors. |
| {color:green}🟢 Low{color} | Soft-delete vs hard-delete | MVP: status → {{deprecated}}. Hard-delete deferred to admin tooling Story. |

----

h3. Clarified Business Rules

* *Test lifecycle*: {{draft → ready → active → deprecated → archived}}. Status transitions enforced at app layer.
* *Tag taxonomy*: 3 reserved tags ({{smoke}}, {{sanity}}, {{regression}}) — lowercase only. Custom tags: free text, max 50 chars.
* *RLS strategy*: workspace resolved via {{project_id → projects.workspace_id}}. SELECT requires active membership; mutations require role >= member.
* *ATC link constraint*: both Test and ATC must belong to the same project. Enforced at app layer.
* *tsv column*: {{tsvector}} for full-text search, populated by trigger {{bunkai_tests_refresh_tsv}}. GIN index for tag-prefix queries.
* *Step ordering*: {{position}} int, 0-based. Unique per Test.

----

h3. Open Questions for PO / Dev / Design

h4. For PO (3):

# *Test lifecycle states*: {{draft → ready → active → deprecated → archived}} — confirm or adjust? *Decision (Senior PO)*: Accepted as proposed. {{ready}} gate ensures steps are defined before execution.
# *Reserved tag set*: {{smoke}}, {{sanity}}, {{regression}} — sufficient for MVP? *Decision (Senior PO)*: 3 reserved tags for MVP. Additional tags deferred until usage patterns emerge.
# *Test-to-ATC ratio*: Should a Test require ≥1 ATC link, or can it exist standalone? *Decision (Senior PO)*: Tests can exist without ATC links. Not all manual tests map to automated ATCs.

h4. For Dev (3):

# *Migration number*: next available is {{0021}}. Confirm {{0021_test_repository.sql}} creates all 6 tables? *Decision (Senior DEV)*: Yes, single migration for all 6 tables + triggers + RLS. Atomic deployment.
# *tsv trigger*: replicate {{bunkai_atcs_refresh_tsv}} pattern exactly? *Decision (Senior DEV)*: Replicate exactly — same function shape, different trigger name.
# *Soft-delete*: status {{deprecated}} or add {{deleted_at}} timestamp? *Decision (Senior DEV)*: Status-only for MVP. {{deleted_at}} adds query complexity without benefit until admin tooling exists.

h4. For Design (0):

No design questions — this is an API + schema-only Story. UI counterparts live in child stories.

----

h3. Scope refinement — IN vs OUT of BK-70

*IN BK-70:*

* 6 new tables: {{tests}}, {{test_steps}}, {{test_atc_links}}, {{test_runs}}, {{test_run_step_results}}, {{test_defects}}
* CRUD API endpoints for Tests (POST/GET/PATCH/DELETE)
* Tag management foundation (BK-33 uses this infrastructure)
* RLS policies (24 policies: 6 tables × 4 operations)
* OpenAPI contracts for all endpoints
* {{bunkai_tests_refresh_tsv}} trigger + GIN index
* Migration {{0021_test_repository.sql}}

*OUT (delegated to other Stories):*

* Run execution API + UI → BK-34, BK-35, BK-36, BK-39
* Run history + reporting → BK-37, BK-38
* Defect lifecycle → BK-40, BK-41, BK-42, BK-43
* Traceability chain → BK-45, BK-48, BK-50
* Coverage metrics → BK-46, BK-47
* Tag management UI → BK-33

----

{panel:title=Full ATP}
See custom field 🧪 Acceptance Test Plan (ATP) + Shift-Left comment for the complete refinement (~13 test outlines, full Gherkin scenarios, AC↔code reconciliation per divergence).
{panel}

----

h2. Acceptance Criteria

{quote}
Refined and consolidated by QA during the pre-sprint Shift-Left review. Reconciliation reasoning captured in the 🧪 Acceptance Test Plan (ATP) field and the Shift-Left Refinement comment.
{quote}

{code:gherkin}
Background:
  Given an active workspace member with role >= member
    And the project exists in that workspace
    And the module "auth" exists in the project

# ---- Happy path ----

Scenario: Create a new Test with steps and tags
  Given the project has module "auth"
  When POST /api/v1/tests with body:
    | Field          | Value                        |
    | title          | "Login flow validation"      |
    | module_id      | <auth-module-id>             |
    | layer          | "UI"                         |
    | tags           | ["smoke", "regression"]      |
    | preconditions  | "User exists in system"      |
    | steps          | [{action: "Navigate to /login", expected: "Login form visible"}, {action: "Enter valid credentials", expected: "Dashboard loads"}] |
  Then the API responds 201 with the created Test
    And the slug is generated as "auth/test-uuid8"
    And status is "draft"
    And 2 test_steps exist linked to the Test
    And DB: SELECT count(*) FROM test_steps WHERE test_id = <new-id> returns 2

Scenario: List tests filtered by reserved tag
  Given 5 Tests exist with tags: 2 smoke, 2 sanity, 1 regression
  When GET /api/v1/tests?tag=smoke
  Then the response contains exactly 2 Tests
    And each Test has "smoke" in its tags array
    And DB: SELECT count(*) FROM tests WHERE tags @> ARRAY['smoke'] returns 2

Scenario: Link ATCs to a Test
  Given a Test exists
    And 3 ATCs exist in the same project
  When POST /api/v1/tests/:id/atc-links with body:
    | atc_ids | [uuid1, uuid2] |
  Then the API responds 200
    And 2 rows exist in test_atc_links
    And DB: SELECT count(*) FROM test_atc_links WHERE test_id = <test-id> returns 2

Scenario: Update Test (full-replace, PUT-like)
  Given a Test exists with tags ["smoke"]
  When PATCH /api/v1/tests/:id with body:
    | Field   | Value                    |
    | title   | "Updated login flow"     |
    | tags    | ["smoke", "sanity"]      |
    | layer   | "UI"                     |
  Then the API responds 200
    And the Test's tags are now ["smoke", "sanity"]
    And the tsv column is refreshed (trigger fires)

# ---- Negative path ----

Scenario: Duplicate slug rejected
  Given a Test with slug "auth/test-abc12345" exists
  When POST /api/v1/tests with same module and explicit slug "auth/test-abc12345"
  Then the API responds 409 with code "DUPLICATE_SLUG"

Scenario: Reserved tag case mismatch rejected
  Given a Test exists
  When PATCH /api/v1/tests/:id/tags with body:
    | tags | ["SMOKE", "Sanity"] |
  Then the API responds 400 with code "INVALID_TAG"

Scenario: Cross-project ATC link rejected
  Given a Test in project A
    And an ATC in project B
  When POST /api/v1/tests/:test-id/atc-links with atc_id from project B
  Then the API responds 400 with code "CROSS_PROJECT_LINK"

Scenario: Test not found
  When GET /api/v1/tests/nonexistent-uuid
  Then the API responds 404 with code "TEST_NOT_FOUND"

Scenario: Unauthorized access (no auth header)
  When GET /api/v1/tests with no Authorization header and no session cookie
  Then the API responds 401 with code "UNAUTHORIZED"

# ---- Boundary / edge ----

Scenario: Empty tag array allowed
  Given a Test exists with tags ["smoke"]
  When PATCH /api/v1/tests/:id/tags with body:
    | tags | [] |
  Then the API responds 200
    And the Test has no tags
    And GET /api/v1/tests?tag=smoke no longer returns this Test

Scenario: Test with no steps cannot start run (BK-34 gate)
  Given a Test exists with 0 steps
  When POST /api/v1/tests/:id/runs (BK-34 endpoint)
  Then the API responds 400 with code "NO_STEPS"

# ---- Integration ----

Scenario: Test deletion cascades to runs and links
  Given a Test exists with 2 linked ATCs and 1 completed run
  When DELETE /api/v1/tests/:id
  Then the API responds 200
    And the Test status is "deprecated"
    And DB: SELECT count(*) FROM test_atc_links WHERE test_id = <id> returns 0
    And DB: SELECT count(*) FROM test_runs WHERE test_id = <id> returns 0
{code}

{panel:title=Markers used}
All NEEDS PO/DEV CONFIRMATION items are explicitly resolved with Senior PO/DEV decisions inline in §Key Contract Decisions. The AC text above is final with those decisions applied.
{panel}

{panel:title=Ownership}
Copied from Refined AC by QA — Shift-Left pass 2026-06-06. PO ownership of this field returns after Estimation grooming; any further AC edits must go through PO.
{panel}

----

h2. Business Rules

* Test lifecycle: {{draft → ready → active → deprecated → archived}}
* Tags: 3 reserved ({{smoke}}, {{sanity}}, {{regression}}) — lowercase only. Custom tags: free text, max 50 chars.
* RLS: workspace via {{project_id → projects.workspace_id}}. SELECT = active membership. Mutations = role >= member.
* ATC links: same project constraint enforced at app layer.
* tsv: {{tsvector}} for full-text search, trigger-refreshed on title/tags change.
* Step ordering: {{position}} int, 0-based, unique per Test.

----

h2. Scope

* 6 new tables: {{tests}}, {{test_steps}}, {{test_atc_links}}, {{test_runs}}, {{test_run_step_results}}, {{test_defects}}
* CRUD API for Tests
* Tag management foundation
* RLS policies
* OpenAPI contracts
* Migration {{0021_test_repository.sql}}

----

h2. References

* {{supabase/migrations/0004_atcs.sql}} — ATC table pattern (tags, tsv, RLS)
* {{supabase/migrations/0007_save_atc.sql}} — RPC pattern for ATC save
* {{lib/api/auth.ts}} — {{requireAuth}} + {{requireScopeOrCookie}} pattern
* {{lib/api/error-envelope}} — error envelope format
* {{.context/SRS/api-contracts.yaml}} — OpenAPI contract registry
