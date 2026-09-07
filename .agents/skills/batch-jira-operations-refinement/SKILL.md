---
name: batch-jira-operations-refinement
description: "Handle batch Jira operations with rate limiting, ADF conversion, parent field setting, and title standardization. Use when performing bulk operations on multiple Jira issues (TCs, Stories, Bugs) that require consistent formatting, rate-limiting compliance, and field standardization. Triggers on: batch enrich TCs, batch set parent, batch standardize titles, bulk update descriptions, batch Jira operations. Do NOT use for: single issue operations (use /acli), test execution (use /sprint-testing), test documentation (use /test-documentation)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker, tms]
---

# Batch Jira Operations Refinement

Execute approved bulk Jira operations with rate-limiting compliance, ADF conversion, parent field setting, and title standardization. Batch size is runtime-configured and bounded.

## Scope

| Use for | Do not use for | Route instead |
|---------|----------------|---------------|
| Batch TC enrichment | Single issue updates | `/acli` |
| Batch parent field setting | Test execution | `/sprint-testing` |
| Batch title standardization | Test documentation | `/test-documentation` |
| Batch ADF conversion | Ad-hoc Jira queries | `/acli` |

## Dependencies

- `test-documentation/SKILL.md` — TC Description template (§7)
- `acli/SKILL.md` — Jira CLI operations
- `acli/references/adf-authoring-style.md` — ADF formatting rules
- `md-to-adf.ts` — Markdown to ADF converter script

## Jira Mutation Boundary

Inspect the configured site, auth identity, issue type, current values, and live edit metadata before planning writes. Produce a dry-run diff and obtain explicit approval before the first mutation. Bound approved issue keys and fields, checkpoint after each item/batch, support resume, and stop on auth/site mismatch, unknown field IDs, unknown parent keys, or ambiguous project scope. Never invent custom-field IDs or parent keys. Read back each write and report partial results; use `unverified` when evidence is unavailable.

`batch | item | action | status: verified|failed|skipped|unverified | evidence | checkpoint`

## Rate Limiting Rules

| Rule | Value | Notes |
|------|-------|-------|
| Service limit | Read response headers and project configuration | Do not assume an undocumented limit |
| Batch size | Explicitly configured and approved | Checkpoint each batch |
| Pause/retry | Honor `Retry-After`, otherwise bounded jittered backoff | Respect max elapsed time |
| Retry logic | Idempotency-aware and bounded | Do not retry non-idempotent writes blindly |

## Batch Processing Pattern

```
1. Load issue list (from file, JQL, or manual list)
2. Split into an approved, bounded batch size
3. For each batch:
   a. Process each issue (GET info, generate content, PUT update)
   b. Honor response guidance or configured jittered delay
   c. Save a resume checkpoint
4. Verify all issues updated
5. Generate report
```

## Operations Supported

### 1. Batch TC Enrichment

**Purpose**: Apply 12-section ADF template to multiple TCs

**Template Sections**:
1. Related Story
2. Priority / ROI
3. Prior bugs covered
4. Test Design - Preconditions
5. Test Design - Action
6. Test Design - Expected Results
7. Test Design - Gherkin
8. Variables
9. Implementation Code
10. Architecture
11. Available Test IDs
12. Refinement Notes

**Process**:
```bash
# For each TC in batch:
1. GET /rest/api/3/issue/{key} → extract summary, story info
2. Generate ADF content from template
3. PUT /rest/api/3/issue/{key} with ADF description
4. Verify HTTP 204 response
```

### 2. Batch Parent Field Setting

**Purpose**: Set parent field for multiple issues via REST API

**Process**:
```bash
# For each issue in batch:
1. GET /rest/api/3/issue/{key} → check current parent
2. If parent != target:
   PUT /rest/api/3/issue/{key} with {"fields": {"parent": {"key": "TARGET_KEY"}}}
3. Verify HTTP 204 response
```

**Note**: acli cannot set parent field — requires REST API

### 3. Batch Title Standardization

**Purpose**: Validate and correct TC title format

**Pattern**: `^{{PROJECT_KEY}}-\d+: TC\d+: .+` (resolve the key at runtime)

**Process**:
```bash
# For each TC in batch:
1. GET /rest/api/3/issue/{key} → extract summary
2. Validate against regex pattern
3. If invalid:
   PUT /rest/api/3/issue/{key} with corrected summary
4. Verify HTTP 204 response
```

### 4. Batch ADF Conversion

**Purpose**: Convert Markdown content to ADF format

**Process**:
```bash
# For each issue in batch:
1. GET /rest/api/3/issue/{key} → extract description
2. Convert Markdown to ADF using md-to-adf.ts
3. PUT /rest/api/3/issue/{key} with ADF description
4. Verify HTTP 204 response
```

## Input Format

### Issue List File
```
{{PROJECT_KEY}}-<issue-number>
{{PROJECT_KEY}}-<issue-number>
{{PROJECT_KEY}}-<issue-number>
...
```

### Template Configuration
```json
{
  "template": "tc-enrichment-12-sections",
  "parentKey": "{{qa.qa_epics.test_repository_epic.key}}",
  "targetField": "description",
  "rateLimit": {
    "batchSize": "approved bounded value",
    "maxElapsedMs": "approved budget",
    "retryAfter": "from response header when present"
  }
}
```

## Output Format

### Progress Report
```
=== Batch Jira Operations ===
Total issues: N
Batch size: configured value
Total batches: derived

[Batch 1] Items 1-N...
{{PROJECT_KEY}}-<issue-number>: verified
...
Pause 1s...

[Lote 2] Tests 11-20...
...

=== Final Report ===
Total processed: N
Verified: N
Failed: N
Unverified: N
```

## Quality Gates

- [ ] All issues return HTTP 204 on PUT
- [ ] Rate-limit handling used response headers, jitter, idempotency classification, and max elapsed time
- [ ] ADF structure validation against the configured TC template
- [ ] Parent field verification (correct parent set)
- [ ] Title format validation (regex compliance)

## Error Handling

| Error | Cause | Action |
|-------|-------|--------|
| 429 | Rate limit exceeded | Honor `Retry-After`; otherwise bounded jittered retry |
| 400 | Invalid ADF structure | Regenerate ADF content |
| 404 | Issue not found | Skip, log, continue |
| 500 | Server error | Retry within the configured max elapsed time, then mark failed/unverified |

## Engram Updates

After successful batch operation, save:
- Pattern: batch processing with rate-limiting
- Pattern: ADF conversion for TC enrichment
- Pattern: parent field REST API setting
- Discovery: acli limitation for parent field

## Subagent Dispatch Strategy

For complex batch operations, use subagents:
- **Orchestrator**: Main thread manages batch progress
- **Worker subagents**: Process individual batches
- **Verifier subagent**: Validates all issues updated

## Examples

### Example 1: Batch TC Enrichment
```bash
# Input: approved issue-list file
# Process: dry-run, approve, enrich, read back
# Output: verified/failed/unverified partial report and resume checkpoint
```

### Example 2: Batch Parent Field Setting
```bash
# Input: approved issue-list file and runtime-resolved QA repository epic key
# Process: set parent only after key verification and approval
# Output: verified/failed/unverified partial report and resume checkpoint
```

### Example 3: Batch Title Standardization
```bash
# Input: approved issue-list file
# Process: Standardize to <PROJECT_KEY>-<n>: TCYY: format
# Output: verified/failed/unverified partial report and resume checkpoint
```
