---
name: title-standardizer-refinement
description: "Validate and correct TC title format in batch. Ensures consistent naming convention across all test cases. Triggers on: standardize titles, fix TC format, validate naming convention, batch title correction. Do NOT use for: single title updates (use /acli), test execution (use /sprint-testing), test documentation (use /test-documentation)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker]
---

# Title Standardizer Refinement

Validate and correct TC title format in batch. Ensures consistent naming convention across all test cases with minimal manual intervention.

## Scope

| Use for | Do not use for | Route instead |
|---------|----------------|---------------|
| Batch title validation | Single title updates | `/acli` |
| Batch title correction | Test execution | `/sprint-testing` |
| Naming convention enforcement | Test documentation | `/test-documentation` |
| Title format reporting | Ad-hoc queries | `/acli` |

## Dependencies

- `acli/SKILL.md` — Jira CLI operations
- `rate-limit-handler-refinement/SKILL.md` — Rate limiting for batch operations

## Jira Mutation Boundary

Read the configured site, auth identity, current summaries, issue type, and live edit metadata first. Produce a dry-run correction list and obtain explicit approval before writing. Resolve the project key from `{{PROJECT_KEY}}`; do not infer it from an example. Bound approved issue keys, checkpoint progress, support resume, read back every changed summary, and stop on auth/site mismatch. Report `unverified` when source or read-back evidence is unavailable.

`issue | old title | proposed title | status: verified|failed|skipped|unverified | evidence | checkpoint`

## Title Format Rules

### Standard TC Title Pattern
```
^{STORY_KEY}: TC{NUMBER}: should {EXPECTED_OUTCOME} [{CONNECTOR} {CONDITION}] [given {PRECONDITION}]
```

### Regex Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `^{{PROJECT_KEY}}-\d+: TC\d+: .+$` | Standard TC format | `<PROJECT_KEY>-<n>: TC01: should start a Run` |
| `^{{PROJECT_KEY}}-\d+: TC\d+:` | TC prefix only | `<PROJECT_KEY>-<n>: TC01:` |
| `^{{PROJECT_KEY}}-\d+:` | Story prefix only | `<PROJECT_KEY>-<n>:` |

### Validation Rules

| Rule | Pattern | Notes |
|------|---------|-------|
| Story key prefix | `^{{PROJECT_KEY}}-\d+:` | Must start with story key |
| TC number | `TC\d+:` | Sequential numbering |
| Description | `should .+` | Must start with "should" |
| Max length | 255 chars | Jira Summary limit |

## Validation Process

### Step 1: Extract Titles
```bash
# Get all Test work items through the configured issue tracker with explicit pagination.
[ISSUE_TRACKER_TOOL] Search Issues:
  jql: project = {{PROJECT_KEY}} AND issuetype = Test ORDER BY key
  paginate: true
  fields: [summary, issuetype]
```

### Step 2: Validate Format
```bash
#!/bin/bash
VALID=0
INVALID=0

while IFS= read -r LINE; do
  KEY=$(echo "$LINE" | awk '{print $1}')
  TITLE=$(echo "$LINE" | cut -d' ' -f2-)
  
  if echo "$TITLE" | grep -qE "^{{PROJECT_KEY}}-[0-9]+: TC[0-9]+: .+$"; then
    ((VALID++))
  else
    ((INVALID++))
    echo "INVALID: $KEY - $TITLE"
  fi
done < /tmp/all-tcs.txt

echo "Valid: $VALID"
echo "Invalid: $INVALID"
```

### Step 3: Generate Corrections
```bash
#!/bin/bash
# Generate corrected titles
while IFS= read -r LINE; do
  KEY=$(echo "$LINE" | awk '{print $1}')
  TITLE=$(echo "$LINE" | cut -d' ' -f2-)
  
  # Extract story key only when the title contains exactly one unambiguous key.
  STORY_KEY=$(echo "$TITLE" | grep -oE "{{PROJECT_KEY}}-[0-9]+" | head -1)
  
  # Extract TC number
  TC_NUM=$(echo "$TITLE" | grep -oE "TC[0-9]+" | head -1)
  
  # Extract description
  DESC=$(echo "$TITLE" | sed -E "s/^{{PROJECT_KEY}}-[0-9]+: TC[0-9]+: //")
  
  # Generate a proposal only when story key, TC number, and expected outcome are present.
  # Ambiguous or semantically incomplete titles remain unverified for human review.
  CORRECTED="$STORY_KEY: $TC_NUM: $DESC"
  
  echo "$KEY|$CORRECTED"
done < /tmp/all-tcs.txt > /tmp/corrections.txt
```

### Step 4: Apply Corrections
```bash
#!/bin/bash
BATCH_SIZE=10
PAUSE_BETWEEN_ISSUES=0.5
PAUSE_BETWEEN_BATCHES=1

while IFS='|' read -r KEY NEW_TITLE; do
  # Get current title
  CURRENT_TITLE=$(curl -s -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
    -X GET -H "Content-Type: application/json" \
    "{{issue_tracker.atlassian_url}}rest/api/3/issue/$KEY" | jq -r '.fields.summary')
  
  if [ "$CURRENT_TITLE" != "$NEW_TITLE" ]; then
    RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.txt \
      -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
      -X PUT \
      -H "Content-Type: application/json" \
      -d "{\"fields\": {\"summary\": \"$NEW_TITLE\"}}" \
      "{{issue_tracker.atlassian_url}}rest/api/3/issue/$KEY")
    
    if [ "$RESPONSE" = "204" ]; then
      echo "$KEY: ✓"
    else
      echo "$KEY: ✗ ($RESPONSE)"
    fi
  else
    echo "$KEY: ⊘ (already correct)"
  fi
  
  sleep $PAUSE_BETWEEN_ISSUES
done < /tmp/corrections.txt
```

## Common Title Issues

| Issue | Example | Fix |
|-------|---------|-----|
| Missing TC number | `<PROJECT_KEY>-<n>: should start a Run` | Add TC01: |
| Wrong format | `<PROJECT_KEY>-<n>-TC01-should start` | Replace `-` with `: ` |
| Missing "should" | `<PROJECT_KEY>-<n>: TC01: start a Run` | Add "should" |
| Too long | `<PROJECT_KEY>-<n>: TC01: should start...very long` | Propose a semantic shortening; never truncate automatically |

## Reporting

### Validation Report
```
=== Title Validation Report ===
Total TCs: N
Valid format: N
Invalid format: N

=== Invalid Titles ===
<PROJECT_KEY>-<n>: TC01: should start a Run (missing "should")
<PROJECT_KEY>-<n>: TC02: start a Run (missing "should")
...
```

### Correction Report
```
=== Title Correction Report ===
Total TCs: N
Already correct: N
Corrected: N
Failed: N
Unverified: N

=== Corrections Applied ===
<PROJECT_KEY>-<n>: verified
<PROJECT_KEY>-<n>: verified
...
```

## Engram Updates

After successful title standardization, save:
- Pattern: TC title format validation
- Pattern: batch title correction
- Discovery: common title issues and fixes

## Subagent Dispatch Strategy

For complex title standardization, use subagents:
- **Validator subagent**: Validates all titles
- **Corrector subagent**: Generates corrections
- **Applier subagent**: Applies corrections

## Examples

### Example 1: Single Title Validation
```bash
# Input: <PROJECT_KEY>-<n>: TC01: should start a Run
# Process: Validate against regex
# Output: Valid ✓
```

### Example 2: Batch Title Correction
```bash
# Input: approved issue-list with invalid titles
# Process: Generate and apply corrections
# Output: verified/failed/unverified partial report and resume checkpoint
```

### Example 3: Title Validation Report
```bash
# Input: approved issue-list to validate
# Process: Validate all titles
# Output: valid, invalid, and unverified counts
```
