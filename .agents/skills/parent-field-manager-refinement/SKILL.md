---
name: parent-field-manager-refinement
description: "Set Jira parent field via REST API (workaround for acli limitation). Use when linking issues to parent epics, setting parent-child relationships, or organizing issues under a parent hierarchy. Triggers on: set parent field, link to epic, parent-child relationship, organize under epic. Do NOT use for: single issue linking (use /acli), test execution (use /sprint-testing), test documentation (use /test-documentation)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker]
---

# Parent Field Manager Refinement

Set Jira parent field via REST API. Workaround for acli limitation (cannot set parent field directly). Supports batch operations with rate-limiting compliance.

## Scope

| Use for | Do not use for | Route instead |
|---------|----------------|---------------|
| Set parent field via REST API | Single issue linking | `/acli` |
| Batch parent field setting | Test execution | `/sprint-testing` |
| Link issues to epics | Test documentation | `/test-documentation` |
| Organize issue hierarchy | Ad-hoc queries | `/acli` |

## Dependencies

- `acli/SKILL.md` — Jira CLI operations (for verification)
- `rate-limit-handler-refinement/SKILL.md` — Rate limiting for batch operations

## Jira Mutation Boundary

Read the configured Jira site, authenticated identity, target issue, current parent, issue type, and live edit metadata first. Produce a dry-run diff and wait for explicit approval before writing. Resolve the target parent from the configured QA epic name/key at runtime; never invent or copy a parent key from an example. Bound the issue list, checkpoint each result, support resume, read back the parent, and stop on auth/site mismatch. Report `unverified` when parent identity or read-back cannot be established.

`issue | current parent | target parent | action | status: verified|failed|skipped|unverified | checkpoint`

## acli Limitation

**Problem**: acli may not expose parent-field editing for the configured issue type; verify the current capability before using REST.
```
# This does NOT work:
[ISSUE_TRACKER_TOOL] workitem edit --key <ISSUE_KEY> --parent <PARENT_KEY>
```

**Solution**: Use Jira REST API directly
```bash
curl -s -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"fields": {"parent": {"key": "<PARENT_KEY>"}}}' \
  "{{issue_tracker.atlassian_url}}rest/api/3/issue/<ISSUE_KEY>"
```

## REST API Pattern

### Single Issue
```bash
# Set parent for single issue
curl -s -w "%{http_code}" -o /tmp/response.txt \
  -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"fields": {"parent": {"key": "PARENT_KEY"}}}' \
  "{{issue_tracker.atlassian_url}}rest/api/3/issue/{ISSUE_KEY}"

# Verify response
if [ "$RESPONSE" = "204" ]; then
  echo "Success"
fi
```

### Batch Operation
```bash
#!/bin/bash
PARENT_KEY="<runtime-resolved QA epic key>"
BATCH_SIZE="approved bounded value"
MAX_ELAPSED_MS="approved budget"

# Process in batches
TOTAL=${#ISSUES[@]}
for ((i=0; i<TOTAL; i+=BATCH_SIZE)); do
  BATCH=("${ISSUES[@]:$i:$BATCH_SIZE}")
  
  for ISSUE in "${BATCH[@]}"; do
    # Check current parent
    CURRENT_PARENT=$(curl -s -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
      -X GET -H "Content-Type: application/json" \
      "{{issue_tracker.atlassian_url}}rest/api/3/issue/$ISSUE" | jq -r '.fields.parent.key // "NONE"')
    
    if [ "$CURRENT_PARENT" != "$PARENT_KEY" ]; then
      RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.txt \
        -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
        -X PUT \
        -H "Content-Type: application/json" \
        -d "{\"fields\": {\"parent\": {\"key\": \"$PARENT_KEY\"}}}" \
        "{{issue_tracker.atlassian_url}}rest/api/3/issue/$ISSUE")
      
      if [ "$RESPONSE" = "204" ]; then
        echo "$ISSUE: ✓ (parent set to $PARENT_KEY)"
      else
        echo "$ISSUE: ✗ ($RESPONSE)"
      fi
    else
      echo "$ISSUE: ⊘ (already has parent $PARENT_KEY)"
    fi
    
    sleep $PAUSE_BETWEEN_ISSUES
  done
  
  sleep $PAUSE_BETWEEN_BATCHES
done
```

## Verification

### Check Parent Field
```bash
# Get current parent
PARENT=$(curl -s -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
  -X GET -H "Content-Type: application/json" \
  "{{issue_tracker.atlassian_url}}rest/api/3/issue/$ISSUE_KEY" | jq -r '.fields.parent.key // "NONE"')

echo "Current parent: $PARENT"
```

### Verify All Issues
```bash
#!/bin/bash
SOURCE_ENV=$1
HAS_PARENT=0
NO_PARENT=0

while IFS= read -r KEY; do
  PARENT=$(curl -s -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
    -X GET -H "Content-Type: application/json" \
    "{{issue_tracker.atlassian_url}}rest/api/3/issue/$KEY" | jq -r '.fields.parent.key // "NONE"')
  
  if [ "$PARENT" = "$TARGET_PARENT" ]; then
    ((HAS_PARENT++))
  else
    ((NO_PARENT++))
    echo "MISSING: $KEY (parent: $PARENT)"
  fi
done < /tmp/issues.txt

echo "Has parent: $HAS_PARENT"
echo "Missing parent: $NO_PARENT"
```

## Parent Resolution

| Parent Key | Purpose | Usage |
|------------|---------|-------|
| `{{qa.qa_epics.test_repository_epic.name}}` | `{{qa.qa_epics.test_repository_epic.key}}` | Test cases |
| `{{qa.qa_epics.test_artifacts_epic.name}}` | `{{qa.qa_epics.test_artifacts_epic.key}}` | Test artifacts |
| Runtime Story/epic | Runtime-resolved key | Only when explicitly approved |

## Error Handling

| Error | Cause | Action |
|-------|-------|--------|
| 204 | Success | Continue |
| 400 | Invalid parent key | Check parent key exists |
| 403 | Permission denied | Check user permissions |
| 404 | Issue not found | Skip, log, continue |
| 409 | Conflict | Check issue state |

## Engram Updates

After successful parent field setting, save:
- Pattern: parent field REST API setting
- Discovery: acli limitation for parent field
- Pattern: batch parent field operations

## Subagent Dispatch Strategy

For complex parent field operations, use subagents:
- **Orchestrator**: Manages batch progress
- **Worker subagents**: Process individual batches
- **Verifier subagent**: Validates all parents set

## Examples

### Example 1: Single Issue Parent Setting
```bash
# Input: approved issue needs a runtime-resolved QA parent
# Process: dry-run, approve, PUT, then read back
# Output: verified/failed/unverified parent result
```

### Example 2: Batch Parent Setting
```bash
# Input: approved issue list needs a runtime-resolved QA parent
# Process: Batch PUT with rate-limiting
# Output: partial verified/failed/unverified report with checkpoint
```

### Example 3: Parent Verification
```bash
# Input: approved issue list to verify
# Process: GET each issue, check parent
# Output: verified count, failed count, and unverified count
```
