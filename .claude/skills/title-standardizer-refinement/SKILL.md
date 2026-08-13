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

## Title Format Rules

### Standard TC Title Pattern
```
^{STORY_KEY}: TC{NUMBER}: should {EXPECTED_OUTCOME} [{CONNECTOR} {CONDITION}] [given {PRECONDITION}]
```

### Regex Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `^BK-\d+: TC\d+: .+$` | Standard TC format | `BK-34: TC01: should start a Run` |
| `^BK-\d+: TC\d+:` | TC prefix only | `BK-34: TC01:` |
| `^BK-\d+:` | Story prefix only | `BK-34:` |

### Validation Rules

| Rule | Pattern | Notes |
|------|---------|-------|
| Story key prefix | `^BK-\d+:` | Must start with story key |
| TC number | `TC\d+:` | Sequential numbering |
| Description | `should .+` | Must start with "should" |
| Max length | 255 chars | Jira Summary limit |

## Validation Process

### Step 1: Extract Titles
```bash
# Get all TC titles
[TMS_TOOL] test list --project "BK" --limit 300 2>&1 | grep -E "^BK-[0-9]+" > /tmp/all-tcs.txt
```

### Step 2: Validate Format
```bash
#!/bin/bash
VALID=0
INVALID=0

while IFS= read -r LINE; do
  KEY=$(echo "$LINE" | awk '{print $1}')
  TITLE=$(echo "$LINE" | cut -d' ' -f2-)
  
  if echo "$TITLE" | grep -qE "^BK-[0-9]+: TC[0-9]+: .+$"; then
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
  
  # Extract story key
  STORY_KEY=$(echo "$TITLE" | grep -oE "BK-[0-9]+" | head -1)
  
  # Extract TC number
  TC_NUM=$(echo "$TITLE" | grep -oE "TC[0-9]+" | head -1)
  
  # Extract description
  DESC=$(echo "$TITLE" | sed -E "s/^BK-[0-9]+: TC[0-9]+: //")
  
  # Generate corrected title
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
    "$ATLASSIAN_URL/rest/api/3/issue/$KEY" | jq -r '.fields.summary')
  
  if [ "$CURRENT_TITLE" != "$NEW_TITLE" ]; then
    RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.txt \
      -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
      -X PUT \
      -H "Content-Type: application/json" \
      -d "{\"fields\": {\"summary\": \"$NEW_TITLE\"}}" \
      "$ATLASSIAN_URL/rest/api/3/issue/$KEY")
    
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
| Missing TC number | `BK-34: should start a Run` | Add TC01: |
| Wrong format | `BK-34-TC01-should start` | Replace `-` with `: ` |
| Missing "should" | `BK-34: TC01: start a Run` | Add "should" |
| Too long | `BK-34: TC01: should start...very long` | Truncate to 255 chars |

## Reporting

### Validation Report
```
=== Title Validation Report ===
Total TCs: 223
Valid format: 179
Invalid format: 44

=== Invalid Titles ===
BK-320: TC01: should start a Run (missing "should")
BK-321: TC02: start a Run (missing "should")
...
```

### Correction Report
```
=== Title Correction Report ===
Total TCs: 223
Already correct: 179
Corrected: 44
Failed: 0

=== Corrections Applied ===
BK-320: ✓ (BK-320: TC01: should start a Run)
BK-321: ✓ (BK-321: TC02: should start a Run)
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
# Input: BK-320: TC01: should start a Run
# Process: Validate against regex
# Output: Valid ✓
```

### Example 2: Batch Title Correction
```bash
# Input: 44 TCs with invalid titles
# Process: Generate and apply corrections
# Output: 44 TCs with standardized titles
```

### Example 3: Title Validation Report
```bash
# Input: 223 TCs to validate
# Process: Validate all titles
# Output: 179 valid, 44 invalid
```
