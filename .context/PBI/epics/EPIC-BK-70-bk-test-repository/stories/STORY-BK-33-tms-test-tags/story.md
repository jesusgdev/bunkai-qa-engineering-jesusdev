h1. TMS-Test Tags | Assign reserved and custom tags to a Test

*Jira Key:* [BK-33|https://upexgalaxy69.atlassian.net/browse/BK-33]
*Epic:* [BK-70|https://upexgalaxy69.atlassian.net/browse/BK-70] (BK Test Repository)
*Priority:* Medium
*Story Points:* TBD
*Status:* Estimation

----

h2. User Story

As a QA Engineer, I want to assign and replace the set of tags on a Test, using both reserved suite tags (smoke, sanity, regression) and my own custom tags so that my Tests are automatically grouped and filterable into the right suites without maintaining separate lists by hand.

*Dependency:* BK-70 (Test Repository entity definition) must be completed first.

----

h2. Definition of Done

* Implementation complete
* Unit tests written
* Code reviewed
* Documentation updated

----

h2. Acceptance Criteria

*PROPOSED — Pending PO confirmation during Estimation grooming.*

h3. AC-1: Assign reserved tags to a Test

When the user assigns reserved tags (smoke, sanity, regression) to a Test, the tags are stored and the Test becomes visible when filtering by those tags.

h3. AC-2: Assign custom tags alongside reserved tags

When the user assigns custom tags to a Test, they are stored alongside any reserved tags. Custom tags accept free text up to 50 characters.

h3. AC-3: Remove all tags from a Test

When the user removes all tags from a Test, the Test becomes untagged and no longer appears in any tag-filtered view.

h3. AC-4: Reserved tags are case-insensitive

When the user enters a reserved tag with different casing (e.g., "SMOKE", "Sanity"), it is normalized to lowercase before storage.

h3. AC-5: Invalid tag formats are rejected

Tags exceeding 50 characters or containing commas are rejected with a clear error message.

h3. AC-6: Duplicate tags are prevented

A Test cannot carry the same tag twice. Duplicate entries are silently removed before storage.

h3. AC-7: Filter Tests by tag

When the user filters Tests by a tag, only Tests carrying that tag are returned.

h3. AC-8: Concurrent tag updates are handled safely

When two users update tags on the same Test simultaneously, only one succeeds. The other receives a conflict error.

----

h2. Business Rules

* Reserved tags: smoke, sanity, regression (lowercase only, case-insensitive input)
* Custom tags: free text, max 50 characters, no commas, trimmed
* Maximum 20 tags per Test (reserved and custom combined)
* Tags are values in a collection, not first-class entities (no tag registry)

----

h2. Scope

h3. In scope

* Tag validation (reserved and custom rules)
* Tag replacement on a Test
* Tag filtering by query parameter
* Duplicate prevention and whitespace trimming
* Optimistic locking for concurrent updates

h3. Out of scope

* Test CRUD operations (BK-70)
* Tag UI components (BK-70 child UI story)
* Tag analytics (future)
* Tag permissions (future RBAC story)

----

h2. References

* BK-70: Test Repository entity definition
* BK-018: Source spec

----

h2. QA Refinement Notes

{quote}
Shift-Left analysis completed 2026-06-06. See ATP field for full scenario matrix and edge case catalog.
{quote}

h3. Key findings

* 10 Gherkin scenarios drafted (Happy 3, Negative 4, Boundary 2, Integration 1)
* 8 edge cases identified (3 High, 3 Medium, 2 Low)
* Tag filtering uses array containment operator (GIN-indexable)
* Optimistic locking via version field proposed

h3. Risks

* Tag array size unbounded without app-layer limit (proposed: max 20)
* Concurrent tag updates need version check (proposed: If-Match header)

h3. Open questions

* Reserved tag set expansion (nightly, smoke-critical) — pending PO decision
* Tag deletion impact on historical runs — pending PO decision

{panel:title=Ownership}
PO ownership of AC returns after Estimation grooming. Further AC edits must go through PO.
{panel}