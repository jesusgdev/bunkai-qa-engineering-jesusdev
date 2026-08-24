---
name: batch-jira-operations-refinement
description: "Handle batch Jira operations with rate limiting, ADF conversion, parent field setting, and title standardization. Use when performing bulk operations on multiple Jira issues (TCs, Stories, Bugs) that require consistent formatting, rate-limiting compliance, and field standardization. Triggers on: batch enrich TCs, batch set parent, batch standardize titles, bulk update descriptions, batch Jira operations. Do NOT use for: single issue operations (use /acli), test execution (use /sprint-testing), test documentation (use /test-documentation)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker, tms]
---

# Batch Jira Operations Refinement

Execute bulk Jira operations with rate-limiting compliance, ADF conversion, parent field setting, and title standardization. Optimized for 50+ issue batches with minimal manual intervention.

## Scope

| Use for | Do not use for | Route instead |
|---------|----------------|---------------|
| Batch TC enrichment (50+ issues) | Single issue updates | `/acli` |
| Batch parent field setting | Test execution | `/sprint-testing` |
| Batch title standardization | Test documentation | `/test-documentation` |
| Batch ADF conversion | Ad-hoc Jira queries | `/acli` |

## Dependencies

- `test-documentation/SKILL.md` — TC Description template (§7)
- `acli/SKILL.md` — Jira CLI operations
- `acli/references/adf-authoring-style.md` — ADF formatting rules
- `md-to-adf.ts` — Markdown to ADF converter script

## Rate Limiting Rules

| Rule | Value | Notes |
|------|-------|-------|
| Jira Cloud limit | ~10 req/sec/user | Apply to all API calls |
| Batch size | 10 issues per batch | Prevents 429 errors |
| Pause between batches | 1 second | Allows rate limit recovery |
| Pause between issues | 0.5 seconds | Within batch safety |
| Retry logic | 3 attempts with exponential backoff | On 429/500 errors |

## Batch Processing Pattern

```
1. Load issue list (from file, JQL, or manual list)
2. Split into batches of 10
3. For each batch:
   a. Process each issue (GET info, generate content, PUT update)
   b. Pause 0.5s between issues
   c. Pause 1s between batches
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

**Pattern**: `^BK-\d+: TC\d+: .+`

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
BK-320
BK-321
BK-322
...
```

### Template Configuration
```json
{
  "template": "tc-enrichment-12-sections",
  "parentKey": "BK-70",
  "targetField": "description",
  "rateLimit": {
    "batchSize": 10,
    "pauseBetweenIssues": 0.5,
    "pauseBetweenBatches": 1
  }
}
```

## Output Format

### Progress Report
```
=== Batch Jira Operations ===
Total issues: 89
Batch size: 10
Total batches: 9

[Lote 1] Tests 1-10...
BK-320: 204 ✓
BK-321: 204 ✓
...
Pause 1s...

[Lote 2] Tests 11-20...
...

=== Final Report ===
Total processed: 89
Success: 89
Failed: 0
Rate limit errors: 0
```

## Quality Gates

- [ ] All issues return HTTP 204 on PUT
- [ ] Rate limiting compliance (no 429 errors)
- [ ] ADF structure validation (12 sections for TCs)
- [ ] Parent field verification (correct parent set)
- [ ] Title format validation (regex compliance)

## Error Handling

| Error | Cause | Action |
|-------|-------|--------|
| 429 | Rate limit exceeded | Pause 2s, retry |
| 400 | Invalid ADF structure | Regenerate ADF content |
| 404 | Issue not found | Skip, log, continue |
| 500 | Server error | Retry 3 times, then skip |

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
# Input: /tmp/bk-candidate-tests.txt (89 TCs)
# Process: Enrich with 12-section ADF template
# Output: 89 TCs with enriched descriptions
```

### Example 2: Batch Parent Field Setting
```bash
# Input: /tmp/bk-wave-tests.txt (94 TCs)
# Process: Set parent to BK-70
# Output: 94 TCs with parent BK-70
```

### Example 3: Batch Title Standardization
```bash
# Input: /tmp/bk-non-standard-titles.txt (44 TCs)
# Process: Standardize to BK-XX: TCYY: format
# Output: 44 TCs with standardized titles
```
