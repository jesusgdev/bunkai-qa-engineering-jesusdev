---
name: adf-conversion-refinement
description: "Convert Markdown content to ADF (Atlassian Document Format) for Jira rich text fields. Use when updating Jira issue descriptions, comments, or other rich text fields that require ADF format. Triggers on: convert to ADF, enrich TC description, update Jira description, format for Jira. Do NOT use for: plain text updates (use /acli), test execution (use /sprint-testing), batch operations (use /batch-jira-operations-refinement)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker]
---

# ADF Conversion Refinement

Convert Markdown content to Atlassian Document Format (ADF) for Jira rich text fields. Ensures consistent formatting, proper structure, and validation before publication.

## Scope

| Use for | Do not use for | Route instead |
|---------|----------------|---------------|
| Single issue ADF conversion | Batch ADF operations | `/batch-jira-operations-refinement` |
| TC Description enrichment | Plain text updates | `/acli` |
| Comment formatting | Test execution | `/sprint-testing` |
| ADF structure validation | Ad-hoc Jira queries | `/acli` |

## Dependencies

- `acli/references/adf-authoring-style.md` — ADF formatting rules
- `md-to-adf.ts` — Markdown to ADF converter script
- `test-documentation/SKILL.md` — TC Description template (§7)

## ADF Structure

### Document Root
```json
{
  "type": "doc",
  "version": 1,
  "content": [...]
}
```

### Supported Block Types

| Type | Usage | Example |
|------|-------|---------|
| `heading` | Section headers | `<h2>`, `<h3>` |
| `paragraph` | Body text | `<p>` |
| `bulletList` | Unordered lists | `<ul>` |
| `orderedList` | Ordered lists | `<ol>` |
| `listItem` | List items | `<li>` |
| `codeBlock` | Code snippets | `<pre><code>` |
| `table` | Data tables | `<table>` |
| `tableRow` | Table rows | `<tr>` |
| `tableCell` | Table cells | `<td>` |
| `panel` | Highlighted boxes | `{panel}` |
| `emoji` | Emojis | `:smile:` |

### Inline Marks

| Mark | Usage | Example |
|------|-------|---------|
| `strong` | Bold | `**text**` |
| `em` | Italic | `*text*` |
| `code` | Inline code | `` `code` `` |
| `link` | Hyperlinks | `[text](url)` |
| `textColor` | Colored text | `{color:red|text}` |
| `backgroundColor` | Background color | `{color:bgYellow|text}` |

## TC Description Template (12 Sections)

```markdown
## Related Story
{{PROJECT_KEY}}-{n} — <Story Title>

## Priority / ROI
- Priority: {Critical|High|Medium|Low}
- ROI score: {number}
- Outcome: {Candidate|Manual|Deferred}

## Prior bugs covered
- {BUG-ID} — <one-line summary>
- (none) if first time

## Test Design

### Preconditions
- <precondition 1>
- <precondition 2>

### Action
<single sentence: what the user does>

### Expected Results
- <assertion 1>
- <assertion 2>

### Gherkin
```gherkin
@{priority} @regression @automation-candidate @{US_ID}
Scenario Outline: should <outcome>
  Given <precondition>
  When <action>
  Then <assertion>
```

## Variables
| Variable | How to obtain |
|----------|---------------|
| `{var}` | `description` |

## Implementation Code
| Layer | File |
|-------|------|
| API component | `tests/components/api/XxxApi.ts` |
| Test file | `tests/integration/xxx/*.test.ts` |

## Architecture
{E2E / Integration / UI-only} — follows KATA layers.

## Available Test IDs
- `[data-testid="xxx"]`

## Refinement Notes
<Discrepancies or empty if none.>
```

## Conversion Process

### Step 1: Prepare Markdown Content
```markdown
## Section 1
Content here

## Section 2
- Item 1
- Item 2
```

### Step 2: Convert to ADF
```bash
bun .claude/skills/acli/scripts/md-to-adf.ts < input.md > output.adf.json
```

### Step 3: Validate ADF Structure
```bash
# Check required fields
jq '.type == "doc" and .version == 1' output.adf.json
# Check section count
jq '.content | map(select(.type == "heading")) | length' output.adf.json
```

### Step 4: Apply to Jira Issue
```bash
curl -s -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
  -X PUT \
  -H "Content-Type: application/json" \
  -d "{\"fields\": {\"description\": $(cat output.adf.json)}}" \
  "$ATLASSIAN_URL/rest/api/3/issue/{KEY}"
```

## Validation Rules

### Structure Validation
- [ ] Root has `type: "doc"` and `version: 1`
- [ ] Content array exists
- [ ] All headings have `level` attribute
- [ ] All lists have `content` array

### Content Validation
- [ ] Section count >= 10 for TCs
- [ ] No empty sections (use "None identified.")
- [ ] Gherkin wrapped in code blocks
- [ ] Tables have proper row/cell structure

### Formatting Validation
- [ ] No broken inline marks
- [ ] Links have valid URLs
- [ ] Code blocks have language specified
- [ ] Emojis use colon syntax

## Common ADF Patterns

### Heading
```json
{
  "type": "heading",
  "attrs": {"level": 2},
  "content": [{"type": "text", "text": "Section Title"}]
}
```

### Bullet List
```json
{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Item"}]}
      ]
    }
  ]
}
```

### Code Block
```json
{
  "type": "codeBlock",
  "attrs": {"language": "gherkin"},
  "content": [{"type": "text", "text": "code here"}]
}
```

### Table
```json
{
  "type": "table",
  "content": [
    {
      "type": "tableRow",
      "content": [
        {"type": "tableCell", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Cell"}]}]}
      ]
    }
  ]
}
```

### Panel
```json
{
  "type": "panel",
  "attrs": {"panelType": "info"},
  "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Info content"}]}]
}
```

## Error Handling

| Error | Cause | Action |
|-------|-------|--------|
| Invalid JSON | Malformed ADF | Regenerate from Markdown |
| Missing sections | Incomplete template | Add missing sections |
| Broken marks | Unclosed inline formatting | Fix mark structure |
| Table errors | Missing rows/cells | Rebuild table structure |

## Engram Updates

After successful conversion, save:
- Pattern: ADF structure for Jira rich text
- Pattern: TC Description template (12 sections)
- Discovery: ADF validation rules

## Subagent Dispatch Strategy

For complex conversions, use subagents:
- **Converter subagent**: Generate ADF from Markdown
- **Validator subagent**: Verify ADF structure
- **Publisher subagent**: Apply to Jira issues

## Examples

### Example 1: TC Description Enrichment
```bash
# Input: Markdown template with 12 sections
# Process: Convert to ADF, validate, apply
# Output: TC with enriched ADF description
```

### Example 2: Comment Formatting
```bash
# Input: Markdown comment content
# Process: Convert to ADF, apply to issue
# Output: Formatted comment on Jira issue
```
