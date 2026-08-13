---
name: rate-limit-handler-refinement
description: "Handle API rate limiting with batching, pauses, retry logic, and exponential backoff. Use when performing bulk API operations that may exceed rate limits (Jira Cloud, Xray, other APIs). Triggers on: batch API operations, rate limit handling, bulk processing, API throttling. Do NOT use for: single API calls (use specific skill), test execution (use /sprint-testing), test documentation (use /test-documentation)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker]
---

# Rate Limit Handler Refinement

Manage API rate limiting with intelligent batching, pauses, retry logic, and exponential backoff. Prevents 429 errors and ensures reliable bulk operations.

## Scope

| Use for | Do not use for | Route instead |
|---------|----------------|---------------|
| Bulk API operations (50+ calls) | Single API calls | Specific skill |
| Rate limit prevention | Test execution | `/sprint-testing` |
| Retry logic with backoff | Test documentation | `/test-documentation` |
| Throttling configuration | Ad-hoc queries | `/acli` |

## Rate Limit Rules

### Jira Cloud
| Rule | Value | Notes |
|------|-------|-------|
| Limit | ~10 req/sec/user | Per authenticated user |
| Burst | 20 req/sec | Short bursts allowed |
| Window | 1 minute | Rolling window |
| Penalty | 429 Too Many Requests | Temporary block |

### Xray Cloud
| Rule | Value | Notes |
|------|-------|-------|
| Limit | ~5 req/sec | Per API key |
| Burst | 10 req/sec | Short bursts allowed |
| Window | 1 minute | Rolling window |
| Penalty | 429 Too Many Requests | Temporary block |

## Batching Strategy

### Batch Size Calculation
```
batch_size = min(rate_limit * 0.8, 10)
```

For Jira Cloud: `min(10 * 0.8, 10) = 8` → use batches of 8-10

### Pause Calculation
```
pause_between_issues = 1 / (rate_limit * 0.8)
pause_between_batches = pause_between_issues * batch_size
```

For Jira Cloud:
- Pause between issues: `1 / (10 * 0.8) = 0.125s` → use 0.5s for safety
- Pause between batches: `0.5 * 10 = 5s` → use 1s minimum

### Recommended Settings

| Setting | Jira Cloud | Xray Cloud | Custom |
|---------|------------|------------|--------|
| Batch size | 10 | 5 | `rate_limit * 0.8` |
| Pause between issues | 0.5s | 1s | `1 / (rate_limit * 0.8)` |
| Pause between batches | 1s | 2s | `batch_size * pause_between_issues` |
| Max retries | 3 | 3 | Configurable |
| Backoff multiplier | 2 | 2 | Configurable |

## Retry Logic

### Exponential Backoff
```python
def retry_with_backoff(func, max_retries=3, base_delay=1):
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError:
            delay = base_delay * (2 ** attempt)
            sleep(delay)
    raise MaxRetriesExceeded()
```

### Error Handling Matrix

| Error | Cause | Action | Delay |
|-------|-------|--------|-------|
| 429 | Rate limit | Pause, retry | `base_delay * 2^attempt` |
| 500 | Server error | Retry | `base_delay * 2^attempt` |
| 502 | Bad gateway | Retry | `base_delay * 2^attempt` |
| 503 | Service unavailable | Retry | `base_delay * 2^attempt` |
| 400 | Bad request | Do not retry | Fix request |
| 404 | Not found | Do not retry | Skip issue |

## Implementation Pattern

### Bash Pattern
```bash
#!/bin/bash
BATCH_SIZE=10
PAUSE_BETWEEN_ISSUES=0.5
PAUSE_BETWEEN_BATCHES=1
MAX_RETRIES=3

process_batch() {
    local batch=("$@")
    local count=0
    
    for issue in "${batch[@]}"; do
        ((count++))
        
        # Retry logic
        for attempt in $(seq 1 $MAX_RETRIES); do
            RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.txt \
                -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
                -X PUT \
                -H "Content-Type: application/json" \
                -d "$(generate_payload "$issue")" \
                "$ATLASSIAN_URL/rest/api/3/issue/$issue")
            
            if [ "$RESPONSE" = "204" ]; then
                echo "$issue: ✓"
                break
            elif [ "$RESPONSE" = "429" ]; then
                DELAY=$((PAUSE_BETWEEN_ISSUES * (2 ** (attempt - 1))))
                echo "Rate limited, waiting ${DELAY}s..."
                sleep $DELAY
            else
                echo "$issue: ✗ ($RESPONSE)"
                break
            fi
        done
        
        sleep $PAUSE_BETWEEN_ISSUES
    done
}

# Process in batches
TOTAL=${#ISSUES[@]}
for ((i=0; i<TOTAL; i+=BATCH_SIZE)); do
    BATCH=("${ISSUES[@]:$i:$BATCH_SIZE}")
    process_batch "${BATCH[@]}"
    sleep $PAUSE_BETWEEN_BATCHES
done
```

### Node.js Pattern
```typescript
class RateLimitHandler {
  private batchSize: number;
  private pauseBetweenIssues: number;
  private pauseBetweenBatches: number;
  private maxRetries: number;
  
  constructor(config: RateLimitConfig) {
    this.batchSize = config.batchSize || 10;
    this.pauseBetweenIssues = config.pauseBetweenIssues || 500;
    this.pauseBetweenBatches = config.pauseBetweenBatches || 1000;
    this.maxRetries = config.maxRetries || 3;
  }
  
  async processBatch<T>(
    items: T[],
    processor: (item: T) => Promise<void>
  ): Promise<BatchResult> {
    const result: BatchResult = {
      total: items.length,
      success: 0,
      failed: 0,
      rateLimited: 0
    };
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      
      for (const item of batch) {
        let success = false;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
          try {
            await processor(item);
            success = true;
            result.success++;
            break;
          } catch (error) {
            if (error.status === 429) {
              result.rateLimited++;
              const delay = this.pauseBetweenIssues * Math.pow(2, attempt);
              await this.sleep(delay);
            } else {
              result.failed++;
              break;
            }
          }
        }
        
        if (!success && result.failed === 0) {
          result.failed++;
        }
        
        await this.sleep(this.pauseBetweenIssues);
      }
      
      await this.sleep(this.pauseBetweenBatches);
    }
    
    return result;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Monitoring and Logging

### Progress Indicators
```
=== Rate Limit Handler ===
Total items: 89
Batch size: 10
Total batches: 9

[Lote 1/9] Items 1-10...
  BK-320: ✓
  BK-321: ✓
  ...
  Pause 1s...

[Lote 2/9] Items 11-20...
...

=== Final Report ===
Total processed: 89
Success: 89
Failed: 0
Rate limited: 0
Total time: 45s
Avg time per item: 0.5s
```

### Metrics to Track
- Total items processed
- Success/fail rate
- Rate limit incidents
- Average processing time
- Total execution time

## Configuration

### Environment Variables
```bash
# Rate limiting
RATE_LIMIT_BATCH_SIZE=10
RATE_LIMIT_PAUSE_ISSUES=0.5
RATE_LIMIT_PAUSE_BATCHES=1
RATE_LIMIT_MAX_RETRIES=3

# Jira specific
JIRA_RATE_LIMIT=10
JIRA_BURST_LIMIT=20

# Xray specific
XRAY_RATE_LIMIT=5
XRAY_BURST_LIMIT=10
```

### Config File
```json
{
  "rateLimiting": {
    "jira": {
      "limit": 10,
      "burst": 20,
      "batchSize": 10,
      "pauseBetweenIssues": 500,
      "pauseBetweenBatches": 1000
    },
    "xray": {
      "limit": 5,
      "burst": 10,
      "batchSize": 5,
      "pauseBetweenIssues": 1000,
      "pauseBetweenBatches": 2000
    }
  }
}
```

## Engram Updates

After successful batch operation, save:
- Pattern: rate limiting for Jira Cloud
- Pattern: batch processing with pauses
- Discovery: optimal batch sizes for different APIs

## Subagent Dispatch Strategy

For complex rate-limiting scenarios, use subagents:
- **Orchestrator**: Manages batch progress and pauses
- **Worker subagents**: Process individual batches
- **Monitor subagent**: Tracks rate limit metrics

## Examples

### Example 1: Jira Batch Update
```bash
# Input: 89 TCs to update
# Config: batch_size=10, pause=0.5s issues, 1s batches
# Output: 89 TCs updated, 0 rate limit errors
```

### Example 2: Xray Batch Import
```bash
# Input: 50 test results to import
# Config: batch_size=5, pause=1s issues, 2s batches
# Output: 50 results imported, 0 rate limit errors
```
