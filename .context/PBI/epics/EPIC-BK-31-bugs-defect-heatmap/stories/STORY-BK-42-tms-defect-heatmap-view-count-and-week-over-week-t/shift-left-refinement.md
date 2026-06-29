# Shift-Left Refinement - BK-42

## Metadata Snapshot

| Field | Value |
|---|---|
| Key | BK-42 |
| Title | TMS-Defect Heatmap - View count and week-over-week trend per module |
| Type | Story |
| Status | Estimation at latest read-back; no status transition was performed by QA publication |
| Priority | Medium |
| Jira Story Points | 1 |
| QA Story Points Recommendation | 3 SP, confidence 0.70 |
| Epic | BK-31 - Bugs & Defect Heatmap |
| Source spec | BK-027 / FEAT-033 / FR 7.3 |
| Labels | shift-left-reviewed, shift-left-2026-06-27 |
| Live editable Story fields | AC `customfield_10063`, ATP `customfield_10067`, ATR `customfield_10147`, Story Points `customfield_10035` |
| Created | 2026-05-28 |
| Updated | 2026-06-27 |
| Reporter | Ely |
| Assignee | jesusgpythondev |

## User Story

As a QA Lead, I want to view a defect heatmap showing defect count and week-over-week trend per module over a chosen window, so that I can see at a glance where quality is degrading without reading through every defect.

## Source & Evidence

| Source | Evidence | Label |
|---|---|---|
| Jira BK-42 Story | DoD requires one cell per module, defect count, week-over-week trend, selectable window, hotspot emphasis, prompt freshness, zero-defect distinction, and module path. | Jira |
| Jira BK-42 live REST read-back before publication | Issue was a Story in Backlog; labels were empty; live AC field had 6 code blocks but no single `gherkin` code block publication shape. | Jira |
| Jira BK-42 live REST read-back after publication | AC field has one `gherkin` code block, ATP field is present, labels are applied, description contains QA Refinements, QA mirror comment `11828` was created. | Jira |
| Jira BK-42 traceability addendum read-back | Description and comment `11829` contain explicit Shift-Left Traceability & Bug Status Addendum, including "no product bug found" and dependency/source lineage. Latest status observed as Estimation. | Jira |
| Jira BK-42 editmeta | Live editable fields are AC `customfield_10063`, ATP `customfield_10067`, ATR `customfield_10147`, Story Points `customfield_10035`. | Jira |
| BK-41 shift-left package | Reusable decisions: BK-40 schema dependency, RLS/IDOR returns 403, archived modules hidden by default, subtree logic via module hierarchy, 2 SP anchor for read-only list/filter with aggregates. | Engram / Jira |
| `../upex-bunkai-tms/.context/SRS/functional-specs.md` | BK-027 says heatmap reads `module_defect_stats` joined to modules and returns count plus week-over-week trend. | Repo |
| `../upex-bunkai-tms/.context/SRS/api-contracts.yaml` | Planned `GET /projects/{project_id}/defect-heatmap?window=30d` exists but response schema is thin. | Repo |
| `../upex-bunkai-tms/.context/master-implementation-plan.md` | Sprint 5 exit criteria says a bug filed from a failing Run appears in the heatmap within 5 seconds; MV refresh-on-insert is the intended mechanism. | Repo |
| `../upex-bunkai-tms/supabase/migrations/0014_module_soft_delete.sql` | `bugs` table does not exist yet and future bug/archive behavior must be extended when bugs land. | Repo |
| `../upex-bunkai-tms/app/(app)/projects/[projectSlug]/mind-map-view.tsx` | Bug-density mode is disabled as coming soon because run/bug data does not exist yet. | Repo |

## Shift-Left Review Status

Ready for estimation from QA perspective, conditional on Dev accepting the BK-40/BK-41 dependencies and the heatmap stats contract below.

No true `NEEDS PO/DEV CONFIRMATION` item remains under the BK-41 decision gate. The remaining decisions are reversible MVP contract choices made by the expert panel and must be represented in canonical ACs.

## Expert Review Summary

| Role | Finding | Decision / Recommendation | Evidence |
|---|---|---|---|
| Senior Product Owner | The QA Lead needs a hotspot read, not a custom analytics workbench. | Keep v1 windows fixed at `7d`, `30d`, `90d`; default is `30d`; no custom date range in BK-42. | Jira + Repo + Inference |
| Senior Product Owner | Module cells should represent product areas. | `defect_count` rolls up defects for the module and its descendant modules. | Repo + Inference |
| Senior UX/Design | Zero modules and hotspots must be distinguishable without reading raw lists. | Show all active modules, including zero-defect modules, with count text, legend, non-color cues, and full module path. | Jira + Inference |
| Technical Architect | The SRS/OpenAPI response shape is too thin for testable UI behavior. | API response must include window metadata, freshness/as-of time, module path/name, current/previous week counts, trend direction, and trend percent. | Repo + Inference |
| Senior Developer | Week-over-week is ambiguous without math rules. | Trend compares the latest 7-day UTC bucket against the immediately previous 7-day UTC bucket; selected window controls defect count. | Repo + Inference |
| Senior Developer | Prompt freshness is testable only with an SLA. | A successfully filed BK-40 defect appears in heatmap counts within 5 seconds after refresh/polling reads the updated stats. | Repo |
| Senior QA Lead | Current DoD requires 1:N expansion. | Refine to 11 canonical Gherkin scenarios and a 20-row ATP draft. | Jira + Engram |
| Senior AppSec | Heatmap aggregate counts can leak project/module presence. | Unauthenticated requests return 401; unauthorized project access returns 403, not fake empty modules. | Engram + Inference |
| Delivery/Scrum Lead | BK-42 depends on data created by BK-40 and contract decisions from BK-41. | Keep one Story unless MV/stats API is not ready at Dev start; split API stats first and UI heatmap second only if needed. | Jira + Repo + Inference |
| Automation Advisor | This is automation-worthy once the contract stabilizes. | Automate API math/freshness first; UI assertions should focus on labels, legend, path, and non-color cues. | Inference |
| Skeptical Reviewer | Jira's 1 SP underestimates visualization plus trend/stats/security risk. | QA advisory estimate: 3 SP; re-estimate to 5 SP if custom ranges, realtime subscriptions, or MV design from scratch expand. | Engram + Repo + Inference |

## Scope

In scope:

- `GET /api/v1/projects/{project_id}/defect-heatmap` or equivalent routed API contract for the defect heatmap.
- Heatmap data for active modules in a project.
- Defect counts over fixed selected windows: `7d`, `30d`, `90d`.
- Default window `30d`.
- Week-over-week trend based on latest 7-day UTC bucket versus previous 7-day UTC bucket.
- Module plus descendant rollup count.
- Zero-defect module display.
- Full module path display for nested or duplicate names.
- Hotspot emphasis with accessible non-color cues.
- Freshness from BK-40 defect filing into heatmap counts within 5 seconds of updated stats read.
- Auth/project isolation for aggregate data.

Out of scope:

- Defect filing UI/API itself (BK-40).
- Defect list/filter UI/API itself (BK-41).
- Jira outbound bug sync (BK-43 or later source spec BK-028).
- Defect lifecycle transitions.
- Custom arbitrary date ranges.
- Realtime subscription/channel implementation beyond the agreed freshness SLA.
- Bidirectional Jira sync.
- Formal test cases or automation code.

Deferred/follow-up candidates:

- Split into API stats endpoint + UI heatmap only if the MV/stats substrate is not ready at Dev start.
- Future `include_archived=true` reporting option if PO wants archived module analytics.
- Future severity/status heatmap filters after BK-41 filter contracts stabilize.

## Dependency Map

| Dependency | Owner | Status | Impact |
|---|---|---|---|
| BK-40 - Defect Filing | Dev | Ready For Dev at refinement time | Must ship `bugs` schema, `POST /bugs`, severity/status/module fields, and successful bug creation source data. |
| BK-41 - Defect List/Filter | Dev / QA | Estimation after shift-left | Provides reusable auth, archived-module default, subtree/aggregate and API conventions. |
| `module_defect_stats` materialized view or equivalent stats substrate | Architect / Dev | Planned only | Required for count, trend, freshness, and NFR viability. |
| Module hierarchy | Existing substrate | Implemented | Heatmap depends on `modules.parent_module_id`, `path`, `archived_at`, and path display helpers. |
| OpenAPI route/schema | Architect / Dev | Source SRS has minimal contract; generated public OpenAPI does not expose heatmap yet | Must be patched before `/test-automation` or generated clients rely on it. |
| RLS/project membership guard | AppSec / Dev | Existing pattern, heatmap not implemented | Must guard aggregate stats before reading MV rows. |

## Key Contract Decisions

1. Heatmap defaults to `window=30d`; supported v1 windows are `7d`, `30d`, and `90d`.
2. Invalid `window` values return 400 with an `invalid_window` style error; arbitrary custom date ranges are out of scope.
3. Defect counts use UTC half-open boundaries `[start_at, end_at)` for the selected window.
4. Each module cell counts defects filed against that module and all descendant modules.
5. Only active modules are returned by default; archived modules and archived subtrees are hidden by default, matching BK-41.
6. Zero-defect active modules are returned with `defect_count: 0`; they are not omitted.
7. Week-over-week trend compares latest 7-day UTC bucket against the immediately previous 7-day UTC bucket.
8. Trend direction enum is `rising`, `falling`, or `flat`.
9. Trend percent is nullable when previous week count is 0 and current week count is greater than 0; direction is still `rising`.
10. If both previous and current week counts are 0, direction is `flat` and `trend_pct` is 0.
11. If current week count is 0 and previous week count is greater than 0, direction is `falling` and `trend_pct` is -100.
12. API response must expose enough data for testable UI: window metadata, `as_of` or `refreshed_at`, module id/name/path, `defect_count`, `current_week_count`, `previous_week_count`, `trend_direction`, `trend_pct`.
13. Unauthenticated access returns 401; authenticated users without project membership return 403, not an empty heatmap.
14. Hotspot emphasis cannot be color-only; UI must include count text, legend, trend icon/label, and accessible names.

## AC Reconciliation

| Original / source claim | Refined outcome | Reason |
|---|---|---|
| One cell per module with defect count over chosen window | AC-1, AC-2, AC-3 | Adds active-module inclusion, subtree rollup, fixed supported windows, UTC boundaries. |
| Trend indicator rising/falling/flat | AC-4, AC-5, AC-6 | Defines baseline, percent edge cases, and direction semantics. |
| Window can be chosen | AC-3, AC-11 | Makes options and invalid handling testable. |
| Modules with more defects visually emphasized | AC-7 | Adds accessible, non-color-only requirement. |
| Freshly filed defect appears promptly | AC-10 | Converts vague promptness into 5-second stats freshness expectation from source plan. |
| Zero defects distinguishable from hotspots | AC-8 | Requires included zero modules and neutral/clean display. |
| Module path shown | AC-9 | Covers duplicate nested module names. |
| Existing Jira AC has 6 code blocks | Replace with one canonical fenced Gherkin block when publishing | Current live field lacks full risk coverage and is not in the required single `gherkin` codeBlock shape. |

## Refined Acceptance Criteria

```gherkin
@happy
Scenario: Heatmap returns one active module cell per project module
  Given Mateo is an authorized QA Lead for project "Storefront"
  And the project has active modules "Checkout", "Cart", and "Search"
  When Mateo opens the defect heatmap with the default window
  Then the heatmap uses the 30-day window
  And it shows one cell for each active module
  And each cell includes the module name, full module path, defect count, and trend indicator

@happy
Scenario: Module defect counts roll up descendant module defects inside the selected window
  Given module "Checkout" has child module "Checkout / Payment"
  And 2 defects were filed against "Checkout" in the last 30 days
  And 3 defects were filed against "Checkout / Payment" in the last 30 days
  When Mateo views the 30-day heatmap
  Then the "Checkout" cell shows a defect count of 5
  And the "Checkout / Payment" cell remains visible with its own defect count

@happy
Scenario: User can switch between supported heatmap windows
  Given "Cart" has 1 defect in the last 7 days, 4 defects in the last 30 days, and 8 defects in the last 90 days
  When Mateo switches the heatmap window between 7d, 30d, and 90d
  Then the "Cart" count updates to 1, 4, and 8 respectively
  And the selected window is visible to the user

@happy
Scenario: Week-over-week trend uses the latest 7-day UTC bucket versus the previous 7-day UTC bucket
  Given "Checkout" has 9 defects in the latest 7-day UTC bucket
  And "Checkout" had 4 defects in the immediately previous 7-day UTC bucket
  When Mateo views the defect heatmap
  Then the "Checkout" cell shows trend direction "rising"
  And it exposes the current week count of 9 and previous week count of 4
  And it shows a week-over-week increase of approximately 125 percent

@boundary
Scenario: Trend handles zero previous-week baseline without infinite percent
  Given "Search" had 0 defects in the previous 7-day UTC bucket
  And "Search" has 2 defects in the latest 7-day UTC bucket
  When Mateo views the defect heatmap
  Then the "Search" cell shows trend direction "rising"
  And the trend percent is shown as not applicable or null rather than infinity
  And the user can still see that the module degraded from zero to two defects

@boundary
Scenario: Trend handles zero current and previous-week counts as flat
  Given "Settings" had 0 defects in the previous 7-day UTC bucket
  And "Settings" has 0 defects in the latest 7-day UTC bucket
  When Mateo views the defect heatmap
  Then the "Settings" cell shows trend direction "flat"
  And the trend percent is 0
  And the module is displayed as a clean zero-defect module

@happy @accessibility
Scenario: Hotspots are emphasized with accessible non-color-only cues
  Given "Checkout" has the highest defect count in the selected window
  And "Search" has 0 defects in the selected window
  When Mateo views the heatmap
  Then "Checkout" is visually emphasized as the strongest hotspot
  And the emphasis includes count text plus a legend or label, not color alone
  And trend direction is exposed with an icon or text label accessible to assistive technology

@boundary
Scenario: Zero-defect active modules stay visible and clearly distinct from hotspots
  Given "Search" has no defects in the selected 30-day window
  When Mateo views the heatmap
  Then the "Search" cell is visible with defect count 0
  And it uses neutral or clean styling clearly distinct from hotspot modules

@happy
Scenario: Full module paths disambiguate duplicate nested module names
  Given "Checkout" has a child module named "Payment"
  And "Settings" has a child module named "Payment"
  When Mateo views the heatmap
  Then each "Payment" cell displays its full path
  And Mateo can distinguish "Checkout / Payment" from "Settings / Payment"

@integration
Scenario: Freshly filed defect appears in heatmap within the agreed freshness SLA
  Given Elena successfully files a P2 defect against module "Search" through BK-40
  And Mateo is authorized to view the same project heatmap
  When Mateo refreshes or the heatmap polling reads updated stats within 5 seconds
  Then the "Search" cell includes the new defect in its selected-window count
  And the heatmap exposes an updated freshness timestamp or as-of value

@negative
Scenario: Invalid window and unauthorized project access fail without leaking aggregate data
  Given Mateo is authenticated
  When he requests the defect heatmap with unsupported window "365d"
  Then the API returns 400 with an invalid window error
  When a user without project membership requests the same project heatmap
  Then the API returns 403
  And it does not return module names, paths, defect counts, or zeroed aggregate data
```

## Business Rules

| Rule | Status | Evidence |
|---|---|---|
| Default heatmap window is `30d`. | Expert Decision | Jira + Repo + Inference |
| Supported v1 windows are `7d`, `30d`, and `90d`. | Expert Decision | Inference |
| Counts use selected-window defect creation or filing time with UTC `[start_at, end_at)` boundaries. | Expert Decision | Repo + Inference |
| Counts include module and descendant module defects. | Expert Decision | Repo + Inference |
| Trend compares latest 7-day UTC bucket to previous 7-day UTC bucket. | Expert Decision | Jira + Repo + Inference |
| Active modules with zero defects are included. | Confirmed | Jira |
| Archived modules and archived subtrees are hidden by default. | Expert Decision inherited from BK-41 | Engram + Repo |
| Status/severity filters are out of scope for BK-42 v1. | Expert Decision | Jira + Repo |
| Freshness target is visible in heatmap within 5 seconds after successful bug filing and stats refresh/read. | Confirmed by implementation plan | Repo |
| Unauthorized project access returns 403 and does not fake empty stats. | Expert Decision inherited from BK-41 | Engram + Inference |

## Edge Cases & Risk Matrix

| Risk | Severity | Expected behavior | Mitigation | AC / ATP coverage |
|---|---|---|---|---|
| Week-over-week baseline ambiguity | High | Latest 7-day UTC bucket compared to immediately previous 7-day UTC bucket. | Canonical trend ACs and API metadata. | AC-4, AC-5, AC-6; ATP-6 to ATP-10 |
| Cross-project aggregate leak | High | Unauthorized project access returns 403 without module/count data. | Project membership guard before MV read. | AC-11; ATP-18, ATP-19 |
| Freshness promise too vague | High | Newly filed successful defect appears within 5 seconds after stats refresh/read. | Define SLA and expose `as_of` or `refreshed_at`. | AC-10; ATP-16, ATP-17 |
| Color-only heatmap signal | High | Count, label/icon, legend, and accessible names communicate hotspot/trend. | UX/accessibility AC and visual ATP rows. | AC-7; ATP-13, ATP-14 |
| Window boundary off-by-one | Medium | UTC half-open boundaries; invalid windows rejected. | API validation and boundary ATP. | AC-3, AC-11; ATP-4, ATP-5, ATP-20 |
| Previous-week zero baseline | Medium | `trend_pct` null/not applicable, direction rising when current is positive. | Explicit AC/API rule. | AC-5; ATP-8 |
| Duplicate nested module names | Medium | Full path shown in each cell. | Path disambiguation AC. | AC-9; ATP-15 |
| Archived module defects contaminating active heatmap | Medium | Archived modules/subtrees hidden by default. | Active-module filter inherited from BK-41. | AC-1, AC-2; ATP-3 |
| MV/stats substrate not ready | Medium | Story remains estimable but Dev start is conditional; split if substrate is missing. | Delivery gate and re-estimation trigger. | Readiness gate |

## ATP Draft Matrix

| ID | Priority | Category | Scenario outline | Precondition | Expected result | Automation hint |
|---|---|---|---|---|---|---|
| ATP-1 | P0 | Positive | Default heatmap returns active module cells | Authorized project with active modules | One cell per active module; default 30d shown | API + UI |
| ATP-2 | P0 | Positive | Selected-window counts update for 7d/30d/90d | Defects distributed across dates | Counts match selected fixed window | API |
| ATP-3 | P1 | Boundary | Archived modules hidden by default | Active and archived module branches exist | Archived branch absent from default heatmap | API |
| ATP-4 | P1 | Boundary | UTC start boundary included | Defect at exact `start_at` | Defect counted | API |
| ATP-5 | P1 | Boundary | UTC end boundary excluded | Defect at exact `end_at` | Defect not counted in current window | API |
| ATP-6 | P0 | Trend | Rising trend | Current week greater than previous week | Direction rising and positive percent | API + UI |
| ATP-7 | P0 | Trend | Falling trend | Current week lower than previous week | Direction falling and negative percent | API + UI |
| ATP-8 | P0 | Trend | Previous zero, current positive | Previous 0, current > 0 | Direction rising, trend percent null/not applicable | API + UI |
| ATP-9 | P1 | Trend | Both weeks zero | Previous 0, current 0 | Direction flat, percent 0 | API + UI |
| ATP-10 | P1 | Trend | Current zero, previous positive | Previous > 0, current 0 | Direction falling, percent -100 | API + UI |
| ATP-11 | P0 | Module hierarchy | Parent rollup includes descendants | Parent and child have defects | Parent count includes child defects | API |
| ATP-12 | P1 | Module hierarchy | Child cell still visible | Parent rollup data exists | Child module has its own cell | UI |
| ATP-13 | P0 | Visual / a11y | Hotspot is not color-only | One module has max count | Count, label/icon, legend communicate hotspot | UI |
| ATP-14 | P1 | Visual / a11y | Trend cue accessible | Trend indicators rendered | Accessible name/text exposes trend | UI |
| ATP-15 | P1 | UX | Duplicate names disambiguated by path | Two nested modules share name | Full paths distinguish cells | UI |
| ATP-16 | P0 | Integration | New defect updates heatmap count | BK-40 defect filing succeeds | Count increases within 5 seconds after stats read | API + integration |
| ATP-17 | P1 | Integration | Freshness metadata updates | Stats refresh occurs | `as_of`/`refreshed_at` reflects current stats read | API |
| ATP-18 | P0 | Security | Unauthenticated heatmap request | No valid token | 401, no heatmap data | API |
| ATP-19 | P0 | Security | Cross-project unauthorized request | Valid user without membership | 403, no module/count data | API |
| ATP-20 | P1 | Negative | Unsupported window rejected | Request uses `365d` | 400 invalid window error | API |

Coverage estimate:

| Positive | Negative | Boundary | Integration | API | Total |
|---:|---:|---:|---:|---:|---:|
| 5 | 3 | 5 | 2 | 15 | 20 |

Rationale: BK-42 combines API stats, trend math, module hierarchy, visual heatmap behavior, freshness, and aggregate security. Coverage is intentionally heavier than BK-41 because BK-42 adds user-visible visualization and time-window/trend semantics on top of aggregate reads.

## QA Story Points Recommendation

- Recommendation: 3 SP
- Confidence: 0.70
- Basis: effort=Medium; complexity=Medium-High; uncertainty=Medium; risk=Medium
- Rationale: BK-41 was 2 SP for read-only list/filter with subtree, aggregates, and RLS; BK-42 adds trend math, fixed-window validation, MV freshness, heatmap UI/accessibility, and aggregate-leak controls.
- Re-estimation triggers: arbitrary custom date ranges; realtime subscription requirement; MV/stats substrate missing at Dev start; archived reporting added; severity/status filters added; OpenAPI response contract changes materially.
- Boundary: QA recommendation only; Jira Story Points / Epic / User Story fields remain canonical unless the user explicitly requests an update.

## Open Clarifications With Expert Recommendations

| Question | Expert recommendation | Pending owner |
|---|---|---|
| Should trend compare selected window against previous equal-length window? | No for v1. Keep strict week-over-week as latest 7-day UTC bucket vs previous 7-day UTC bucket. | None |
| Should custom date ranges be supported? | No for v1. Use fixed `7d`, `30d`, `90d`. | None |
| Should archived modules be included? | No for v1. Hide by default, matching BK-41. | None |
| Should status/severity filters be included in heatmap? | No for BK-42. Keep as future enhancement after BK-41 list filters are stable. | None |
| Should freshness mean realtime push? | No. Use stats freshness/read-after-refresh SLA of 5 seconds; realtime channels are out of scope. | None |

## Implementation Readiness Gates

| Gate | Status | Notes |
|---|---|---|
| PO contract | Pass | Reversible MVP decisions made by expert panel. |
| Dev feasibility | Conditional | Requires BK-40 `bugs` schema and heatmap stats/MV design. |
| QA testability | Pass | 11 ACs and 20 ATP rows make vague DoD testable. |
| Data/API | Conditional | Source API schema must be expanded before generated clients/automation rely on it. |
| UX | Pass | Visual/accessibility and zero-state contracts are explicit. |
| Security/Ops | Pass with gate | Must enforce project membership before aggregate read; 401/403 covered. |
| Delivery | Conditional | Keep one Story unless MV/stats API is not ready at Dev start. |

## Handoff Notes

- PO: Accept fixed windows and active-module-only reporting for v1; future custom analytics can be a separate Story.
- Dev: Patch OpenAPI response shape and decide MV daily-bucket strategy before implementation.
- QA: Prioritize API math/security/freshness checks before visual heatmap assertions.
- Automation: Candidate for API automation first; UI checks should avoid color-only assertions and use stable labels/selectors.
- AppSec: Treat heatmap as aggregate data leak surface; unauthorized project access must return 403.
- Delivery: If BK-40 or stats substrate is not ready, split API/stats foundation before UI heatmap.

## QA Handoff Mirror

> [!INFO]
> BK-42 shift-left refinement published to Jira. QA/PO/Dev now have a testable contract before implementation.

| Area | Summary |
|---|---|
| Readiness | Ready for estimation from QA perspective, conditional on BK-40 and heatmap stats contract. |
| Main delta | Existing ACs need replacement with one canonical 11-scenario Gherkin block. |
| Contract decisions | Fixed windows `7d/30d/90d`, default `30d`, subtree rollup, active modules only, 5-second freshness, 401/403 security behavior. |
| High risks | WoW ambiguity, aggregate leak, vague freshness, color-only hotspot cues. |
| ATP | 20 outline rows: 5 count/window, 5 trend/boundary, 2 module hierarchy, 3 visual/UX, 2 freshness, 3 security/negative. |
| QA SP | 3 SP, confidence 0.70; Jira canonical estimate unchanged until explicitly requested. |
| Publication | Published to Jira: AC `customfield_10063`, ATP `customfield_10067`, description QA Refinements, QA mirror comment `11828`, traceability addendum comment `11829`, labels applied. |

## Publication Checklist

- Description updated: yes; compact `QA Refinements (Shift-Left Analysis)` section appended while preserving original Story content
- AC field updated: yes; live field `customfield_10063`, one fenced `gherkin` code block verified by REST read-back
- ATP DRAFT field or fallback comment updated: yes; live field `customfield_10067`
- QA Handoff Mirror comment/field updated: yes; comment `11828`
- QA story points recommendation included: yes; 3 SP advisory, Jira Story Points unchanged at 1
- Labels applied: yes; `shift-left-reviewed`, `shift-left-2026-06-27`
- Transition status: no transition requested/performed; live status remains Backlog
- Rendered/read-back verification: yes; REST read-back confirms AC codeBlock language, ATP presence, labels, description summary, and mirror comment
- Post-publication audit: yes
- Ownership handback: PO/Dev for estimation and dependency acceptance

## Traceability Addendum Publication

- Description updated with `Shift-Left Traceability & Bug Status Addendum`: yes
- Jira comment added: yes, comment `11829`
- Explicit source lineage added: BK-31, BK-027 / FEAT-033 / FR 7.3, BK-40, BK-41
- Explicit implementation gates added: OpenAPI heatmap schema, `module_defect_stats` / stats substrate, project-membership aggregate auth guard
- Explicit bug status added: no product bug found; pre-development dependency/specification gates only
- Read-back verification: yes; description and comment contain the addendum, comment has tables and panel nodes
- Status note: latest read-back shows Estimation; no status transition was performed during QA publication

## References

- Jira BK-42
- Jira BK-31
- Jira BK-40
- Jira BK-41 local shift-left refinement artifact
- `../upex-bunkai-tms/.context/SRS/functional-specs.md`
- `../upex-bunkai-tms/.context/SRS/api-contracts.yaml`
- `../upex-bunkai-tms/.context/master-implementation-plan.md`
- `../upex-bunkai-tms/.context/business/business-feature-map.md`
- `../upex-bunkai-tms/supabase/migrations/0014_module_soft_delete.sql`
- `../upex-bunkai-tms/app/(app)/projects/[projectSlug]/mind-map-view.tsx`
- Engram #402, #404, #407
